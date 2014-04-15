:title: VM Builder's Guide
:description: How to Build OMS VM with packer.io
:keywords: oms, vm, packer, release,


.. _vm_builders_guide:

VM Builder's Guide
==================

This guide will step through using `packer.io`_ and the utilities provided by
the oms-kickstart repository to automate building VM images for VirtualBox. The
tutorial will show examples using OMS build process, but the instructions are
generic in nature.

.. _packer.io: http://packer.io


.. note::

   This process has been tested on Debian Linux 7.x and FreeBSD 9.2.


Initial Set Up
--------------

Packer is a very light-weight framework for automating the process of building
containers and images for use in various virtualization technologies. Packer
includes automated structures for a handful of subsystems, from qemu, to AWS,
openstack, and even docker.io. Additionally, Packer has support for different
types of provisioners, including shell scripts and file uploads, Ansible, Puppet,
and SaltStack.

.. note::

   As of the v0.8.5 release, OMS provides the means to build VM images for
   VirtualBox, using packer.io, oms-kickstart, and saltstack.


VirtualBox
~~~~~~~~~~

To build VM images for VirtualBox, we first need both VirtualBox and the packer
command line utility installed and available on a host that can support running
Virtual Machines. It is best to use a physical desktop, laptop, or rackmount
with at least 4GB of RAM and a quad core CPU. It is possible to run a single VM
at a time with less power (2GB/dual-core), but such a setup is not recommended.
Also be sure to confirm that the CPU's Virtualization Extensions are enabled in
the BIOS.

.. todo:: see if we can find instructions on enabling this for intel/amd cpus


:ref:`There are references here <install_virtualbox>` to get started with
installing VirtualBox.


