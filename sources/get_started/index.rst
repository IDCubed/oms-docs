:title: Getting Started with OMS
:description: Guide on how to get started with OMS
:keywords: OMS, documentation, developers, dev environment

.. _get_started:

Getting Started with OMS
========================

OMS is very flexible and can be used to support a wide variety of use cases. In
this section we will review what you need to know to get started with OMS. What
this means will vary depending on the specifics of what you want to do, so we
will try to include as many examples for inspiration as we have available.

At present, there are two primary entry points for using OMS, each of which will
provide a good introduction to the basics of how the OMS framework is structured
and the concepts OMS is working with.


OMS VirtualBox Appliance
------------------------

We have a complete OMS deployment distributed as an importable VirtualBox virtual
appliance. The :ref:`OMS VirtualBox Setup Guide <deploy_development_vm>` steps
through the import and setup process.

This appliance includes:

* a reference implementation of the OMS Trusted Compute Framework (TCF)
* a reference implementation of a Personal Trusted Compute Cell (TCC). This
  includes the OMS CoreID and Persona through OpenID Connect and the CoreID
  Registry.
* a basic interface for managing OMS Personas, implemented as a Trusted
  Application Bundle (TAB) for reference.
* all OMS source code, including the manifests and code to deploy two additional
  reference TABs, GPS Demo and Perguntus for data collection in OMS.
* the system automation to set up and manage the details of the services deployed


The appliance demonstrates:

* the OMS Trusted Compute Framework
* system automation in OMS
* how applications are built in OMS
* how authorization and token approvals work with OpenID Connect
* how OMS makes use of Core Identities and Personas with configurable attributes
* how to run OMS from your laptop and on your own resources


While this is the only virtual appliance at present, future releases will include
additional appliances to provide this type of setup for other OMS components.


Run OMS in the Cloud
--------------------

OMS Trusted Compute Cells can also be deployed to the Cloud. The first step is
to :ref:`Kickstart OMS on a VM in the Cloud<kickstart_oms>`.

This kickstart process will get OMS set up on your host and get you to the point
where you can either:

* :ref:`deploy a Trusted Compute Cell <deploy_tcc>`
* :ref:`create a new TAB <tab_tutorial>`
* :ref:`hack on any of the OMS components <whatsnext>`, from system automation
  to our demo TABs and documentation.

.. note::

   Use the importable OMS VM appliance noted above if you are looking for a
   simple introduction to OMS.


There are different types of TCCs - Personal, Group, and Portal. Additional TCCs
may be defined in the future, and the details of these TCCs are still being
documented. For now, the Personal TCC is the best demonstration of an OMS TCC.


Section Contents
----------------

.. toctree::
   :maxdepth: 1

   OMS Dev VM <tab_dev_environment>
   Kickstart OMS in the Cloud <kickstart_oms>
   Private TCC <private_tcc>

.. Virtual Resource Controller <vrc>
   Trust Network <trust_network>
   Trusted Compute Cells <tcc>
   Portal Registry <portal>
