:title: API Documentation Overview
:description: An overview of the API documentation available in OMS
:keywords: oms, api, documentation, overview, intro, introduction,


.. _api_doc_overview:

API Documentation
=================

OMS creates the framework for an ecosystem of modules, and instances of OMS
nodes are living reflections (or different representations) of these ecosystems
- instances and their constituents are each simultaneously parts of the whole.

Each part aims to be a fully capable holon within the holarchies it chooses
(or is elected) to be a part of, and documentation is no different. Each
repository with OMS source code aims to be as self-documented, and complete as
possible. This is a work in progress, especially as new repositories rapidly
come online.

Here is a breakdown of the documentation projects embedded in each OMS source
code repository. It is intended that each repository is capable of accurately
representing themselves within the OMS ecosystems they are a part of.


TAB Modules
~~~~~~~~~~~

:external-doc:`oms-core` - Core modules and manifests for OMS Trusted Application
Bundles included in the TCC reference implementation.

:external-doc:`oms-experimental` - Modules for OMS experimental TABs.

:external-doc:`oms-ui` - UI modules for various TABs.


OMS Build System (Deployment)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:external-doc:`oms-kickstart` - Kickstart new OMS builds on Ubuntu hosts.

:external-doc:`oms-admin` - OMS Administrative Utility (Command line).

:external-doc:`oms-deploy` - OMS Deployment library (Python).


System Automation
~~~~~~~~~~~~~~~~~

:external-doc:`oms-salt-core` - Core system automation formula (for SaltStack),
for the OMS Virtual Resource Controller (VRC).

:external-doc:`oms-salt-tcf` - System automation formula for the OMS Trusted
Compute Framework.


Other
~~~~~

:external-doc:`oms-vrc` - OMS Virtual Resource Controller.

:external-doc:`python-oidc` - Python client library to OMS-OIDC.
