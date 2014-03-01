:title: Getting Started with OMS Importable VM Images
:description: Complete guide to importing and using the importable OMS VM images
:keywords: OMS, get started, intro, documentation, developers, dev environment,
           demos, demonstration, 

.. _importable_vms:

Importable VM Images
====================

Given the complex nature of developing building, and distributing a Holonic
MultiVerse such as the Open Mustard Seed Trusted Compute Framework, we've made
it easy to both build these images, as well as to use them to get up and running
with OMS quickly.

This document will guide you through the processes of selecting the right OMS
appliance for your needs and desires, and to get the VM setup and usable in your
environment with `VirtualBox`_. Please see the :ref:`VM Builder's Guide
<vm_builders_guide>` if you need to know how OMS builds these images.

.. _VirtualBox: https://www.virtualbox.org


Please see the `Guide to Installing VirtualBox </tutorials/install_virtualbox>`_
if you need assistance getting a paravirtualization system installed and setup.


While the images have been built and tested with VirtualBox, other
paravirtualization systems such as VMWare, XEN, Parallels, etc, should all be
capable of running the VM - check for their support of the ``.ova`` file/image
format.


What is Available?
------------------

At present, there are two primary builds available:

#. The **OMS Linux SDK**, a bare-bones OMS development environment based on
   Ubuntu 12.04 LTS. Includes all OMS source code and has been seeded with the
   OMS system automation framework. All other VM images are built off this base.

#. The **TCC Demo**, an all-in-one demoable virtual appliance with a TCC
   pre-installed and setup. This includes OpenID Connect, the CoreID Registry,
   a Registration app, and the Perguntus and GPS Demo data-collection Reference
   TABs.


.. note::

   Developers wishing to get started in developing their own Trusted Application
   Bundles based on the OMS TCF can use either image. We recommend the TCC Demo
   build as it is a simpler starting point for TAB development - the TCC is
   already  installed and setup, running OIDC, a CoreID Registry and the OMS
   Demo TABs deployed and functional for you).


.. _import_vm_image:

Download, Import and Setup
--------------------------

The following steps will guide you through the process to download and set up
the VM image.

A few points before we get started:

* The virtual appliances are created, maintained, and distributed by IDCubed.
* VirtualBox may be run on laptops, workstations, and servers alike, so you
  should have the flexibility needed to meet any constraints imposed by your
  network or environment.
* This process has been developed and tested on laptops with modest hardware
  resources (dual-core, 3 Gb RAM, etc). The guide has been tested on both Debian
  Linux x64 and Windows 7.
* These images are pre-built with a given intention and based on the OMS source
  code - if you would prefer to customize your experience with OMS, please
  :ref:`see this tutorial <kickstart_oms>`.


Get the Image
~~~~~~~~~~~~~

The images are cryptographically signed and made available through the Developer's
Portal hosted by IDCubed.

.. note::

   As OMS is still in a private alpha, please use `this form`_ to request access.

.. _this form: https://alpha.openmustardseed.org/downloads/



Prerequisites
~~~~~~~~~~~~~

.. note::

   **Assumed Knowledge**
  
   * **Editing**: Use text editors from the Linux console, such as Vim or Nano
   * **SSH**: How to use ``ssh`` (or `PuTTY for Windows`_) to access remote
     hosts over the network.
   * **Git**: Basic experience with the Git revision control system.


.. _PuTTY for Windows: http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html


All OMS VM images have the following pre-requisites and initial steps:

* Use `this form`_ to **submit a request for access** to the current release.
  Your request will be reviewed, and you should expect to receive a follow-up
  inquiry by email, from IDCubed. We make every effort to maintain speedy
  responses, though you do have our apologies if we slip.
* **Download the VM Image** you have chosen, either the **TCC Demo** or the
  **Linux SDK** (size varies, with max under 2GB).
* **Install VirtualBox** - OMS has a `Guide to Installing VirtualBox 
  </tutorials/install_virtualbox>`_.
* **Install GPG** - Download `GnuPG`_, `GPG for Windows`_, `GPG options for OSX`_
* **Decrypt the VM Image** - Expect to wait a few minutes, time will depend on
  the resources available to the system decrypting the image.
   - Windows: Right-click on the VM image ending in ``.ova.gpg`` and select
     ``Decrypt and Verify``. Enter the passphrase provided by IDCubed.
   - Linux: ``gpg --decrypt --output <filename>.ova <filename>.ova.gpg``. Provide
     the passphrase from IDCubed when prompted.
* **Import the VM Image** - Double-click the image file ending in ``.ova``, or
  use the VirtualBox graphical interface to import the image. Follow the steps
  of the GUI to complete the process. The import may take a few minutes or more
  to complete. 

