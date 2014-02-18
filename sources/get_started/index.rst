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
applicance. The :ref:`OMS VirtualBox Setup Guide <deploy_development_vm>` steps
through the import and setup process.

This applicance includes:

* a Personal Trusted Compute Cell (TCC) with OpenID Connect, a User Registry, and
  two example Trusted Application Bundles (TABs) to demo a basic OMS TCC
* all OMS source code
* system automation to setup and manage the details of the services deployed


The appliance demonstrates:

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

This kickstart process will get OMS setup on your Host and get you to the point
where you can either:

* :ref:`deploy a Trusted Compute Cell <deploy_tcc>`
* :ref:`create a new TAB <tab_tutorial>`
* :ref:`hack on any of the OMS components <contributing>`, from system automation
  to our demo TABs and documentation.


There are different types of TCCs - Personal, Group, and Portal. Additional TCC
may be defined in the future, and the details of these TCC are still being
documented, but for now the Personal TCC is the best demonstration of an OMS TCC.


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
