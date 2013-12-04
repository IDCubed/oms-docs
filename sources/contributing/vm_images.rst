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


Unzip the archive, your user's home (``~``), ``/usr/local/bin/packer/`` or
``/usr/local/packer/`` are good locations. Update your ``PATH`` to include this
directory. Test to confirm with ``packer -v``, you should see somethinv like
``Packer v0.4.0``.


Get the templates
-----------------

The templates used to build Ubuntu VM for OMS and kickstart the provisioning
process are distributed in the `packer module from oms-core`_.

.. _packer module from oms-core: https://github.com/IDCubed/oms-core/tree/qa-develop/packer


.. code::

   git clone git@github.com:IDCubed/oms-core.git
   git checkout qa-develop
   cd packer


Review and Update the Templates
-------------------------------

Packer uses a json files, known as a *template* in packer.io, to tell it what to
do. This is packer's concept of a manifest for the build process. Included in
oms-core are two templates. One template builds new Ubuntu VM without running the
OMS kickstart deployment, and a second one that runs the kickstart script to
build a developer's environment based on the OMS master release.

You may wish to update the details of this manifest. The user variables have been
defined at the top for your convenience.


Build some VM
-------------

COM'ON, let's build some VM now! Easy:

.. code::

   packer build templates/tab_developer-virtualbox.json


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
needed. This is a great setup for local development, custom deployments, and
general hacking with OMS!


.. include:: /snippets/get_help_footer.inc