packer.io
~~~~~~~~~

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
   To activate this for the open shell, ``source ~/.bash_aliases``. Note, update
   the path (*$HOME/packer/*) if you have installed packer to another location.
#. Test to confirm with ``packer -v``, you should see something like ``Packer
   v0.5.2``.


oms-kickstart
~~~~~~~~~~~~~

.. todo::

   fill in this section with details about what to setup first, for oms-kickstart,
   before getting into anything about templates

Packer is a very light-weight framework for automating the process of building
containers and images for use in various virtualization technologies. Packer
includes automated structures focused on creating and manipulating virtual
systems (VMs, cloud instances, containers, etc). It can, for example, boot up a
new VM, download and provide an ISO to boot and install the host OS, and initiate
an unattended installation, even entering in arbitrary text as if entered by a
human on the terminal.

This provides an interesting distiction, Packer provides the means to automate
the installation of arbitary host OS, but it does not include any pre-defined
templates for building even the most common systems.

oms-kickstart includes these templates, as well as all the scripts and the
configuration needed to build VM images with packer, for OMS.

.. note::

   Given the flexibility provided by OMS generic provisioning framework,
   oms-kickstart, this build process could easily build VM images for most
   anything you could deploy on a Ubuntu 12.04 VM.



Let's Build some VM!
--------------------

Here is the short and sweet version to building VM images.


A few key points about packer
-----------------------------

The details above are meant to get you started.


About build templates
~~~~~~~~~~~~~~~~~~~~~

Packer uses a simple json manifest to define templates for packer to build
images and containers from. The templates used to build Ubuntu VM for OMS and
kickstart the provisioning process are included in the `oms-kickstart
repository`_. On an OMS Host, these templates could be found in
``/var/oms/src/oms-kickstart/packer``.

.. _oms-kickstart repository: https://github.com/IDCubed/oms-kickstart/tree/master/packer

Unfortunately, the build templates are required to be pure JSON, so you will
not find much in the way of inline documentation/commentary.


About user variables in packer templates
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The templates included in oms-kickstart make use of various user variables.
These variables make it easier to customize the details of the image built.
Packer enables the user to override these variables in more than one way. If you
do need to customize any of these values, please use what works best for you.
This documentation will provide examples on the command line.

The following user variables are available in *all* templates included in the
oms-kickstart repository:

=============  =============  ==================================================
Variable Name  Default Value  Description
=============  =============  ==================================================
build_name     ubuntu-base    name of the VM image and build directory.
system_user    oms            the username of packer's admin user. packer will
                              SSH to the new VM host as this user.
system_pass    oms            the password for packer's admin user
system_memory  256            the amount of memory (MB) to setup the VM with.
=============  =============  ==================================================

This, by default, the VM image that results has been setup with 256 MB of memory
and a single user (``oms``) has been created for administrative and automation
purposes.

Each build template may define and use user variables in addition to those listed
here. These are detailed in the sections to follow.


About the packer administrative user
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To apply any post-install provisioning steps outlined in the template, packer
expects the system/image it is manipulating to have a system user. In the image
building framework included in oms-kickstart, installing the base OS (Ubuntu) is
completely automated within packer and leverages the existing automated
installation framework provided by Debian/Ubuntu. It is within ``preseed.cfg``
that we create the initial administrative user for packer, and set the password
for this user.

While it is not normally necessary to do so, you may customize the automated
Ubuntu install. If you choose to customize the system user available to packer,
note that updating the ``system_user`` user variable will not change the user or
password defined in ``preseed.cfg``, it will only tell packer to use a different
username/password when it attempts to SSH to the new VM.


Provisioners
~~~~~~~~~~~~

After the build completes, packer will run one or more provisioners of different
types. The system automation framework included in the oms-kickstart repository
includes the following scripts as provisioners, as part of running the kickstart
scripts:

* *setup.sh*: Ensure the OMS administrative user has SSH directories and keys in
  place, and proper permissions on all files. Finally, copy the SSH keys to
  root's home.
* *vbox_guest.sh*: mount the guest additions .iso and run their installation
  script.
* *cleanup/*: run some clean up with apt, remove the SSH keys and any stale
  DHCP leases/udev configuration.

These can be found in the ``packer/uploads/kickstart/`` directory within the
oms-kickstart repository.

.. note::

   I need to sort out the discrepency between the oms-kickstart and the kickstart
   directories in oms-kickstart/packer/uploads/


About Each Build template
-------------------------

Packer uses a json files, known as a *template* in packer.io, to tell it what to
do. This is packer's concept of a manifest for the build process. The v0.8.5 release includes five templates of interest in building VM images
with or for OMS. This sections includes high-level details about each template
while the next section 

.. note::

   some details, such as the variables available with each build template, are
   not all listed/included in the documentation below.. but it should be.
   review this until it is correct and complete, then remove this message.


ubuntu-base
~~~~~~~~~~~

Create a basic virtualbox VM image with a default Ubuntu 12.04 LTS host system
installed. Nothing more, nothing less.


oms/base/ubuntu-iso
~~~~~~~~~~~~~~~~~~~

Using packer's ``virtualbox-iso`` builder, start with an ISO and create an OVA-
formatted image suitable for importing into VirtualBox, with Ubuntu 12.04 LTS
installed.

After packer has installed the host OS (eg, the build is complete), the following
provisioners will run: *setup.sh*, *vbox_guest.sh*, *cleanup.sh*. Kickstart is
setup, but not run.


oms/base/ubuntu-ovf
~~~~~~~~~~~~~~~~~~~

Using packer's ``virtualbox-ovf`` builder, import an existing OVA image as a new
host, upload the kickstart scripts, config, and SSH keys, and run the OMS packer
provisioner scripts (same as above). Kickstart is setup, but not run.

Additional user variables available:

* ``ovf_path``: the full/relative path (on the filesystem) to the OVF image to
  import. This defaults to *builds/ubuntu-base/ubuntu-base.ova*. You may use
  a symlink to improve the development flow.
* ``oms_version``: used to create the vm image filename, defaults to
  *qa-develop*.


oms/kickstarted
~~~~~~~~~~~~~~~

Using packer's ``virtualbox-ovf`` builder, import an existing OMS base image
and execute the OMS kickstart and peripheral provisioning scripts.


oms/kickstarted-iso
~~~~~~~~~~~~~~~~~~~

Using packer's ``virtualbox-iso`` builder, create a completely new Ubuntu VM, as
a new install, using a Ubuntu iso. Kickstart is then setup and run after this.


Review and Update the Templates
-------------------------------

Included in
oms-core are two templates. One template builds new Ubuntu VM without running the
OMS kickstart deployment, and a second one that runs the kickstart script to
build a developer's environment based on the OMS master release.

You may wish to update the details of this manifest. The user variables have been
defined at the top for your convenience.



.. todo::

   sort through all of the content below and extract what is usable and sensible.
   this is the archive (below)

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

.. code:: bash

   # locate OMS source code
   oms% cd /var/oms/src/
   # we will use the packer module in oms-core
   oms% cd oms-core/packer/
   # copy the kickstart python script from oms-kickstart
   oms% cp ../../oms-kickstart/kickstart-oms.py ../../oms-kickstart/release.yaml ./uploads/


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
   oms% pwd
   /var/oms/src/oms-core/packer
   oms% ssh-keygen
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
   oms% ls -alh uploads/.ssh/
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

   oms% cat /home/<you>/.ssh/id_rsa.pub >> uploads/.ssh/authorized_keys


Note that this is optional, but may provide a simpler flow for what you need to
do with the VM image after it is built. If you do not see the VM with an
authorized_keys file, SSH will prompt for password authentication when you connect
to the VM. The password the user is created with is defined in the template used
to build the VM.


Build some VM
-------------

COM'ON, let's build some VM now! Easy:

.. code:: bash

   oms% packer build templates/tab_developer-virtualbox.json


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
