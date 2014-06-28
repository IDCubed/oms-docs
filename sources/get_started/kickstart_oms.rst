:title: Initial OMS Deployment
:description: How to take your first steps with OMS deployment
:keywords: OMS, deployment, developers, dev environment

.. _kickstart_oms:

Initial Deployment
==================

Getting started is easy, you'll need a new/clean host running Ubuntu 12.04 LTS.
This can be either a VM running locally, or in the cloud, or even a *bare metal*
server.

OMS appreciates automation, but does not want this to limit flexibility or an
ability to change the details. OMS is a holonic, layered system. The automation
framework has unique constraints, requiring respect for the both generic nature
of reality as well as the the autonomous and self-directing nature of each new
instance of an OMS Cell.

Thus, the oms-kickstart utility strives to meet unique needs within the initial
deployment process of a new OMS TCC, but does so in a generic way - by defining
a generic build framework based on SaltStack and python (with a little bash glue
for remote deploys) and then using this framework to define the needs of the
OMS build process..

This document assumes you want to build new instances of OMS TCC. While
relatively simple - especially for what the automation system is doing for you -
this is an advanced topic. If you would like to explore the OMS system through a
ready-made appliance, please see :ref:`this tutorial <deploy_development_vm>`.

.. note::

   The following process will assume your GitHub user has access to the
   repositories listed in the :ref:`Source Code Map <oms_source_code_map>`.


Run OMS-Kickstart
-----------------

OMS can be deployed to a new host as either a TCC, or limited to the core
development platform. In either case, the deployment of the OMS Cell is a
multi-stage process that is initiated with the help of the utilities in
oms-kickstart.


Get oms-kickstart
~~~~~~~~~~~~~~~~~

Clone or upload the oms-kickstart repository, either to the host you would like
to run the build on, or to another host you would like to run the build from.
It is possible to initiate the build process on a remote host, over SSH, but
this document will start off assuming we are running a local build.

.. There are two primary ways to run oms-kickstart:
..
.. #. Upload and launch a kickstart process to a remote host;
.. #. Launch a kickstart process locally.
..
.. In either case, it is easier to leverage the power of this build framework if you
.. have the complete oms-kickstart repository cloned to a host to work from. If you
.. need minimal, you can launch the kickstart process with only a copy of `the
.. kickstart script`_ and `a config`_ to the OMS host you are deploying to.
..
.. .. _the kickstart script: https://github.com/IDCubed/oms-kickstart/blob/qa-develop/kickstart-oms.py
.. .. _a config: https://github.com/IDCubed/oms-kickstart/blob/master/config/packer.yaml


.. todo::

   There are a couple of things we ought to do here:
   * first, these docs on how to use oms-kickstart ought to be moved to the doc
     project in the oms-kickstart repo.
   * next, this doc should reference that content in the oms-kickstart docs, at
     each point that it is needed.
   * lastly, this document ought to be focused on initiating a new TCC


Create an SSH Key
~~~~~~~~~~~~~~~~~

Create an SSH key with ``ssh-keygen``, saved to ``/root/.ssh/id_rsa``, and do
not use a passphrase for the key. A future release of OMS will allow you to do
so - at present, a passphrase will prevent OMS' automation from working properly.

If you have uploaded the oms-kickstart repository with a key included, copy it
over (instead of using *ssh-keygen* as noted above), and ensure it has the
correct permissions for SSH:

.. code::

   # cp config/keys/id_rsa* /root/.ssh/``
   # chmod 600 /root/.ssh/id_rsa*


Upload SSH pub key to GitHub
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Add the public key to your GitHub account, you can view the key with: ``cat
/root/.ssh/id_rsa.pub``. To add the key to your account, navigate to ``Account
settings`` in the GitHub web UI and then ``SSH keys`` in the navigation bar on
the lefthand side.

With the public key in GitHub, OMS will be able to checkout its code on your
behalf, and we are now ready to run the kickstart script.


Double Check Hostname
~~~~~~~~~~~~~~~~~~~~~

It is easier to change this now, so double check that your hostname is correct.
In particular, if you are using DNS or SSL, you will want the system hostname
to be set to the ``host.domain.tld`` you intend on using to access the OMS Host.

Use ``hostname`` to confirm the system's current hostname. Edit ``/etc/hosts/``
and ``/etc/hostname`` if you need to update it.


Review/Update Deploy Manifest
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The oms-kickstart repository includes a number of complete deploy manifests
(YAML configuration) for the generic kickstart build system. These can be used
for different purposes, to run specific repositories through QA, build VM images
with packer, etc.


**Which manifest to use?**

Open the manifest you wish to base your deployment on. For a build based on the
latest stable release, you will want to edit the `config/pillar/release.yaml`_
manifest.


.. note::

   If you wish to really dig deep into and customize the build or the framework,
   `config/packer.yaml`_ is a good reference to base a new manifest on - it
   includes the combination of what is defined through both the
   `config/release.yaml`_ and `config/pillar/release.yaml`_ manifests.