.. _GnuPG: http://www.gnupg.org/download/#auto-ref-3
.. _GPG for Windows: http://gpg4win.de/handbuecher/novices_5.html
.. _GPG options for OSX: https://duckduckgo.com/?q=gpg+mac+osx


.. _import_sdk_vm_image:

OMS Linux SDK
-------------

Once the image is imported, follow these steps to setup the development
environment.

.. note::

   This VM is not intended for production use.


Configure and Start the VM
~~~~~~~~~~~~~~~~~~~~~~~~~~

#. In the VirtualBox Manager GUI, Click *settings* > *Network* > and select
   *Attached To: Bridge Adapter*, then click OK. This gives the VM its own
   address on your local network after starting. You are welcome to use NAT, but
   this tutorial does not cover the slight deviations in the process.
#. Click the green *Start* arrow. A window named *OMS [Running]* should open.
#. Wait until you see *dev login:* Enter ``oms`` for user and password.
#. Type ``ifconfig`` and note the IP from line 2 *inet:*. We will use this IP
   when connecting to the VM via SSH and with our browser.
#. On the physical host, use an SSH client (``ssh`` or PuTTY, etc) to connect to
   the OMS VM with ``oms@<IP>``. The default password is ``oms``.
#. Once connected, change the default password for the ``oms`` user. We recommend
   a randomly generated password of 13 or more characters. You do not need to
   remember the complex password. Instead, maintain an encrypted wallet such as
   the cross-platform and open, `keepassx`_.
#. Use ``sudo`` to switch users to the system's root user: ``sudo su -l``.
   Provide the password for the ``oms`` user when prompted.

.. _keepassx: https://www.keepassx.org/


.. _linux_sdk_vm_contents:

SDK VM Contents
~~~~~~~~~~~~~~~

This development environment includes..

* All OMS source code, as described in the `source code map
  </contributing/source_code_map>`_.
* the OMS System Automation Framework, including the *Root Virtual Resource
  Controller*, based on SaltStack and OMS.


**Applications, Frameworks, and Services**

* Python
* Django
* Node.js
* Ruby
* uWSGI
* Nginx
* PostgreSQL
* MongoDB
* SaltStack
* Git


All together, these services and tools are used to orchestrate the OMS deployment
included on the VM.


OMS TCC Demo
------------

.. note::

   This VM is not intended for production use.


.. let's rename this to config_vbox_vm_image, or similar
.. _import_vbox_vm_image:

Configure and Start the VM
~~~~~~~~~~~~~~~~~~~~~~~~~~

#. In the VirtualBox Manager GUI, Click *settings* > *Network* > and select
   *Attached To: Bridge Adapter*, then click OK. This gives the VM its own
   address on your local network after starting. (You're welcome to use NAT, but
   this tutorial does not cover it.)
#. Click the green *Start* arrow. A window named *OMS [Running]* should open.
#. Wait until you see *dev login:* Enter ``oms`` for user and password.
#. Type ``ifconfig`` and note the IP from line 2 *inet:*. We will use this IP
   when connecting to the VM via SSH and with our browser, and we will also
   update a few details in the VM with this IP address.
#. On the physical host, use an SSH client (``ssh`` or PuTTY, etc) to connect to
   the OMS VM with ``oms@<IP>``. The default password is ``oms``.
#. Once connected, change the default password for the ``oms`` user. We recommend
   a randomly generated password of 13 or more characters. You do not need to
   remember the complex password, maintain an encrypted wallet such as the
   cross-platform and open, `keepassx`_.
#. Use ``sudo`` to switch users to the system's root user: ``sudo su -l``.
   Provide the password for the ``oms`` user when prompted.
#. Open ``/var/lib/tomcat7/shared/classes/idoic_config.properties`` for editing
   and update the ``production.configBean.issuer`` parameter to correct the IP
   address. This should be set to the IP address of the VM in the form:
   ``http://<IP>/idoic``
#. Restart Tomcat so this takes effect: ``/etc/init.d/tomcat7 restart``
#. Use your browser to load *http://<IP>/private_registry/admin/* - login with the
   default user ``admin`` and password ``adminadmin``.  Use the *change password*
   link in the admin panel to set a unique password for this user. If you end up
   on a different page, double-check to ensure you included the trailing slash
   in the URL.
#. Browse to *http://<IP>/private_registry/admin/constance/config/* and update the
   following two config keys:
    - ``OIDC_BASE_URL``: *http://<IP>/idoic/*
    - ``TOKENSCOPE_ENDPOINT``: *http://<IP>/idoic/tokenscope?scope=private_registry_ui*
#. Log out of the admin panel

.. _keepassx: https://www.keepassx.org/


OpenID Connect and the User Registry are now set up to connect to each other.


