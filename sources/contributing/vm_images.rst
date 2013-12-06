:title: VM Builder's Guide
:description: How to Build OMS VM with packer.io
:keywords: oms, vm, packer, release,


.. _vm_builders_guide:

VM Builder's Guide
==================

This guide will step through using `packer.io`_ to automate building VM images
for VirtualBox. The tutorial will show examples using OMS build process, but
the instructions are generic in nature.

.. _packer.io: http://packer.io


.. note::

   Tested on Debian Linux and FreeBSD 9.2


Initial Set Up
--------------

To build VM images for VirtualBox, we need packer and VirtualBox installed and
available on a host that can support running Virtual Machines. It is best to use
a physical desktop, laptop, or rackmount with at least 4GB of RAM and a quad core
CPU. It is possible to run a single VM at a time with less power (2GB/dual-core),
but such a setup is not recommended. Also be sure to confirm that the CPU's
Virtualization Extensions are enabled in the BIOS.

.. todo:: see if we can find instructions on enabling this for intel/amd cpus

:ref:`There are references here <install_virtualbox>` to get started with
installing VirtualBox.

Installing packer.io is even easier. Packer is `distributed as a zip archive`_
of prebuilt binaries. `Here are the installation docs`_.

.. _distributed as a zip archive: http://www.packer.io/downloads.html
.. _here are the installation docs: http://www.packer.io/docs/installation.html

Here they are as well:

#. Unzip the archive. Your user's home (``~/packer/``), or a path such as
   ``/usr/local/bin/packer/`` or ``/usr/local/packer/`` are good locations.
#. Update the ``PATH`` shell environment variable to include this directory. This
   detail will depend on the shell you use. If using bash, something like this
   should suffice: ``echo "export PATH=$PATH:$HOME/packer/" >> ~/.bash_aliases``.
   To activate this for the open shell, ``source ~/.bash_aliases``.
#. Test to confirm with ``packer -v``, you should see something like ``Packer v0.4.0``.


Get the templates
-----------------

The templates used to build Ubuntu VM for OMS and kickstart the provisioning
process are distributed in the `packer module from oms-core`_.

.. _packer module from oms-core: https://github.com/IDCubed/oms-core/tree/qa-develop/packer


.. code::

   local% mkdir -p /var/oms/src
   local% cd /var/oms/src/
   local% git clone git@github.com:IDCubed/oms-core.git
   local% git checkout qa-develop
   local% cd packer


Review and Update the Templates
-------------------------------

Packer uses a json files, known as a *template* in packer.io, to tell it what to
do. This is packer's concept of a manifest for the build process. Included in
oms-core are two templates. One template builds new Ubuntu VM without running the
OMS kickstart deployment, and a second one that runs the kickstart script to
build a developer's environment based on the OMS master release.

You may wish to update the details of this manifest. The user variables have been
defined at the top for your convenience.


Setup Kickstart
---------------

The ``uploads`` directory of the packer module included in ``oms-core`` does not
include any of the files (config and scripts) referenced by the templates in the
module - it is expected these would be provided by the user of this module. They
may be included in the future, though the details of this have yet to be
determined.

.. note::

   the absence of these files will not cause the basic build to fail, but *will*
   cause the more complete builds to fail. Be sure to review the uploads path,
   and confirm it contains the files you need in the version you desire.


Let's populate the uploads directory so we can run the automated system
provisioning provided by oms-kickstart. The same process would apply should you
choose to reference different files in the templates used to build VM images with
packer.

.. code::

   # locate OMS source code
   local% cd /var/oms/src/
   # we will use the packer module in oms-core
   local% cd oms-core/packer/
   # copy the kickstart python script from oms-kickstart
   local% cp ../../oms-kickstart/kickstart-oms.py ../../oms-kickstart/release.yaml ./uploads/


The kickstart script, along with steps run by salt later in the provisioning
process, will need to checkout code from the OMS git repos on Github. Some of the
repositories require authentication, and the build process is expected to run as
a completely automated process, so SSH keys are needed by the build system to
successfully create the VM image..

This is the same as when deploying OMS in the cloud, we do this just before running
kickstart. In this case, if we create the files, packer is setup to provide them
to the VM before kickstarting the OMS deployment to the VM.

We need both a public and private SSH key:

.. code:: bash

   # assuming the current working directory is /var/oms/src/oms-core/packer
   local% pwd
   /var/oms/src/oms-core/packer
   local% ssh-keygen
   Generating public/private rsa key pair.
   Enter file in which to save the key (/root/.ssh/id_rsa): /var/oms/src/oms-core/packer/uploads/.ssh/id_rsa
   Enter passphrase (empty for no passphrase):
   Enter same passphrase again:
   Your identification has been saved in /var/oms/src/oms-core/packer/uploads/.ssh/id_rsa.
   Your public key has been saved in /var/oms/src/oms-core/packer/uploads/.ssh/id_rsa.pub.
   The key fingerprint is:
   0d:f2:09:b8:17:51:f9:08:4e:2c:c5:23:bf:3d:48:95 root@oms
   The key's randomart image is:
   +--[ RSA 2048]----+
   | +..o o oo       |
   |. @  =.=E.       |
   |    .o .2-0      |
   |                 |
   |    . + S .      |
   | o   skj2o       |
   |     .   .       |
   |    . + S .      |
   |                 |
   +-----------------+
   local% ls -alh uploads/.ssh/
   total 8
   drwxr-xr-x  2 root  root     5B Dec  6 10:54 .
   drwxr-xr-x  4 root  root     4B Dec  3 15:00 ..
   -rw-r--r--  1 root  root    77B Dec  3 02:10 README.rst
   -rw-------  1 root  root   1.7k Dec  6 10:54 id_rsa
   -rw-r--r--  1 root  root   398B Dec  6 10:54 id_rsa.pub


If you are building an image for personal use (eg not for public distribution),
or if you intend on making some *post-production* tweaks to the VM before
releasing the image, you can provide the VM with an authorized_keys file:

.. code:: bash

   local% cat /home/<you>/.ssh/id_rsa.pub >> uploads/.ssh/authorized_keys


Note that this is optional, but may provide a simpler flow for what you need to
do with the VM image after it is built. If you do not see the VM with an
authorized_keys file, SSH will prompt for password authentication when you connect
to the VM. The password the user is created with is defined in the template used
to build the VM.


Build some VM
-------------

COM'ON, let's build some VM now! Easy:

.. code::

   local% packer build templates/tab_developer-virtualbox.json


Packer will then:

* ensure it has the VirtualBox Guest Additions CD, as well as the ISO it needs
  to install an OS on the VM.
* create a new VirtualBox VM for you
* mount and boot the VM with the OS install disk
* navigate the OS install enough to bootstrap an automated installation, hosting
  a ``preseed.cfg`` for the debian/ubuntu automated install.
* run through the automated install, creating an initial user in the process
* use the initial user to access the VM via SSH, upload some files and scripts
  for the provisioning process.
* run kickstart, if necessary
* wrap up the build and package the VM as an importable open appliance ``.ova``.


You can then use VirtualBox to import this virtual appliance to create new VM as
needed, :ref:`The import process is detailed here <import_vbox_vm_image>`. This is
a great setup for local development, custom deployments, and general hacking with
OMS!


.. include:: /snippets/get_help_footer.inc