.. _config/packer.yaml: https://github.com/IDCubed/oms-kickstart/blob/master/config/packer.yaml
.. _config/pillar/release.yaml: https://github.com/IDCubed/oms-kickstart/blob/master/config/pillar/release.yaml
.. _config/release.yaml: https://github.com/IDCubed/oms-kickstart/blob/master/config/release.yaml



**Edit the manifest, set the hostname**

We will Use `config/pillar/release.yaml`_ as our starting point.

Search for the *deploy_defaults* key and it's subkey *hostname*. Uncomment these
two keys to enable them, then update the hostname defined to match what you are
using (for DNS) to access the host.

.. note::

   Be sure to maintain the correct indentation, and to use spaces (not
   tabs), when making changes to the YAML manifest in oms-kickstart.. otherwise,
   you may end up with cryptic errors later.

Our updated section is as shown here:

.. code::

             # default values for deploy.conf
             # you _MUST_ at the least, uncomment the next two lines, and update
             # the hostname, this should match the DNS entry for the host
             deploy_defaults:
                hostname: qa.openmustardseed.org


Your hostname will be different, update it accordingly.


**Editing the manifest (continued) - what to deploy?**

This document assumes you wish to deploy the core of the OMS Cell for
development, rather than the complete reference TCC.

The core of the development platform includes:

* the core of the system automation framework (Root VRC),
* the OMS deploy and administrative utilities,
* all of the OMS source code.


The reference TCC includes the core platform noted above, as well as:

* OpenID Connect for authorization, authentication, and token management,
* the OMS CoreID and Persona reference implementation.


The complete reference TCC is what the default manifest will instruct
oms-kickstart to setup, so skip this next section if you would like to have this
TCC deployed for you now.

You can also deploy the development platform as detailed below, if you wish to
start with a simpler base. It is possible (and easy) to add the reference TCC,
or another TCC of your creation - this is a simple process that is outlined in
additional documentation (referenced at the end of this document).


**Declare what to deploy**

By default, the *release* manifest instructs the Root VRC to deploy the reference
TCC. Search for *oms-tcc-small-community*, defined as a list item in the
*reclass:localhost:classes* key, and comment this out to disable the manifest
from being applied by the Root VRC.

The *fullstack* and *oms-admin* manifests should be listed a couple lines below
this. Uncomment the *oms-admin* manifest, this will include the core of the
framework needed for development. Include the *fullstack* manifest as well, if
you wish to add the core of the webapp hosting framework (needed if you wish to
deploy any of the reference TABs or related manifests).

In the end, this section of our manifest has been updated as shown here:

.. code:: yaml

     # reclass helps keep us sane
     reclass:
       localhost:
         # seed reclass' equivalent of salt master tops for this host
         classes:
         # - oms-tcc-small-community
         # or, instead of the reference TCC, you can comment out the above, and
         # enable the two below to build the OMS TCF without the TCC, for dev.
           - fullstack
           - oms-admin
         # seed reclass' node-specific config keys for salt pillar
         # ...

If you need to, upload these updated configs to the host where kickstart will
be run.


Run the Script
~~~~~~~~~~~~~~

Given the details of how SSH and long-running processes work, it is best to
initiate the kickstart build from within an instance of tmux, so first start tmux
with: ``tmux``. A full tmux tutorial is beyond the scope of this document, though
you do not really need to be a tmux ninja for kickstart to get its needs met.

If you want to be able to benefit from the basics tmux has to offer, here are a
few helpful details:

* If you lose your connection to the VM, you can simply login again and run
  ``tmux att``. Find lost sessions with ``tmux list-sessions``.
* Commands are prefixed with a modifier, ``Ctrl-b`` by default.
* You can separate from a running instance, to reattach later, with:
  ``Ctrl-b,d``.
* Create a new window with ``Ctrl-b,c`` (*create*), and switch between with
  ``p``, ``n``, and ``l``, for *previous*, *next* and *last*, respectively.
* Exit tmux by closing all open windows (exit the shell with ``exit``).


With tmux open, change to the root of the oms-kickstart directory uploaded (or
cloned, if you used Git) to the host, then run the script with:

.. code::

   # cd ~/oms-kickstart/
   # python kickstart-oms.py -H -c config/release.yaml -c config/pillar/release.yaml


You are now good to go grab a fresh beverage and/or entertain yourself for 10
minutes or so. Once complete, the VM ought to be completely setup and ready for
either additional webapp deployments or for you to start hacking away!

.. note::

   If you initiate the kickstart process above, but do so outside of tmux, you
   may have the SSH session interrupted when the OMS system automation enables
   and sets up the firewall with *ufw*. Given how SSH, forking, and the shell
   all work, a terminated session would kill the kickstart process.


What has this just done?
~~~~~~~~~~~~~~~~~~~~~~~~

The kickstart script has:

