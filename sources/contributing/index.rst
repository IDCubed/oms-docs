:title: Contributing to OMS
:description: Contribution Guide: creating issues, development environment,
              conventions, pull requests
:keywords: contributing, oms, documentation, help, guideline, dev environment


.. _contributing:

Contributing to OMS
===================

Start first by reviewing `this document on the OMS Wiki`_ for a walkthrough of
some of our development processes.

.. _this document on the OMS Wiki: https://wiki.idhypercubed.org/wiki/ProjectDocumentation#Developer_Resources


When you are ready to start hacking, you can either download and setup the OMS
development environment as an importable VM image, or create your own
environment from a fresh install of Ubuntu 12.04 LTS and with the help of the
OMS systems automation tools. The VM is intended to be a self-contained system
and includes a running private TCC.

:ref:`This guide will get you started with the development VM
<deploy_development_vm>`.

:ref:`Kickstart a new Ubuntu 12.04 LTS host with this guide <kickstart_oms>`.


With an OMS development environment setup, you can get started contributing to
OMS. See each section below based on where your contributions will be made:

.. toctree::
   :maxdepth: 1

   Documentation <documentation>
   OpenID Connect </oidc/developers_guide>
   Build OMS VM Images <vm_images>
   Release Process <releases>
