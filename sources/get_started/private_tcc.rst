:title: OMS Private Registry Deployment
:description: How to deploy the OMS Private Registry
:keywords: OMS, Private Registry, developers, dev environment

.. _deploy_private_tcc:

OMS Private Trusted Compute Cell (TCC)
======================================

The Private TCC is made up of four primary components, we will detail two of
them here in this document as we deploy and set them up - the OMS Private
Registry, and OpenID Connect (OIDC).


.. _deploy_private_registry:

Private User Registry
---------------------

The OMS Private Registry is a core component of the Private TCC. It stores the
User's Core Identity, all Personas associated with these Core IDs, and various
other details OMS tracks for the User as part of managing their deployed
applications (TABs).


Deploy the Registry
~~~~~~~~~~~~~~~~~~~

Deploying the Private Registry makes use of the OMS deployment tools and a
special text file known as a manifest.

The manifest used to deploy the Private Registry configures the oms deployment
tools, providing instructions on what to do to compile and bring the app online.

In a future release there will be no need to edit the manifest before it us used
to deploy the app it describes. For now though, there are a few details you will
need to edit prior to deploying the Private Registry (these can also be changed
post-deploy).

Open the manifest for editing:

.. code:: bash

   # this is where you'll find most OMS manifests
   cd /var/oms/src/oms-core/manifests
   # update config in Private Registry manifest
   vim PrivateRegistry.yaml

Each of the URLs you see should be updated to reflect the host you are deploying
to. EG, https://host.domain.tld, or the non-SSL version if not using SSL, or the
IP address if not using DNS.

If you are not using SSL, update ``enable_ssl`` to ``False``.

When ready, deploy the Private Registry with the oms command line utility:

.. code:: bash

   # specify `localhost` when prompted for a host
   oms deploy -m PrivateRegistry.yaml
   No hosts found. Please specify (single) host string for connection: localhost


Once deployed, you ought to be able to view the Private Registry WebUI with your
browser pointed at https://host.domain.tld/private_registry/.


.. note::

   The Private Registry is currently setup to walk users through a demo of the
   Core ID, Persona, and Token/Scope concepts with OIDC and the user registry.

   Do NOT start this process until you have the Private Registry AND OIDC
   deployed. EG: Continue with the next section before submitting the form you
   see when loading the Private Registry UI.


.. _deploy_oidc:

OMS OpenID Connect (OIDC)
-------------------------

Open ID Connect (OIDC) will be documented in more detail in another section.
Here we will cover the deployment and initial configuration of OIDC, as a
primary component within the Private TCC.


.. note::

   The OIDC database user defaults to ``oidc``, and by default, the OMS system
   automation will generate a random, 23 character password. If you would prefer
   to use a different password, or to change the OIDC database user, you will
   need to update the following file ``/etc/salt/pillar/oms/init.sls``. You will
   find the ``oidc`` and ``db`` keys towards the bottom of the file. Complete
   this prior to deploying the OIDC server.


Deploy the OIDC Server
~~~~~~~~~~~~~~~~~~~~~~

If you have followed the steps outlined in :ref:`initial deployment
<oms_deployment>`, you can deploy OIDC with salt:

.. code:: bash

   salt-call --local state.sls oidc


.. note::

   If you wish to control the git revision used to deploy OIDC, you will need to
   build and deploy a WAR rather than use the currently hosted version. Details
   will be documented in a coming release.


Server Config
~~~~~~~~~~~~~

Once complete, we will need to make a few adjustments and restart OIDC:

* first, open ``/var/lib/tomcat7/shared/classes/idoic_config.properties``
* if an SSL certificate and resolvable domain name were setup during initial
  deployment, edit the ``issuer`` property to be of the form
  ``https://host.domain.tld/idoic/``
* double check that the ``serverUrl`` property is ``http://localhost/``, if the
  user registry was deployed to a different host, update this URL accordingly.
* save the file and restart tomcat and OIDC with: ``/etc/init.d/tomcat7
  restart``


.. note::

   If HTTP requests fail, and you are using SSL, ensure you have opened the port
   with ``ufw allow 443``.


You should now be able to browser to either https://host.domain.tld/idoic/, or
the non-SSL equivalent, as you setup.


Client and Scope Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The OIDC source includes SQL scripts for this, and the OMS deployment process
includes all source code needed, so let's get to it:

.. code::

   # use postgres user to skip db authentication
   su -l postgres
   # all OMS source is found here
   cd /var/oms/src
   # OIDC is deployed on postgres by default, use these scripts
   cd oidc/env/database/postgresql
   psql -v role=oidc oidc < insert-idoic-demo-client.sql
   psql -v role=oidc oidc < insert-private-registry-client.sql


.. note::

   If you set a custom user for the OIDC database (overriding the default of
   ``oidc``), update the role specified in the ``psql`` commands provided here.


.. note::

   If you will continue on to setup and run through the GPS and Perguntus demos
   included in OMS, you will want to run the SQL scripts to insert the clients
   needed by these apps. eg:

     psql -v role=oidc oidc < insert-perguntus-ui-client.sql

     psql -v role=oidc oidc < insert-gps-demo-client.sql


With these clients included in OIDC, you may now proceed to run through the Core
Identity and OIDC persona setup.


Core Identity and OIDC Persona Setup
------------------------------------

This setup process is very easy, but the underlying implementation (which was
intended for demoing) is a little quirky, and limits the user to *one* CoreID.

This will likely change in the next OMS release.

Start the setup process on the Private Registry, the root URL will automatically
redirect you to the CoreIDs page, and this will present you with a form to fill
out. Enter your chosen ID and password, these will be stored in the User
Registry as a django user object. When OIDC needs to authenticate a User, it
will actually ask the User Registry to confirm the credentials.

When you save the Core ID form, you will be presented with a another form to
complete. This creates a Persona that includes the profile attributes OIDC
expects to find. All required fields are included in the first step of the form
with all optional attributes in the second step.

Once you complete this form, you will be redirected to OIDC to authorize your
first token. As part of the request to authorize the token, OIDC realizes it
has not seen you before and first needs to authenticate you. As noted, OIDC will
confirm these credentials with the User Registry, so enter the user/password
you provided as your Core Identity.

A successful login should then have you authorize a Token with the openid and
superclient scopes. These scopes will allow the User Registry to operate on your
behalf (creating additional clients and scopes as needed when you choose to
deploy additional TABs).

.. note:: At present, the User Registry does not actually use the superclient
          scope to manage clients and scopes for you, but a future release of
          OMS will add this functionality.

After authorizing the token, OIDC will redirect you back to the Core IDs page
on the Private Registry. The page will recognize that you have already setup
your Core Identity, OIDC persona, and that it has the token it needs (saved in
the backend), and so it will redirect you to the Trust Frameworks page where
you can review TABs you might want to deploy.

.. note:: At present, the Trust Frameworks page is primarily setup for demoing
          OMS capabilities, and will change significantly in the next release.
          As currently setup, there nothing functional you may do with it.

You have completed the setup required for a Private Trusted Compute Cell, and
you may now continue with any of the :ref:`OMS Tutorials <tutorials>`.
