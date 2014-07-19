:title: OMS CoreID Registry Deployment
:description: How to deploy the OMS CoreID Registry
:keywords: OMS, CoreID Registry, developers, dev environment

.. _deploy_private_tcc:

OMS CoreID Trusted Compute Cell (TCC)
======================================

The current reference TCC is made up of four primary components, we will detail
two of them here in this document as we deploy and set them up - the OMS CoreID
Registry, and OpenID Connect (OIDC).

.. note::

   The details of what is in the reference TCC, how the CoreID and Personas
   implementations are structured, and many other details will move around
   as new components come online to replace older (stubbed) interfaces and
   components.


Deploy the TCC
--------------

The complete reference TCC is included in the default build, using the manifests
included in the oms-kickstart repository. Thus, if you have not yet initiated the
OMS build process with oms-kickstart, you run simply run the :ref:`process
detailed here <kickstart_oms>`.

If you have already run the build process with oms-kickstart, we can make a few
quick updates to the Root VRC and have the TCC installed.


Update Salt Pillar
~~~~~~~~~~~~~~~~~~

* Open ``/etc/salt/pillar/bootstrap.sls`` for editing.
* Locate the list - *reclass:localhost:classes*
* Update this list: comment out the *fullstack* and *oms-admin* manifests, and
  enabling/uncommenting the *oms-tcc-small-community* entry.
* Save the file.


Update Salt Tops
~~~~~~~~~~~~~~~~

We've changed the core list of manifests associated with this Cell, so we must
now ask the VRC to update itself.

To do so, run the following:

.. code::

   # salt-call --local state.sls reclass.update_tops


Deploy the TCC
~~~~~~~~~~~~~~

Here goes:

.. code::

   # salt-call --local state.highstate test=True


Review the output this generates as a sanity check to ensure there are no
obvious problems with the formula we are about to apply, then remove the
*test=True* bit and re-run the command.


CoreID and Persona Setup
------------------------

Please see :ref:`this guide <CoreID_TCC_Demo>` for details on how to
setup and run through the CoreID and Personas demo included in the reference
TCC.


Where to Next?
--------------

You have completed the setup required for a CoreID Trusted Compute Cell, and
you may now continue with any of the :ref:`OMS Tutorials <tutorials>`.

* Checkout the :ref:`list of tutorials <tutorials>`
* Deploy an existing TAB, either :ref:`Perguntus` or :ref:`GPS Demo <gps_demo>`
* :ref:`Create your own TAB <tab_tutorial>`
* Explore the :ref:`OMS Source Code <oms_source_code_map>`
* The CoreID Registry is `documented in more detail`_, as is :ref:`OpenID
  Connect <oidc>`.

.. _documented in more detail: https://docs.openmustardseed.org/oms-core/api/coreid_registry_tutorial.html
