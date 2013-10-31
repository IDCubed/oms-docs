:title: Setting Up a Dev Environment
:description: Guides on how to contribute to OMS
:keywords: OMS, documentation, developers, contributing, dev environment


.. _deploy_development_vm:

Setting Up the Development VM
=============================

To make it easier to hack on and create OMS apps, we provide a standard
development environment. This is based off the master branch of each repo within
the OMS source, and is distributed as a Virtual Appliance.

This tutorial will guide you through the steps to use VirtualBox to import and
set up this applicance as a VM suitable for development on the OMS framework. The
guide has been tested on Debian Linux x64 and Windows 7.

:ref:`See this section <vm_contents>` at the end of the document, for a list of
what is included in the environment.

.. note::

   This VM is not intended for production use.


.. note::

   **Assumed Knowledge**
  
   * **Editing**: Use text editors from the Linux console, such as Vim or Nano
   * **SSH**: How to use ``ssh`` (or `Putty for Windows`_) to access remote
     hosts over the network.
   * **Git**: Basic experience with the Git revision control system.


.. _Putty for Windows: http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html


Install and Setup
-----------------

The virtual appliance is created, maintained, and distributed by IDCubed. Follow
the steps below to download and setup the VM for local development. If you would
prefer to experience OMS running in the cloud, :ref:`see this tutorial
<kickstart_oms>`.

.. The images are cryptographically signed and made available through the Developer's
   Portal hosted by IDCubed. `Register to get access to the environment`_.

.. _Register to get access to the environment: https://dev-portal.idhypercubed.org/


Get Started - Prerequisites
~~~~~~~~~~~~~~~~~~~~~~~~~~~

* **Download** `VirtualBox`_, `GnuPG`_, and the `Tab Development Environment VM
  Image`_ (size 2GB)
* **Install VirtualBox** - See the `VirtualBox User Manual`_
* **Install GPG** - `GPG for Windows`_, `GPG options for OSX`_
* **Decrypt the VM Image** - Expect to wait a few minutes, time will depend on
  the system decrypting the image.
   - windows: Right click on ``<vm_file_name>.gpg`` and select ``Decrypt and
     Verify``. Enter the passphrase provided by IDCubed.
   - linux: ``gpg --decrypt --output <vm_file_name>.ova``. Provide the
     passphrase from IDCubed when prompted.
* **Install VM Image** - Open ``<vm_file_name>.ova`` then click ``import`` in
  the GUI that appears.


.. _VirtualBox: https://www.virtualbox.org/wiki/Downloads
.. _GnuPG: http://www.gnupg.org/download/#auto-ref-3
.. _TAB Development Environment VM Image: http://cc2ccf5e7eb9a36051d5-392f3ef49dd2dccea95976ef735392f9.r21.cf1.rackcdn.com/OMS-SDK-v0.8.1-20130930.ova.gpg
.. _VirtualBox User Manual: https://www.virtualbox.org/manual/UserManual.html
.. _GPG for Windows: http://gpg4win.de/handbuecher/novices_5.html
.. _GPG options for OSX: https://duckduckgo.com/?q=gpg+mac+osx
.. _linux link?: http://example.com


.. todo:: find a doc on installing gpg for linux? differet for each distro..


Configure and Start the VM
~~~~~~~~~~~~~~~~~~~~~~~~~~

#. In the VirtualBox Manager GUI, Click *settings* > *Network* > and select
   *Attached To: Bridge Adapter*, then click OK. This gives the VM its own
   address on your local network after starting. (You're welcome to use NAT, but
   this tutorial does not cover it.)
#. Click the green *Start* arrow. A window named *OMS [Running]* should open.
#. Wait a minute or two until you see *dev login:*.  Enter ``oms`` for user and
   password.
#. Type ``ifconfig`` and note the IP from line 2 *inet:*. We will use this IP
   when connecting to the VM via SSH and with our browser, and we will also
   update a few details in the VM with this IP address.
#. On the physical host, use an SSH client (``ssh`` or putty, etc) to connect to
   the OMS VM with ``oms@<IP>``. The default password is ``oms``.
#. Once connected, change the default password for the ``oms`` user. We recommend
   a randomly generated password of 13 or more characters. You do not need to
   remember the complex password, maintain an encrypted wallet such as the
   cross-platform and open, `keepassx`_.
#. Open ``/var/lib/tomcat7/shared/classes/idoic_config.properties`` for editing
   and update the ``production.configBean.issuer`` parameter to correct the IP
   address. This should be set to the IP address of the VM in the form:
   ``http://<IP>/idoic``
#. Restart tomcat so this takes affect: ``/etc/init.d/tomcat7 restart``
#. Use your browser to load http://<IP>/private_registry/admin/ - login with the
   default user ``admin`` and password ``adminadmin``.  Use the *change password*
   link in the admin panel to set a unique password for this user.
#. Browse to http://<IP>/private_registry/admin/constance/config/ and update the
   following two config keys:
    - ``OIDC_BASE_URL``: *http://<IP>/idoic/*
    - ``TOKENSCOPE_ENDPOINT``: *http://<IP>/idoic/tokenscope?scope=private_registry_ui*
#. Logout of the admin panel


OpenID Connect and the User Registry are now setup to connect with each other.

If you would like to interact with the OMS repositories on github, you will want
to add an SSH keypair to the VM and github. This is not required to use the demo
included in the VM, and is only necessary if you wish to update the code on the
VM or push changes to a new repository of your own:

#. Create your Github public/private key with ``ssh-keygen``, and hit enter
   through all the prompts.
#. Finally, get your Github key with ``cat /home/oms/.ssh/id_rsa.pub``, then `add
   the key to your github account`_.

.. _keepassx: https://www.keepassx.org/
.. _add the key to your github account: https://github.com/settings/ssh


.. _vm_contents:

VM Contents
~~~~~~~~~~~

This development environment includes..

**A Private Trusted Compute Cell, containing:**

* A (Private) User Registry to store your identity
* An Open ID Connect server for authorization/authentication
* Two example Trusted Application Bundles, Perguntus and the GPS Demo
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


There are four Applications running in the Private TCC on the VM:

**User Registry**: *http://<IP>/private_registry/* - stores the Core Identity
and associated personas, acting as the backend storage for OpenID Connect.

**OpenID Conenct (OIDC)**: *http://<IP>/idoic/* - grants and validates tokens to
clients and personas associated with a Core Identity.

**Perguntus**: *http://<IP>/PerguntusUI/* - Quantified Self Demo Application

**GPS Demo**: *http://<IP>/GPSUI/* - If-Then-Script demo based on GPS location and
proximity.


Setup the User Registry
~~~~~~~~~~~~~~~~~~~~~~~

First we setup the Core Identity, then we authorize a few tokens for the User
Registry to use as it operates on our behalf.

#. Browse to *http://<IP>/private_registry/*. You ought to see a form to setup your
   Core Identity with the User Registry (in your Private TCC, Trusted Compute
   Cell). First, provide your username and password, you will use these when
   authenticating with OpenID Connect (OIDC). Then, update the Persona for OIDC
   to associate with this Core ID.
#. With the Core ID setup, the Registry will redirect you to OpenID Connect to
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


Both GPS and Perguntus Demos will request tokens to access the APIs.

The Demo on the VM is not optimized for interacting with a user on a cell phone
(as with our deployments in the cloud), but we will update this documentation once
the VM has been updated to do.


Need one-on-one assistance?
---------------------------

If you need more help then hop on to the `#oms IRC channel on freenode
<irc://chat.freenode.net#oms>`_.