.. _tcc_demo_vm_contents:

Demo VM Contents
~~~~~~~~~~~~~~~~

This development environment includes..

**A Private Trusted Compute Cell, containing:**

* A (Private) User Registry to store your identity
* An OpenID Connect server for authorization/authentication
* Two example Trusted Application Bundles: Perguntus and the GPS Demo
* All OMS source code: oms-admin, oms-deploy, oms-core, oms-experimental,
  oms-docs, oms-ui, salt-common, salt-non-common, python-mitreid, and idoic


**Applications, Frameworks, and Services**

* Python
* Django
* Node.js
* Ruby
* uWSGI
* Nginx
* PostgreSQL
* MongoDB
* SaltStack
* Git


All together, these services and tools are used to orchestrate the OMS deployment
included on the VM.



Run the Private TCC Demo
------------------------

The Private TCC deployed on this VM includes two applications which demonstrate
how to integrate OpenID Token Authorization into an app, as well as examples of
apps built on the OMS framework.


There are four applications running in the Private TCC on the VM:

**User Registry**: *http://<IP>/private_registry/* - stores the Core Identity
and associated personas, acting as the backend storage for OpenID Connect.

**OpenID Connect (OIDC)**: *http://<IP>/idoic/* - grants and validates tokens to
clients and personas associated with a Core Identity.

**Perguntus**: *http://<IP>/PerguntusUI/* - Quantified Self Demo Application

**GPS Demo**: *http://<IP>/GPSUI/* - If-Then-Script demo based on GPS location and
proximity.


Set up the User Registry
~~~~~~~~~~~~~~~~~~~~~~~~

First we set up the Core Identity, then we authorize a few tokens for the User
Registry to use as it operates on our behalf.

#. Browse to *http://<IP>/private_registry/*. You ought to see a form to set up your
   Core Identity with the User Registry (in your Private TCC, Trusted Compute
   Cell). First, provide your username and password, you will use these when
   authenticating with OpenID Connect (OIDC). Then, update the Persona for OIDC
   to associate with this Core ID.
#. With the Core ID set up, the Registry will redirect you to OpenID Connect to
   authorize a token for the Registry to use when it makes requests of OIDC. This
   is the first time OIDC has seen your client, so it asks you to authenticate.
   Use the username and password you chose for your Core ID.
#. OpenID Connect will then ask you to authorize a token, granting the bearer of
   that token access to the *OpenID Login* and *superclient* scopes. This token
   will be stored and used by the User Registry (the backend).
#. After authorizing that token and returning it to the User Registry, you will
   be taken to the Trust Frameworks page. The UI will detect that it does not
   have a token, and it needs one to verify its authenticity to the APIs provided
   by the User Registry. It will request that you authorize one for it to use.
   OpenID Connect will request your permission to return a token granting the UI
   the *private_registry_ui* scope.


Set up Perguntus and GPS Demo TAB
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The TABs have been deployed to the VM, there are only a few minor updates needed
for the Apps to communicate properly with one another. For each of these admin
panels, use the same default credentials previously noted.

#. Browse to *http://<IP>/PerguntusBackend/admin/constance/config/* and update
   the IP in the ``PERGUNTUS_PDS_SERVER`` and ``EMAIL_RECIPIENT`` config keys.
#. Browse to *http://<IP>/GPSDemoPDS/admin/constance/config/* and update the IP
   in the ``TOKENSCOPE_ENDPOINT`` config key.
#. Browse to *http://<IP>/GPSUI/admin/constance/config/* and update the IP in
   the ``OIDC_BASE_URL`` config key.

Both GPS and Perguntus Demos will request tokens to access the APIs. You can see
each demo best through their respective UI, eg *http://<IP>/PerguntusUI/* and
*http://<IP>/GPSUI/*.

.. note::

   The demo on the VM is not optimized for interacting with a user on a cell phone
   (as with our deployments in the cloud), but we will update this documentation
   once the VM has been updated to do.


Using the VM for Development
----------------------------

If you would like to interact with the OMS repositories on GitHub, you will want
to add an SSH keypair to the VM and GitHub. This is not required to use the demo
included in the VM, and is only necessary if you wish to update the code on the
VM or push changes to a new repository of your own:

#. Create your GitHub public/private key with ``ssh-keygen``, and hit enter
   through all the prompts.
#. Finally, get your GitHub key with ``cat /home/oms/.ssh/id_rsa.pub``, then `add
   the key to your GitHub account`_.

.. _add the key to your GitHub account: https://github.com/settings/ssh


Need one-on-one assistance?
---------------------------

If you need more help then hop on to the `#oms IRC channel on freenode
<irc://chat.freenode.net#oms>`_.
