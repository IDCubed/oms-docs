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

Packer is a light-weight framework for automating the process of building
containers and images for use in various virtualization technologies. Packer
includes automated structures for a handful of VM subsystems, from qemu, to AWS,
openstack, and even Docker. Additionally, Packer has support for different types
of provisioners, including shell scripts and file uploads, Ansible, Puppet, and
SaltStack.

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

How to get started with VirtualBox is detailed in :ref:`this guide
<install_virtualbox>`.


Packer Tool
~~~~~~~~~~~

.. _distributed as a zip archive: http://www.packer.io/downloads.html
.. _Packer Install Documentation: http://www.packer.io/docs/installation.html

Installing the Packer command line tool is even easier. Packer is `distributed
as a zip archive`_ of prebuilt binaries. The `Packer Install Documentation`_
includes more detail, but here is an overview of the install:


#. Unzip the archive. Your user's home (``~/packer/``), or a path such as
   ``/usr/local/bin/packer/`` or ``/usr/local/packer/``, are all good locations.
#. Update the ``PATH`` shell environment variable to include that directory. This
   detail will depend on the shell you use. If using bash, something like this
   should suffice: ``echo "export PATH=$PATH:$HOME/packer/" >> ~/.bash_aliases``.
   To activate this for the open shell, ``source ~/.bash_aliases``. Note, update
   the path in this example (*$HOME/packer/*) if you have installed packer to a
   different location.
#. Test to confirm your success with ``packer -v``, you should see something like
   ``Packer v0.5.2``.


oms-kickstart
~~~~~~~~~~~~~

.. todo::

   fill in this section with details about what to setup first, for oms-kickstart,
   before getting into anything about templates

Packer provides a framework that simplifies automating the process of building
containers and images for use in various virtualization technologies. Packer
includes automated structures focused on creating and manipulating virtual
systems (VMs, cloud instances, containers, etc). It can, for example, boot up a
new VM, download and provide an ISO to boot and install the host OS, and initiate
an unattended installation, even entering arbitrary text into the VM's console
as if entered by a human on the terminal.

This provides an interesting distiction, Packer provides the means to automate
the installation of arbitary host OS, but it does not include any pre-defined
templates for building even the most common systems. Thus, oms-kickstart includes
a set of templates, as well as all the scripts and the configuration needed to
build VM images with Packer, for OMS.

.. note::

   Given the flexibility provided by the generic provisioning framework in OMS,
   oms-kickstart, this build process could easily build VM images for most
   anything you could deploy with Salt states/formula, on a Ubuntu 12.04 VM.


This guide assumes you have cloned a copy of the `kickstart git repository`_ to
the Linux/BSD/OSX host you are using to build VM images on VirtualBox. If working
from a host previously provisioned with OMS, this repository can be found in
*/var/oms/src/oms-kickstart*.

.. _kickstart git repository: https://github.com/IDCubed/oms-kickstart.git

If you need, clone the git repo from github: ``git clone
https://github.com/IDCubed/oms-kickstart.git``.



Create an SSH key to access Github
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The kickstart script, along with the provisioning process managed by SaltStack,
will both need to clone the OMS git repositories from Github. Some of the
repositories require authentication, and the build process is expected to run as
a completely automated process, so SSH keys are needed by the build system to
successfully create the VM image.

This is the same as when deploying OMS in the cloud, we do this just before running
kickstart. In this case, if we create the files, Packer is setup to provide them
to the VM before kickstarting the OMS deployment to the VM. Note that not all of
the build templates run a cleanup script to remove these SSH keys when no longer
needed - be sure you validate the contents of a VM image before being published.

Create an ssh key with ``ssh-keygen``, saved to
``oms-kickstart/config/.ssh/id_rsa``, and do not use a passphrase for the key.
A future release of OMS will allow you to do so - at present, a passphrase will
prevent the OMS automation system from working properly.

.. code:: bash

   oms% ssh-keygen
   Generating public/private rsa key pair.
   Enter file in which to save the key (/root/.ssh/id_rsa): config/.ssh/id_rsa
   Enter passphrase (empty for no passphrase):
   Enter same passphrase again:
   Your identification has been saved in config/.ssh/id_rsa.
   Your public key has been saved in config/.ssh/id_rsa.pub.
   The key fingerprint is:
   0d:f2:09:b8:17:51:f9:08:4e:2c:c5:23:bf:3d:48:95 root@oms
   The key's randomart image is:
   +--[ RSA 2048]----+
   | +..o o oo       |
   |  @  =.=E.       |
   | .  .o .2-0      |
   |                 |
   |    . + S .      |
   | o   skj2o       |
   |     .   .       |
   |    . + S .      |
   |                 |
   +-----------------+


Within the oms-kickstart repository, ``packer/uploads/.ssh/`` is a symlink to
``config/.ssh/``, the keys can be found in either location, as seen here:

.. code:: bash

   oms% ls -alh packer/uploads/.ssh/
   total 8
   drwxr-xr-x  2 root  root     5B Dec  6 10:54 .
   drwxr-xr-x  4 root  root     4B Dec  3 15:00 ..
   -rw-r--r--  1 root  root    77B Dec  3 02:10 README.rst
   -rw-------  1 root  root   1.7k Dec  6 10:54 id_rsa
   -rw-r--r--  1 root  root   398B Dec  6 10:54 id_rsa.pub


Adding the public key to your github account
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With the public key in Github, OMS will be able to checkout its source code on
your behalf.

To add the key to your account:

#. Navigate to *Account Settings* in the Github web UI,
#. Find *SSH Keys* in the navigation bar on the lefthand side,
#. Copy/paste the contents of *id_rsa.pub* into the form on this page. You can
   view the key with: ``cat oms-kickstart/config/.ssh/id_rsa.pub``.


Add an authorized_keys
~~~~~~~~~~~~~~~~~~~~~~

This is optional.

If you are building an image for personal use (eg not for public distribution),
or if you intend on making some *post-production* tweaks to the VM before
releasing the image, you can provide the VM with an authorized_keys file:

.. code:: bash

   oms% cat /home/<you>/.ssh/id_rsa.pub >> uploads/.ssh/authorized_keys


Note that while this is optional, it may provide a simpler flow for what you need
to do with the VM image after it is built. If you do not see the VM with an
authorized_keys file, SSH will prompt for password authentication when you connect
to the VM. The password the user is created with is defined in the configuration
used to automate the OS install (*preseed.cfg*). Customizing the use of this
user should not be necessary, and is not recommended.


Let's Build some VM!
--------------------

Here is the short and sweet version to building VM images, more details on each
step are included in the sections that follow.

We will use Packer to:

#. Build the first base VM image, a Ubuntu 12.04 LTS host. This is a fresh
   install and nothing else.
#. Import the Ubuntu base (just built), upload the scripts and configuration
   needed to ignite the kickstart provisioning process, but don't actually run
   anything. This is the OMS base VM.
#. Import the OMS base (just built), initiate the kickstart provisioning process,
   and build a new image with kickstart complete. This will deploy/setup whatever
   you configure kickstart to apply.

.. note::

   As of OMS v0.8.5, the default build has configured kickstart to deploy the
   complete OMS Trusted Compute Framework (TCF) along with the reference Trusted
   Compute Cell (TCC).


For the process outlined above, Packer will:

* ensure it has the VirtualBox Guest Additions CD, as well as the ISO it needs
  to install an OS on the VM;
* create a new VirtualBox VM;
* mount and boot the VM with the OS install disk;
* navigate the OS install enough to bootstrap an automated installation, hosting
  a *preseed.cfg* for the debian/ubuntu automated install;
* run through the automated install, creating an initial user in the process;
* wrap up the build and package the VM as an importable open appliance *.ova*;
* import the *ubuntu-base.ova* image as a new VM;
* use the initial user to access the VM via SSH, upload some files and scripts
  for the provisioning process;
* export the VM as an importable open appliance, *oms-base.ova*;
* import the *oms-base.ova* image as a new VM, ignite kickstart provisioning;
* kickstart provisioning updates the OMS base host using the formula provided
  (for SaltStack), and which will build all o f the services and applications
  declared in the formula - this step allows User/Developers the ability to
  build VM images with arbitrarily complex systems deployed and setup;
* export the VM as an importable open appliance, *oms.ova*.


You can then use VirtualBox to import this virtual appliance to create new VM as
needed, :ref:`The import process is detailed here <import_vbox_vm_image>`.

Given the flexible nature of oms-kickstart, accepting any compilation of git
repositories with formula (modules, states, config, etc) for SaltStack, there
are few limitations to what services and applications can be deployed. This is a
great setup for local development, custom deployments, and general hacking with
OMS!



Build Ubuntu Base VM
~~~~~~~~~~~~~~~~~~~~

The default build template for the Ubuntu base image will install a new Ubuntu
12.04 LTS host from an official Ubuntu ISO (SHA256 verified). The install is
fully automated, though you should be careful not to interrupt the automated
installation running on the VirtualBox VM. The build will require 15 to 45
minutes to complete - this will vary based on the computing and network
resources you have available.

Here is what the build will look like on the command line:

.. code:: bash

   oms-kickstart/packer$ packer build templates/ubuntu-base.json

   virtualbox-iso output will be in this color.

   ==> virtualbox-iso: Downloading or copying Guest additions checksums
       virtualbox-iso: Downloading or copying: http://download.virtualbox.org/virtualbox/4.3.10/SHA256SUMS
   ==> virtualbox-iso: Downloading or copying Guest additions
       virtualbox-iso: Downloading or copying: http://download.virtualbox.org/virtualbox/4.3.10/VBoxGuestAdditions_4.3.10.iso
   ==> virtualbox-iso: Downloading or copying ISO
       virtualbox-iso: Downloading or copying: http://archive.ubuntu.com/ubuntu/dists/precise-updates/main/installer-amd64/current/images/netboot/mini.iso
   ==> virtualbox-iso: Starting HTTP server on port 8081
   ==> virtualbox-iso: Creating virtual machine...
   ==> virtualbox-iso: Creating hard drive...
   ==> virtualbox-iso: Creating forwarded port mapping for SSH (host port 4382)
   ==> virtualbox-iso: Executing custom VBoxManage commands...
       virtualbox-iso: Executing: modifyvm precise-amd64 --memory 256
   ==> virtualbox-iso: Starting the virtual machine...
   ==> virtualbox-iso: Waiting 10s for boot...
   ==> virtualbox-iso: Typing the boot command...
   ==> virtualbox-iso: Waiting for SSH to become available...
   ==> virtualbox-iso: Connected to SSH!
   ==> virtualbox-iso: Uploading VirtualBox version info (4.3.10)
   ==> virtualbox-iso: Provisioning with shell script: uploads/kickstart/vbox_guest.sh
       virtualbox-iso: [sudo] password for oms:
       virtualbox-iso: ------------------------------------------------------
       virtualbox-iso: ### install virtualbox guest additions
       virtualbox-iso: /home/oms/VBoxGuestAdditions_4.3.10.iso: No such file or directory
       virtualbox-iso: sh: 0: Can't open /tmp/virtualbox/VBoxLinuxAdditions.run
       virtualbox-iso: umount: /tmp/virtualbox: not mounted
       virtualbox-iso: rm: cannot remove `/home/oms/VBoxGuestAdditions_4.3.10.iso': No such file or directory
       virtualbox-iso: ### virtualbox guest additions complete!
       virtualbox-iso:
   ==> virtualbox-iso: Provisioning with shell script: uploads/kickstart/cleanup/ubuntu.sh
       virtualbox-iso: [sudo] password for oms: ### ------------------------------------------------------
       virtualbox-iso: ### clean up apt
       virtualbox-iso: Reading package lists... Done
       virtualbox-iso: Building dependency tree
       virtualbox-iso: Reading state information... Done
       virtualbox-iso: 0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
   ==> virtualbox-iso: Provisioning with shell script: uploads/kickstart/cleanup/network.sh
       virtualbox-iso: [sudo] password for oms:
       virtualbox-iso: ### ------------------------------------------------------
       virtualbox-iso: ### cleanup network configuration (dhcp/udev)
       virtualbox-iso: ### cleaning up dhcp leases
       virtualbox-iso: ### cleaning up udev rules
   ==> virtualbox-iso: Gracefully halting virtual machine...
       virtualbox-iso: [sudo] password for oms:
   ==> virtualbox-iso: Preparing to export machine...
       virtualbox-iso: Deleting forwarded port mapping for SSH (host port 4382)
   ==> virtualbox-iso: Exporting virtual machine...
   ==> virtualbox-iso: Unregistering and deleting virtual machine...
   Build 'virtualbox-iso' finished.

   ==> Builds finished. The artifacts of successful builds are:
   --> virtualbox-iso: VM files in directory: builds/ubuntu-base


This VM image can be used by other build templates using Packer's
``virtualbox-ovf`` build module. Should you need a fresh Ubuntu VM for anything,
it could also be imported into VirtualBox to create a new VM. The image can be
found in ``packer/builds/ubuntu-base/`` within your local oms-kickstart
repository.


Build the OMS Base VM
~~~~~~~~~~~~~~~~~~~~~

This next template is the simplest and shortest - packer will import the Ubuntu
Base just created, upload all the scripts and configuration needed to run the
kickstart process, and then export the VM to create an image.

This build is expected to run for 5 to 10 minutes.

This build ends up being useful for debugging the kickstart process, and you may
find it to be the best place to customize your setup. See additional details
about the built template in the sections to follow.

Here is the OMS Base build from the command line:

.. code:: bash

   oms-kickstart/packer$ packer build -var oms_version='v0.8.5-rc' templates/oms/base/ubuntu_ovf.json
   virtualbox-ovf output will be in this color.

   ==> virtualbox-ovf: Importing VM: builds/ubuntu-base/precise-amd64.ova
   ==> virtualbox-ovf: Creating forwarded port mapping for SSH (host port 3499)
   ==> virtualbox-ovf: Executing custom VBoxManage commands...
       virtualbox-ovf: Executing: modifyvm oms-base --memory 256
   ==> virtualbox-ovf: Starting the virtual machine...
   ==> virtualbox-ovf: Waiting 10s for boot...
   ==> virtualbox-ovf: Waiting for SSH to become available...
   ==> virtualbox-ovf: Connected to SSH!
   ==> virtualbox-ovf: Uploading VirtualBox version info (4.3.10)
   ==> virtualbox-ovf: Uploading uploads/ => /home/oms/
   ==> virtualbox-ovf: Provisioning with shell script: /tmp/packer-shell500525237
       virtualbox-ovf: [sudo] password for oms:
       virtualbox-ovf: ### ------------------------------------------------------
       virtualbox-ovf: ### prepare the system to run OMS Kickstart
       virtualbox-ovf: ### copy SSH keys to /root/.ssh/ (for OMS system automa)
       virtualbox-ovf: ### ensure OMS has that root can SSH to localhost
       virtualbox-ovf: ### reset permissions on /home/oms and /root/
       virtualbox-ovf: ### initial preparations complete!
       virtualbox-ovf:
       virtualbox-ovf:
       virtualbox-ovf: ### ------------------------------------------------------
       virtualbox-ovf: ### cleanup network configuration (dhcp/udev)
       virtualbox-ovf: ### cleaning up dhcp leases
       virtualbox-ovf: ### cleaning up udev rules
   ==> virtualbox-ovf: Gracefully halting virtual machine...
       virtualbox-ovf: [sudo] password for oms:
   ==> virtualbox-ovf: Preparing to export machine...
       virtualbox-ovf: Deleting forwarded port mapping for SSH (host port 3499)
   ==> virtualbox-ovf: Exporting virtual machine...
   ==> virtualbox-ovf: Unregistering and deleting imported VM...
   Build 'virtualbox-ovf' finished.

   ==> Builds finished. The artifacts of successful builds are:
   --> virtualbox-ovf: VM files in directory: builds/oms-base/v0.8.5-rc


This VM image has been setup to run the kickstart provisioning process, but the
process has not actually been run. At this point, the VM image can either be
used as a base for the kickstarted build template, and/or the image can be
imported into VirtualBox to create VMs as needed. This is sometimes a great way
to debug a kickstart build that is failing. The image can be found in
``packer/builds/oms-base/<version>/`` within your local oms-kickstart repository.


Build (and kickstart) an OMS VM Image
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

By default, this will build a new VM image by first importing the base image,
then deploying a fully working installation of the OMS reference Trusted Compute
Framework (TCF) and Trusted Compute Cell (TCC). This build *runs* the kickstart
process, so the time it takes to build this VM is dependent on the kickstart
process you initiate. The default kickstart provisioning build will take anywhere
from 20 to 60 minutes to complete, deploying the complete OMS TCF and TCC with a
demoable implementation of the OMS CoreID and Personas concepts.


Here is the kickstart build from the command line:

.. code:: bash

   oms-kickstart/packer$ packer build -var oms_version='v0.8.5-rc' -var kickstart_opts='-H -c config/packer.yaml' -var ovf_path='builds/oms-base/v0.8.5-rc/oms-base.ova' templates/oms/kickstarted.json
   virtualbox-ovf output will be in this color.

   ==> virtualbox-ovf: Importing VM: builds/oms-base/v0.8.5-rc/oms-base.ova
   ==> virtualbox-ovf: Creating forwarded port mapping for SSH (host port 3499)
   ==> virtualbox-ovf: Executing custom VBoxManage commands...
       virtualbox-ovf: Executing: modifyvm oms-dev --memory 256
   ==> virtualbox-ovf: Starting the virtual machine...
   ==> virtualbox-ovf: Waiting 10s for boot...
   ==> virtualbox-ovf: Waiting for SSH to become available...
   ==> virtualbox-ovf: Connected to SSH!
   ==> virtualbox-ovf: Uploading VirtualBox version info (4.3.10)
   ==> virtualbox-ovf: Uploading uploads/ => /home/oms/
   ==> virtualbox-ovf: Provisioning with shell script: /tmp/packer-shell971923616
       virtualbox-ovf: [sudo] password for oms: 2014-04-16 02:50:25,724 [818] Update apt before we install anything
       virtualbox-ovf: Hit http://us.archive.ubuntu.com precise Release.gpg
       virtualbox-ovf: Get:1 http://us.archive.ubuntu.com precise-updates Release.gpg [198 B]
       virtualbox-ovf: Get:2 http://security.ubuntu.com precise-security Release.gpg [198 B]
       virtualbox-ovf: Hit http://us.archive.ubuntu.com precise-backports Release.gpg
       virtualbox-ovf: Hit http://us.archive.ubuntu.com precise Release

    ...

       virtualbox-ovf: 2014-04-16 03:19:20,495 [818] Executing state module.wait for saltutil.refresh_modules
       virtualbox-ovf: 2014-04-16 03:19:20,503 [818] No changes made for saltutil.refresh_modules
       virtualbox-ovf: 2014-04-16 03:19:20,783 [818] Using cached minion ID from /etc/salt/minion_id: precise-amd64
       virtualbox-ovf: 2014-04-16 03:19:23,171 [818] Executing command ['oms'] in directory '/home/oms'
       virtualbox-ovf: 2014-04-16 03:19:23,250 [818] remove temporary path: /tmp/tmp_uM7Ph
       virtualbox-ovf: 2014-04-16 03:19:23,346 [818] remove temporary path: /tmp/tmpFLBf8B
    ...
       virtualbox-ovf: ### ------------------------------------------------------
       virtualbox-ovf: ### clean up apt
       virtualbox-ovf: Reading package lists... Done
       virtualbox-ovf: Building dependency tree
       virtualbox-ovf: Reading state information... Done
       virtualbox-ovf: 0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
       virtualbox-ovf:
       virtualbox-ovf: ### ------------------------------------------------------
       virtualbox-ovf: ### removing SSH keys from /root/ and /home/*
       virtualbox-ovf:
       virtualbox-ovf:
       virtualbox-ovf: ### ------------------------------------------------------
       virtualbox-ovf: ### cleanup network configuration (dhcp/udev)
       virtualbox-ovf: ### cleaning up dhcp leases
       virtualbox-ovf: ### cleaning up udev rules
   ==> virtualbox-ovf: Gracefully halting virtual machine...
       virtualbox-ovf: [sudo] password for oms:
       virtualbox-ovf: Broadcast message from root@precise-amd64
   ==> virtualbox-ovf: Preparing to export machine...
       virtualbox-ovf: Deleting forwarded port mapping for SSH (host port 3499)
   ==> virtualbox-ovf: Exporting virtual machine...
   ==> virtualbox-ovf: Unregistering and deleting imported VM...
   Build 'virtualbox-ovf' finished.
  
   ==> Builds finished. The artifacts of successful builds are:
   --> virtualbox-ovf: VM files in directory: builds/oms/v0.8.5-rc


You can then import the image as a new VM, in VirtualBox, and start hacking on
OMS directly, demoing and exploring the OMS TCC, OIDC, CoreID Registry, etc.

The resulting image can be found in ``packer/builds/oms/<version>/``, within
your local oms-kickstart repository.


A few key points about packer
-----------------------------

The details above are meant to get you started, the remainder of the document
will cover, if only briefly, various issues you should be aware of when using
these mechanisms to build VM images in OMS.


About build templates
~~~~~~~~~~~~~~~~~~~~~

Packer uses a simple json manifest to define templates for packer to build
images and containers from. The templates used to build Ubuntu VM for OMS and
kickstart the provisioning process are included in the `oms-kickstart
repository`_. On an OMS Host, these templates could be found in
``/var/oms/src/oms-kickstart/packer/templates/``.

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
build_name     specific to    name of the VM image and build directory.
               each template
system_memory  256            the amount of memory (MB) to setup the VM with.
system_user    oms            the username of packer's admin user. packer will
                              SSH to the new VM host as this user.
system_pass    oms            the password for packer's admin user
=============  =============  ==================================================

By default, the VM image that results has been setup with 256 MB of memory and a
single user (``oms``) has been created for administrative and automation
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
image build framework:

* *setup.sh*: Ensure the OMS administrative user has SSH directories and keys in
  place, and proper permissions on all files. Finally, copy the SSH keys to
  root's home.
* *vbox_guest.sh*: mount the VirtualBox Guest Additions .iso and run their
  installation script.
* *cleanup/ubuntu.sh*: use ``apt-get autoremove`` and ``apt-get clean`` to clean
  and clear up apt.
* *cleanup/network.sh*: remove stale DHCP leases/udev network configuration.
* *cleanup/ssh_keys.sh*: remove all SSH keys/config from ``/home/*/.ssh/`` and
  ``/root/.ssh/``.
* *cleanup/all.sh*: run all of the cleanup shell scripts.

These can be found in the ``packer/uploads/kickstart/`` directory within the
oms-kickstart repository.


About Each Build template
-------------------------

Packer uses json files, known as a *template* in packer parlance, to tell it
what to do. This is packer's concept of a manifest for the build process. The
v0.8.5 release includes five templates of interest in building VM images with
or for OMS.


ubuntu-base
~~~~~~~~~~~

**Overview**: Create a basic virtualbox VM image with a default Ubuntu 12.04 LTS
host system installed. Nothing more, nothing less. This build takes 45 to 90
minutes, as there is a complete Ubuntu install to run through.

Using packer's ``virtualbox-iso`` builder:

#. download Ubuntu's mini ISO for network-based installs;
#. initiate an automated install of Ubuntu 12.04 LTS;
#. run the shell script provisioners specified;
#. create an OVA-formatted image suitable for importing into VirtualBox.


The following provisioners will run:

#. vbox_guest.sh
#. cleanup/ubuntu.sh
#. cleanup/network.sh



oms/base/ubuntu_iso
~~~~~~~~~~~~~~~~~~~

**Overview**: Create the OMS base VM image (kickstart is not run), from a Ubuntu
ISO to install a new system.This build takes 45 to 90 minutes, as there is a
complete Ubuntu install to run through.

.. note::

   In practice, it makes more sense to use the ``ubuntu_ovf`` template as this
   will create a new OMS base image using an existing Ubuntu host.


Using packer's ``virtualbox-iso`` builder:

#. download Ubuntu's mini ISO for network-based installs;
#. initiate an automated install of Ubuntu 12.04 LTS;
#. run the shell script provisioners specified;
#. create an OVA-formatted image suitable for importing into VirtualBox.


The following provisioners will run:

#. setup.sh
#. vbox_guest.sh
#. cleanup/network.sh

*Kickstart is setup, but not run.*


Additional user variables available:

* ``oms_version``: the OMS version to use in naming the build image, defaults
  to *latest*.


oms/base/ubuntu_ovf
~~~~~~~~~~~~~~~~~~~

**Overview**: Create the OMS base VM image (kickstart is not run), from an
existing Ubuntu base image.

Using the ``virtualbox-ovf`` builder:

#. import an existing OVA image as a new host
#. upload the kickstart scripts, config, and SSH keys
#. run the OMS packer provisioner scripts (see below)
#. create an OVA-formatted image suitable for importing into VirtualBox.

The following provisioners will run:

#. setup.sh
#. cleanup/network.sh

*Kickstart is setup, but not run.*


Additional user variables available:

* ``ovf_path``: the full/relative path (on the filesystem) to the OVF image to
  import. This defaults to *builds/ubuntu-base/ubuntu-base.ova*. You may use
  a symlink to improve the development flow.
* ``oms_version``: used to create the vm image filename, defaults to
  *latest*.

Note that the kickstarted build will update those scripts and configs as well,
so it may seem as though there is little need for this base image - there are
subtle details that differentiate the two (the oms-base and kickstarted build
templates for packer). It is in these details you will find the usefulness of
their separation.

Note that this build template will not remove SSH keys while the kickstarted
template will.



oms/kickstarted
~~~~~~~~~~~~~~~

**Overview**: Using packer's ``virtualbox-ovf`` builder, import an existing OMS
base image and execute the OMS kickstart and peripheral provisioning scripts.


Using the ``virtualbox-ovf`` builder:

#. import an existing OVA image as a new host
#. upload the kickstart scripts, config, and SSH keys
#. run the OMS kickstart process and packer provisioner scripts (see below)
#. create an OVA-formatted image suitable for importing into VirtualBox.


The following provisioners will run:

#. kickstart-oms.py
#. cleanup/all.sh


Additional user variables available:

* ``ovf_path``: the full/relative path (on the filesystem) to the OVF image to
  import. This defaults to *builds/ubuntu-base/ubuntu-base.ova*. You may use
  a symlink to improve the development flow.
* ``oms_version``: used to create the vm image filename, defaults to
  *latest*.
* ``kickstart_cmd``: the command for running OMS kickstart, defaults to ``python
  kickstart-oms.py``.
* ``kickstart_opts``: the options to run OMS kickstart with, defaults to ``-H -c
  config/qa-develop.yaml -c config/pillar/qa-develop.yaml``.


oms/kickstarted-iso
~~~~~~~~~~~~~~~~~~~

**Overview**: Create a completely new Ubuntu VM, as a new install, using a Ubuntu
iso. Kickstart is then setup and run after this.


Using the ``virtualbox-iso`` builder:

#. download Ubuntu's server ISO for network-based installs;
#. initiate an automated install of Ubuntu 12.04 LTS;
#. upload the kickstart scripts, config, and SSH keys
#. run the OMS kickstart process and packer provisioner scripts (see below)
#. create an OVA-formatted image suitable for importing into VirtualBox.


The following provisioners will run:

#. setup.sh
#. vbox_guest.sh
#. kickstart-oms.py
#. cleanup/all.sh


Additional user variables available:

* ``oms_version``: used to create the vm image filename, defaults to
  *latest*.
* ``kickstart_cmd``: the command for running OMS kickstart, defaults to ``python
  kickstart-oms.py``.
* ``kickstart_opts``: the options to run OMS kickstart with, defaults to ``-H -c
  config/qa-develop.yaml -c config/pillar/qa-develop.yaml``.


Given the length of time it takes to complete a minimal/base install of a
Ubuntu host, it generally makes more sense to use the kickstarted template over
this one - it is faster to import the existing Ubuntu host and run kickstart.

.. include:: /snippets/get_help_footer.inc
