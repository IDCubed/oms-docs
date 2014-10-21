:title: OMS GithubCode Map
:description: source code, git, repository, code, github,
:keywords: contributing, oms, documentation, source code, github, dev environment,


.. _oms_source_code_map:


OMS Source Code Map - v0.8.6.5
==============================

Here is an overview of the source code included in the Open Mustard Seed Release.

OMS creates the framework for an ecosystem of modules, and instances of OMS
nodes are living reflections (or different representations) of these ecosystems
- instances and their constituents are each simultaneously parts of the whole.

Each part aims to be a fully capable holon within the holarchies it chooses
(or is elected) to be a part of, and documentation is no different. Each
repository with OMS source code aims to be as self-documented, and complete as
possible. This is a work in progress, especially as new repositories rapidly
come online.


karma-jasmine-ajax
------------------

Karma adapter for Jasmine plugin for faking Ajax responses in your tests -
:github-repo:`GitHub<karma-jasmine-ajax>`

Karma adapter for Jasmine plugin for faking Ajax responses in your tests.


oms-admin
---------

Administrative utilities for the OMS Trusted Compute Framework (TCF) -
:github-repo:`GitHub<oms-admin>` - :external-doc:`Overview Docs <oms-admin>`

A generic Trusted Compute Framework needs the generic structures for the
administrative and management tasks - oms-admin aims to build a modular,
command-driven, framework for administrative tasks. Built in Python and leveraging
the oms-deploy Python deployment and system automation library.


oms-chat
--------

Simple chat application demonstrating auth/auth and group functionality -
:github-repo:`GitHub<oms-chat>`

Simple chat application demonstrating authentication, authorization, and group
functionality.


oms-core
--------

Core Module Repository - OMS Reference Trusted Application Bundles (TABs) -
:github-repo:`GitHub<oms-core>` - :external-doc:`Overview Docs <oms-core>` -
:external-doc:`Inline Docs <oms-core/modules/oms-core.html>`

OMS Trusted Application Bundles (TABs) are often assembled from many small,
reusable components - the reference TABs included with OMS build on these core
modules, implemented as Django/Python pluggable modules, though OMS TABs may be
implemented in any language and application development environment/framework.


oms-core-ios
------------
Core iOS components for OMS -
:github-repo:`GitHub<oms-core-ios>`

OMS apps and libraries for the iOS platform.


oms-core-js
-----------
Core JavaScript components for OMS -
:github-repo:`GitHub<oms-core-js>`

OMS JavaScript frameworks, libraries, and other frontend code.


oms-deploy
----------

OMS TAB Deployment and System Automation Library -
:github-repo:`GitHub<oms-deploy>` - :external-doc:`Overview Docs <oms-deploy>`

Python deployment and system automation library, evolving to cover more territory.


oms-docs
--------

OMS Trusted Compute Framework (TCF) - Project Documentation -
:github-repo:`GitHub<oms-docs>`

The source code to this documentation you are reading - technical documentation
is easy to manage when seen as code, on par with the rest of the source code to
the project. As such, it is managed with Git, formatted with a markup
(ReStructured Text), and built/compiled with a framework that makes managing
documentation easier and enjoyable.


oms-experimental
----------------

Experimental Module Repository - OMS Reference TABs -
:github-repo:`GitHub<oms-experimental>` - :external-doc:`Overview Docs
<oms-experimental>`

The reference TABs included in OMS are built with modules from this repository.


oms-inside
----------

Module repository for the OMS "Inside" TAB -
:github-repo:`GitHub<oms-inside>`

Module repository for the OMS "Inside" TAB.


oms-kickstart
-------------

Kickstart Open Mustard Seed - To the Cloud we GO! -
:github-repo:`GitHub<oms-kickstart>` -
:external-doc:`Overview Docs <oms-kickstart>`

As a holonic system, OMS needs a generic mechanism to support the framework's
diverse deployment needs. These needs manifest as different flows, or steps
through deployment, some with wildly differnt outcomes - oms-kickstart aims to
be the initial player in establishing the generic deployment structures. A set
of salt states and configuration (pillar + system configs) are embedded into an
executable system automation framework built on salt stack.


oms-oidc
--------

OpenID Connect, built for OMS, with support for OMS' CoreID and Personas. -
:github-repo:`GitHub<oms-oidc>` - :external-doc:`Overview Docs <oms-oidc>`

The MITREid OpenID Connect server, extended to support OMS concept of CoreID
and Personas. Built in Java, on the Spring Framework, implemented as a Maven
overlay of the MITREid OIDC project.


oms-root-id
-----------

Specifications for the OMS Root Identity System -
:github-repo:`GitHub<oms-root-id>`

Specifications for the OMS Root Identity System (RIDS).


oms-salt-core
-------------

Core Salt States for OMS System Automation -
:github-repo:`GitHub<oms-salt-core>` -
:external-doc:`Overview Docs <oms-salt-core>`

The core of OMS System Automation is built on and around SaltStack, and at the
core of this stack are a set of salt states and configuration profiles (reclass
parameter definitions) that are used to build the core of the Linux/UNIX OS.
This constitutes the OMS Host, and on which we build  other OMS components.


oms-salt-tcf
-------------

Salt States and System Automation Bits for the OMS Trusted Compute Framework (TCF) -
:github-repo:`GitHub<oms-salt-tcf>` - :external-doc:`Overview Docs <oms-salt-tcf>`

With the core of the OMS Host in place, the salt states and configuration profiles
from this repository constitute the OMS Trusted Compute Framework - the services,
applications, configurations, and many other little bits and bytes that make up
the hosting platform for Trusted Application Bundles and other OMS (application
level) components.


oms-ui
------

UI Module Repository for Reference TABs built on OMS -
:github-repo:`GitHub<oms-ui>` - :external-doc:`Overview Docs <oms-ui>`

Reusable UIs for OMS reference TABs, built on Bootstrap, jQuery, Django, and
others.


oms-vrc
-------
OMS Virtual Resource Controller -
:github-repo:`GitHub<oms-vrc>`

The VRC automates the management of all aspects of the OMS Trusted Compute Cell.


python-oidc
-----------

Python client library to OMS-OIDC -
:github-repo:`GitHub<python-oidc>` - :external-doc:`Overview Docs <python-oidc>`

Client library for interacting with an OMS OpenID Connect Server, though this
Python library ought to work with a MITREid Server as well.

