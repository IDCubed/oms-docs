:title: Set Up the OMS Demo/Dev VM Environment
:description: Import and Set Up OMS VM
:keywords: OMS, documentation, demos, developers, contributing, dev environment


.. _deploy_development_vm:

Setting Up the OMS Demo/Development VM
======================================

We provide a standard development environment to make it easier to experience
what OMS has to offer right now. These images are created with each release and
distributed as virtual appliances.

This tutorial will guide you through the steps to use VirtualBox to import and
set up this appliance as both a demo of the Open Mustard Seed framework, and a
VM suitable for development. The guide has been tested on Debian Linux x64 and
Windows 7.

To assist your exploration and experimentation, a complete demo of the OMS
CoreID and Personas implementation is available on the VM, as well as all OMS
source code. :ref:`See this section <vm_contents>` at the end of the document,
for a more complete list of what is included in the current image.


Installation and Setup
----------------------

The virtual appliance is created, maintained, and distributed by IDCubed. Follow
the steps below to set up and explore the VM.

If you would prefer to experience OMS running in the cloud, :ref:`see this
tutorial <kickstart_oms>`. Note that you will still need to send in a request to
gain access to the git source code for a deployment to a host in the cloud.


Register to Request a VM Image
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The images are cryptographically signed and made available through the Developer's
Portal hosted by IDCubed.

Use the form below to send a request for access to the development environment.

.. raw:: html

  <iframe frameBorder="0" scrolling="no" width=100% height="720" src='https://alpha.openmustardseed.org/downloads/iframe/'></iframe>


Get Started - Prerequisites
~~~~~~~~~~~~~~~~~~~~~~~~~~~

* **Install VirtualBox** - OMS has a `VirtualBox Install Guide
  </tutorials/install_virtualbox>`_
* **Install GPG** - Download `GnuPG`_, `GPG for Windows`_, `GPG options for OSX`_
* **Decrypt the VM Image** - Expect to wait a few minutes, time will depend on
  the system decrypting the image.
   - Windows: Right-click on ``OMS-SDK-v0.X.Y-YYYYMMDD.ova.gpg`` and select
     ``Decrypt and Verify``. Enter the passphrase provided by IDCubed.
   - Linux: ``gpg --decrypt --output OMS-SDK-v0.X.Y-YYYYMMDD.ova
     OMS-SDK-v0.X.Y-YYYYMMDD.ova.gpg``. Provide the passphrase from IDCubed when
     prompted.
* **Import VM Image** - Open ``OMS-SDK-v0.X.Y-YYYYMMDD.ova`` then click
  ``import`` in the GUI that appears.


.. _GnuPG: http://www.gnupg.org/download/#auto-ref-3
.. _GPG for Windows: http://gpg4win.de/handbuecher/novices_5.html
.. _GPG options for OSX: https://duckduckgo.com/?q=gpg+mac+osx
.. _Linux link?: http://example.com


.. _import_vbox_vm_image:

Configure and Start the VM
~~~~~~~~~~~~~~~~~~~~~~~~~~

#. **Use Bridged Networking** - In the VirtualBox Manager GUI, Click *settings*
   > *Network* > and select *Attached to: Bridged Adapter*, then click OK. This
   gives the VM its own address on your local network after starting. (You're
   welcome to use NAT, but this tutorial does not cover it.)
#. **Boot the VM** - Click the green *Start* arrow. A new window with the VM
   should open.
#. **Get the Assigned IP** - Wait until the system has completed its boot
   process, you should see a login prompt. We need to get the IP address the VM
   has been assigned on your network. There is a row of status icons in the
   bottom right of the window you see the VM running in, and one of these will
   look like a small network symbol. Hovering over this icon should show the IP
   the VM's network adapter has on the network. If not, you can login to the
   console to retrieve the IP (see details below).
#. **Create a DNS Entry for the IP (optional)** - VirtualBox makes the
   *oms-dev* hostname automatically available on the host machine thanks to the
   *Bridged Adapter* setting, so you can easily connect to the VM using this
   hostname. However, when connecting from a different host, you need to set up
   a DNS entry for the VM. How you do this will depend on your host, the
   network you are on, and what is simplest for you to do. In general, the
   simplest option is to edit your system's *host* file to include an entry for
   the VM's assigned IP to *oms-dev*. On UNIX-like systems, this is
   */etc/hosts*. Microsoft systems have an equivalent you will need to locate
   for your particular OS.
#. **Confirm Success** - Open up your browser to *http://oms-dev/registration/*.
   You should see the OMS CoreID Registration page. You can now continue with
   the demo, or you can dive in deeper (on the command line), to more intimately
   explore the OMS TCF. Both are detailed below.

.. note::

   We are not sure why, but a small percentage of VM imports with VirtualBox
   fail. If you are left staring at a blank screen when you start the VM, you
   may need to delete and re-import the appliance.


.. _vm_contents:

What is Included in the Demo/Dev Environment?
---------------------------------------------