* installed the salt-minion package and its dependencies,
* configured salt-minion to run in *masterless* mode (eg local, no master),
* used salt-minion to apply a set of base states, installing Git and running
  through some basic *first steps* to update the salt-minion with formula
  from the oms-salt-core and oms-salt-tcf Git repositories. Salt's pillar is
  seeded with a bootstrap.sls (from the manifest provided to oms-kickstart),
  and the salt-minion service re-synced to be up-to-date (after all those
  changes).
* The update salt-minion was then used to install and setup the Root VRC. This
  core component on the host is based on the salt-minion already installed, the
  formula in the oms-salt-core and oms-salt-tcf Git repositories, and reclass.
* Use the Root VRC to update the host with the TCF and TCC specified in the
  manifest provided to oms-kickstart. Use *state.highstate* to provision the
  host with all of the services, packages, configuration, and fluff that is
  needed on this instance of an OMS host.

.. note::

    All Git repositories have been checked out with the ``master`` branch, and
    you may need to update the active revision depending on what you need to do.


At this point, you have *everything* needed to either hack on OMS code, or to
deploy additional OMS components - this next section on SSL setup is optional.


Domain and SSL Setup
--------------------

While the details of these steps may vary slightly depending on your environment
(eg, running OMS in the cloud versus in a local virtualbox VM), let's take one
final step before deploying additional OMS components.

If running OMS in the cloud, it is best to setup hosts running OMS with both a
domain and an SSL certificate, and if running multiple hosts, a wildcard SSL
certificate in particular.

You will want to update ``/etc/nginx/sites-available/default`` to correct the
domain (replace ``localhost`` with your domain, eg: ``host.domain.tld``), as
well as the SSL configuration. Once complete, the vhost config ought to include
the following, replacing ``HOST.DOMAIN.TLD`` with the value for your domain:

.. code::

   server {

       listen  443 default ssl;
       listen  80;

       ssl_certificate      /etc/nginx/ssl/DOMAIN.TLD.crt;
       ssl_certificate_key  /etc/nginx/ssl/DOMAIN.TLD.key;

       ssl_ciphers RC4:HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 10m;

       server_name  HOST.DOMAIN.TLD;

       root /var/www/default/;
       index  index.html;

       include /etc/nginx/proxy.conf;
       include /etc/nginx/conf.d/default/*.location;

   }

.. z*
.. this comment above keeps bad syntax highlighting from going crazy over the *


Alternatively, if the SSL certificate configuration included above does not
match the files you have on hand, the following may be simpler for the format
of the certificates you have:

.. code::

   server {

       ...

       ssl_certificate /etc/ssl/DOMAIN_TLD/chained_ca.crt;
       ssl_certificate_key /etc/ssl/DOMAIN_TLD/server.pem;
       ssl_client_certificate /etc/ssl/DOMAIN_TLD/ca.crt;

       ...
   }


After updating, test the changes with ``nginx -t``, and if nginx confirms the
updates are acceptable, reload the nginx config with ``nginx -s reload``.

You will also need to open the SSL port in the firewall: ``ufw allow 443``.


.. note::

   Some SSL configuration may require that you concatenate the CA and host
   certificates. EG, you may need run run cat similar to:

     cat /path/to/ca.crt >> /etc/nginx/ssl/HOST.DOMAIN.TLD.crt


OMS deploy.conf
~~~~~~~~~~~~~~~

The default kickstart process will install various snippets of OMS on the host -
one of these is ``deploy.conf``, found in ``/var/oms/etc/``.

This simple, YAML-formatted configuration file is read by the oms deployment and
administrative utilities to use as a context dictionary when rendering the
manifest as a template. That is to say, variables defined in a manifest for an
OMS TAB would be populated with values from ``deploy.conf``.

If you are not using SSL, open ``/var/oms/etc/deploy.conf`` for editing and
update ``ssl_enabled`` to ``False``.

.. note::

   Running ``state.sls`` or ``state.highstate`` as directed by some steps in
   some OMS tutorials may overwrite changes to ``deploy.conf`` - always use
   ``test=True`` when using ``salt-call`` to confirm if any changes you have
   made would be overwritten.


Some OMS TABs may require updates be made to `deploy.conf` - this is fine. If
you would like the values to persist in the face of OMS System Automation, add
the updates to the `deploy_defaults` config key in the salt pillar config:
`/etc/salt/pillar/bootstrap.sls`.


Where to go from here?
----------------------

The answer will depend on what you wish to do with OMS.

If you simply want a development environment, you've got what you need to start
hacking, and you ought to jump over to the :ref:`OMS Tutorials <tutorials>`. If
you plan to leverage OMS' OpenID Connect, CoreID or Persona implementations (in
the TABs you create), follow the guide to setup the default :ref:`OMS Trusted
Compute Cell (TCC) <deploy_private_tcc>`.


Customizing OMS-Kickstart
-------------------------

The kickstart script is very flexible and will allow you to customize the salt
states that are used to control the state of the OMS host you are provisioning
and bootstrapping with OMS.

Details of how to do this are included in `the OMS-Kickstart README`_

.. _the OMS-Kickstart README: https://github.com/IDCubed/oms-kickstart/blob/qa-develop/README.rst

