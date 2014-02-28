:title: Getting Started with OMS
:description: Guide on how to get started with OMS
:keywords: OMS, documentation, developers, dev environment


.. _get_started:

Get Started with OMS
====================

.. toctree::
   :maxdepth: 1
   :hidden:

   Importable VM Images <importable_vms>
   Kickstart OMS in the Cloud <kickstart_oms>
   Private TCC <private_tcc>

.. OMS Dev VM <tab_dev_environment>
   Virtual Resource Controller <vrc>
   Trust Network <trust_network>
   Trusted Compute Cells <tcc>
   Portal Registry <portal>


OMS is very flexible and can be used to support a wide variety of use cases, we
have made sure of it. In this section, we will review the various entry points
into the Holonic OMS Multi-Verse, what exists and what to expect, and what you
need to know to get started with OMS. This section assumes you have read through
the :ref:`Introduction to OMS <introduction>`.

.. note::

   Open Mustard Seed *is* a paradigm shift, one that builds on many other shifts
   presently sweeping through the World of Information Technology - do not expect
   to grok everything presented in a day.  Expect that you need to work, but that
   each of your efforts will return a pay-off far greater than you originally
   imagined.


What this means will vary depending on the specifics of what you want to do, so
we will try to include as many examples for inspiration as we have available. We
will also try to ensure we reference the various options you may have as
next-steps, as you progress through to experience various aspects of the OMS
Multi-Verse.


Three Primary Entry Points
--------------------------

#. **Pre-Installed, Downloadable, Importable, Virtual Appliances**: OMS, on a VM
   you can run on your laptop, or anywhere you can import the Open Virtual
   Appliance (``.ova``) images. The images are built with OMS Automation and
   Build tooling, GPG signed, and encrypted. They are intended for both
   high-level demonstrations of OMS' features as well as advanced development
   and exploration of the OMS Holonic Multi-Verse.

#. **Join an Existing Eco-System**: Fully functional, active and holonic
   deployments of the OMS Trusted Compute Framework. Soon-to-be Online!

#. **Build Your Own!** - Like to dive into the details? Need complete control
   over the entire build process and the end result? Still want it to be easy?
   Pick up the source code (start with one repository), and we'll guide you
   through the rest.


.. note:: Regarding Access to the Source Code

   The OMS Trusted Compute Framework (TCF) is presently in a private *alpha*
   release with the v0.8.x series - while :ref:`the code source
   <oms_source_code_map>` is available through github, you will need to be setup
   with access. When we feel the framework meets enough of our vision for public
   consumption, there will be a grand public release with great fanfare. If you
   would like to be added as a developer prior to our public release, please
   contact ``oms-dev`` (at) ``idcubed`` (dot) ``org``.


.. image:: /images/intro/How_to_Get_Started_with_OMS.png
   :alt: How to Get Started with OMS
   :align: center
   :width: 640px


Importable VM Appliances
------------------------

The simplest introduction is available through a set of *importable* virtual
machine images (appliances), distributed in the Open Virtualization Appliance
(``.ova``) file format supported by many paravirtualization systems. See the
overview below, or the details of the download and setup process in the
:ref:`Importable VM Images Guide <importable_vms>`.

We have complete OMS deployments distributed as importable VirtualBox virtual
applicances. Please see the :ref:`OMS VirtualBox Setup Guide<deploy_development_vm>`
if you need assistance getting a paravirtualization system installed and setup.
While the images have been built and tested with VirtualBox, VMWare, XEN, etc
should all be capable of running the VM, check for their support of the ``.ova``
file/image format.


.. note::

   More details about the OMS :ref:`VM build <vm_builders_guide>` and
   :ref:`product release <contribute_release>` processes are included in the
   :ref:`contributing section <contributing>`. Built with automated tooling based
   on `packer.io`_, `VirtualBox`_, and OMS, the process is both flexible and
   extensible. You will need access to the full :ref:`list of OMS source code
   <oms_source_code_map>` repositories.

.. _packer.io: http://www.packer.io
.. _VirtualBox: https://www.virtualbox.org


OMS TCF Demo
~~~~~~~~~~~~

This applicance includes:

* the OMS Linux SDK base (below), but with the OMS TCF setup and a TCC deployed
* a Personal Trusted Compute Cell (TCC) with OpenID Connect, a User Registry, and
  two example Trusted Application Bundles (TABs) to demonstrate OMS/TCC/TAB
  functionality.
* all OMS source code
* system automation to setup and manage the details of the services deployed


The appliance demonstrates:

* how applications are built in OMS
* how authorization and token approvals work with OpenID Connect
* how OMS makes use of Core Identities and Personas with configurable attributes
* how to run OMS from your laptop and on your own resources


OMS Linux SDK
~~~~~~~~~~~~~

This applicance includes:

* bare-bones Ubuntu 12.04 + Open Mustard Seed
* system automation to setup and manage the details of the services deployed
* all OMS source code


The appliance provides a foundation for hacking on the OMS TCF platform, and is
of interest to developers building applications for the cloud:

* TCF and TAB Development
* OMS Automation and System Provisioning
* Trust Network and Hosting Infrastructure


Run OMS in the Cloud
--------------------

OMS Trusted Compute Cells can also be deployed to the Cloud. The first step is
to :ref:`Kickstart OMS on a VM in the Cloud<kickstart_oms>`.

This kickstart process will get OMS setup on your Host and get you to the point
where you can either:

* :ref:`deploy a Trusted Compute Cell <deploy_tcc>`
* :ref:`create a new TAB <tab_tutorial>`
* :ref:`hack on any of the OMS components <contributing>`, from system automation
  to our demo TABs and documentation.


.. todo:: update these bits here.

There are different types of TCCs - Personal, Group, and Portal. Additional TCC
may be defined in the future, and the details of these TCC are still being
documented, but for now the Personal TCC is the best demonstration of an OMS TCC.


Join an Existing OMS Community
------------------------------

The Seeds are off on the wind, and will soon be brought online!