The OMS Trusted Compute Cell
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* The CoreID User Registry to store and manage your identity, acting as the
  backend storage for OpenID Connect.
* The :ref:`OpenID Connect <oidc>` server for token-based authorization and
  authentication. OIDC grants and validates tokens to Clients and Personas
  associated with a Core Identity.
* An example Trusted Application Bundle (TAB) for reference, and to manage
  Personas associated with CoreIDs stored in the User Registry. This TAB also
  demonstrates how to use the OIDC/persona authorization mechanism based on
  the powerful and extensible :ref:`OMS FACT <oms-fact-api-transforms>` API
  sub-system.
* The source code and system automation to deploy two additional example TABs.
  The :ref:`Perguntus <perguntus>` quantified-self demo and :ref:`GPS Demo
  <gps_demo>`, the If-Then-Script data collection and visualization demo.
* :ref:`The entire OMS source code <oms_source_code_map>`.


Applications, Frameworks, and Services
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* Python
* Django/Tastypie
* Java 7 (and Spring)
* SaltStack & Reclass
* uWSGI
* Nginx
* PostgreSQL
* Ruby
* Node.js
* MongoDB
* Git

All together, these services and tools are used to build and extend the OMS
Trusted Compute Framework included on the VM.


Run the CoreID TCC Demo
-----------------------

**Register a CoreID** - Demoing the technologies included in the VM requires a
Core Identity. Browse to http://oms-dev/registration/ and use the registration
form to create a new CoreID. The User Registry will create an initial persona
based on the information provided.

**Manage Personas** - When registration is complete, you will be presented with
a list of links to the OMS components included in the CoreID Demo - Persona
Administration, CoreID Registry, and OpenID Connect. Browse to the Persona App
at http://oms-dev/personas/.

**Login to OIDC** - When the personas administrative interface loads for the
first time, with no token in the browser, you will be redirected to OpenID
Connect to authenticate the CoreID you have just registered.

**Approve a Token** - Having authenticated the CoreID, you can now authorize
granting a token suitable for managing your personas. Once authorized, the token
will be returned to the Persona App to be used for authenticating all API
requests with the CoreID Registry backend.

**Create New Attributes and Personas** - Once you have provided the Persona App
a token with access to persona management, you can now create and manage the
attributes available to your personas, as well as the personas that use them.

**Explore** - The CoreID Registry administrative panel can be found at
http://oms-dev/coreid_registry/admin/, and OpenID Connect at http://oms-dev/oidc/.
The VM can be used for development, and the GPS and Perguntus Demo TABs can also
be deployed - see the sections below for additional details.


Using the VM for Development
----------------------------

.. note::

   **Assumed Knowledge**

   * **Editing**: Use text editors from the Linux console, such as Vim or Nano
   * **SSH**: How to use ``ssh`` (or `PuTTY for Windows`_) to access remote
     hosts over the network.
   * **Git**: Basic experience with the Git revision control system.


.. _PuTTY for Windows: http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html


Command Line Access
~~~~~~~~~~~~~~~~~~~

If you wish to dig in on the command line:

#. On the physical host, use an SSH client (``ssh`` or PuTTY, etc) to connect to
   the OMS VM with ``oms@oms-dev``. The default password is ``oms``.
#. Once connected, change the default password for the ``oms`` user. We recommend
   a randomly generated password of 13 or more characters. You do not need to
   remember the complex password, maintain an encrypted wallet such as the
   cross-platform and open, `keepassx`_.
#. Use ``sudo`` to switch users to the system's root user: ``sudo su -l``.
   Provide the password for the ``oms`` user when prompted.


If you were unable to retrieve the IP from the VirtualBox interface, retrieve
the IP from the console:

#. Login to the VM through the console provided by VirtualBox, use ``oms`` for
   the default user and password.
#. Type ``ifconfig`` and note the IP from line 2 *inet:*.

.. _keepassx: https://www.keepassx.org/


Set Up Git
~~~~~~~~~~

If you would like to interact with the OMS repositories on GitHub, you will want
to add an SSH keypair to the VM and GitHub. This is not required to use the demo
included in the VM, and is only necessary if you wish to update the code on the
VM or push changes to a new repository of your own:

#. Create your GitHub public/private key with ``ssh-keygen``, and hit enter
   through all the prompts.
#. Finally, get your GitHub key with ``cat /home/oms/.ssh/id_rsa.pub``, then `add
   the key to your GitHub account`_.

.. _add the key to your GitHub account: https://github.com/settings/ssh


Where to Next?
~~~~~~~~~~~~~~

* Checkout the :ref:`list of tutorials <tutorials>`
* Deploy an existing TAB, either :ref:`Perguntus` or :ref:`GPS Demo <gps_demo>`
* :ref:`Create your own TAB <tab_tutorial>`
* Explore the :ref:`OMS Source Code <oms_source_code_map>`


Need one-on-one assistance?
---------------------------

If you need more help, do not hesitate to hop on to the `#oms IRC channel on
freenode <irc://chat.freenode.net#oms>`_ with your questions and needs.
