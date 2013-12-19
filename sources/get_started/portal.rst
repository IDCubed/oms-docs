:title: OMS Portal Registry and Deployment
:description: How to deploy the OMS Portal Registry
:keywords: OMS, Portal Registry, developers, dev environment

.. _deploy_portal_tcc:

OMS Portal Registry
===================

The Portal TCC is made up of four primary components, we will detail two of
them here in this document as we deploy and set them up - the OMS Portal
Registry, and OpenID Connect (OIDC).


.. _deploy_portal_registry:

Portal User Registry
--------------------

The OMS Portal Registry is a core component of the Private TCC. It stores the
User's Core Identity, all Personas associated with these Core IDs, and various
other details OMS tracks for the User as part of managing their deployed
applications (TABs).


Deploy the Registry
~~~~~~~~~~~~~~~~~~~

Deploying the Portal Registry makes use of the OMS deployment tools and a
special text file known as a manifest.

The manifest used to deploy the Portal Registry configures the oms deployment
tools, providing instructions on what to do to compile and bring the app online.

When ready, deploy the Portal Registry with the oms command line utility:

.. code:: bash

   oms deploy -m PortalRegistry.yaml
   [root@localhost] Executing task '_deploy'
   ...


Once deployed, you ought to be able to view the Portal Registry WebUI with your
browser pointed at https://host.domain.tld/portal_registry/.


.. note::

   The Portal Registry is currently setup to walk users through a demo of the
   New User Registration process included in IDCube'S demonstrations. Creating
   a new or customized version of the User Registry is very easy.


The OMS stack is changing very quickly and how to deploy, use, and customize
the Portal TCC will be documented more clearly in an upcoming release.
