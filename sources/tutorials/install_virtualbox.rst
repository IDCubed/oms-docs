:title: How to Install and Setup VirtualBox
:description: How to install and setup VirtualBox for use with OMS
:keywords: oms, vm, development, developer, release, virtualbox, image,


.. _install_virtualbox:

How to Install and Setup VirtualBox
===================================

The purpose of this document is to provide a resource of helpful information
related to VirtualBox within the context of running OMS. It is generic in nature,
so as to provide a generic foundation for other tutorials relying on the reader
to have a functional VirtualBox available to them.

.. note::

   The information in this tutorial is completely supplementary to the official
   documentation maintained by the VirtualBox project.
   `The User Manual`_, and `the Installation Guide`_ are good references to
   start with.

.. _The User Manual: https://www.virtualbox.org/manual/UserManual.html
.. _the Installation Guide: https://www.virtualbox.org/manual/ch02.html


Installing VirtualBox
---------------------

VirtualBox has documentation for each of its supported OS:

* `Windows`_
* `MacOSx`_
* `Linux`_

.. _Windows: https://www.virtualbox.org/manual/ch02.html#installation_windows
.. _MacOSx: https://www.virtualbox.org/manual/ch02.html#idp54312608
.. _Linux: https://www.virtualbox.org/manual/ch02.html#install-linux-host

In general, the process involves `downloading the VirtualBox`_ release executable
and installing the release using the tools available on the platform.

.. _downloading the VirtualBox: https://www.virtualbox.org/wiki/Downloads


You may prefer to rely on your OS and the software distribution/packaging
available to you. As an example, in debian, installing VirtualBox 4.3 would look
like:

.. code::

   wget -q http://download.virtualbox.org/virtualbox/debian/oracle_vbox.asc -O- | sudo apt-key add -
   echo "deb http://download.virtualbox.org/virtualbox/debian squeeze contrib non-free" > /etc/apt/sources.list.d/virtualbox.list
   apt-get update
   apt-get install virtualbox-4.3


Steps will differ for other Linux distributions. VirtualBox is also available for
FreeBSD, PCBSD, and Solaris-based OS.


VirtualBox Setup
----------------

It is generally best to setup a folder dedicated to storing the VM images created
as part of your work. It ought to be easy to backup this folder to another storage
device. External HD and those with sensitive data ought to consider encrypting
this filesystem as well.

While VM will run fairly well without it, be sure to install and use the `Guest
Additions`_ capabilities - this can provide significant performance boosts and
sensible integration of the Host and Guest VM (with the paste buffer, for
example), or `Shared folders`_.

.. _Guest Additions: https://www.virtualbox.org/manual/ch04.html
.. _Shared folders: https://www.virtualbox.org/manual/ch04.html#sharedfolders


In regards to network configuration for VM, this will depend on your needs and
level of technical expertise. In general, use *Bridged Network* to expose your
VM to the network the Host is connected to. In this mode, your VM will get an
IP from and be seen on this network.

*NAT* can be used, and in this mode, the Host would forward network traffic to
the VM. Port forwarding rules must be created (in VirtualBox VM settings) for
the specific ports to expose. There are other modes, but they are less useful
with OMS at the moment.

More details can be found in the `Virtual Network documentation`_.

.. _Virtual Network documentation: https://www.virtualbox.org/manual/ch06.html


Advanced Configurations
-----------------------

VirtualBox is quite powerful and can be used in a number of more advanced ways.
It can be run in `headless`_ mode where the Host OS has no graphical display, and
provides a `web interface`_ for remote management of VM.

.. _headless: https://www.virtualbox.org/manual/ch07.html
.. _web interface: https://www.virtualbox.org/manual/ch09.html#vboxwebsrv-daemon

Lastly, VirtualBox includes the `VBoxManage`_ utility for managing VM from the
command line. While some may find this to be a very easy and efficient way to
update VM (faster than navigating VirtualBox's cumbersome settings manager), it
also allows configuration options not provided by the VirtualBox GUI.

.. _VBoxManage: https://www.virtualbox.org/manual/ch08.html


As an example, the following will add a physical hard disk to a VM for direct
read/write access. This can be handy when trying to leverage the power of VMs
to wrangle in OS on unruly boxen:

.. code::

   VBoxManage internalcommands createrawvmdk -filename /home/user/VirtualBox/raw_disk.vmdk -rawdisk /dev/sdb -partitions 3 -relative


With the raw disk created, you can then add it to a new or existing VM just as
any other virtual disk in VirtualBox.
