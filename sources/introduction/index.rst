:title: Next Steps with OMS TCF
:description: Instroduction to OMS TCF concepts and next steps
:keywords: OMS, documentation, introduction, developers

.. _introduction:

Introduction to the OMS Trusted Compute Framework
===========================

In this section we will provide an introduction to the Open Mustard Seed Trusted
Compute Framework (OMS TCF):


Reinventing Big Data
--------------------

OMS solves a number of interrelated problems about Big Data. Users have not had
an easy or reliable means to express their preferences for how their personal
data may be accessed and used, especially when one context (a bank) differs so
much from another (a healthcare provider) and still others (family and friends).
A user may not know with whom they are really transacting, nor can they readily
verify that their privacy preferences are actually respected and enforced. Users
are often wary of exposing or sharing their data with third parties whose
trustworthiness is not known. In this context, it is not surprising that
protecting one's personal information is seen as antithetical to commercial and
governmental uses of it.

The Open Mustard Seed project seeks to overcome these problems through a
technical architecture called the "Trustworthy Compute Framework" (TCF). The TCF
extends the core functionality of "Personal Data Stores" (PDS) - digital
repositories in the cloud that let users strictly control their personal
information - by enabling online users to interact flexibly in secure,
trustworthy ways. The system architecture uses nested tiers of "trusted compute
cells" starting at the "private" level and moving up to portal and group levels.
The idea is to enable trusted social relationships and collaboration that can
scale. Each Trusted Compute Cell (TCC) - the basic unit of individual control
over data - enables users to curate their digital personas; manage the data that
they collect, produce and distribute; manage privacy settings for the various
social scenes and commercial vendors they interact with; and manage the
installation and availability of group-specific apps and services developed to
be deployed within various TCF architectures.


Data Empowerment
----------------

The terms of interaction between an individual's private TCC and any other TCC is
mediated with OpenID Connect-authenticated API connections. These application
programming interfaces have their terms and means of interaction and information
disclosure policies specified through Trusted Application Bundles (TAB). TABs
contain digital legal contracts that outline the opt-in terms of agreement for
online interactions provided by the deployment of the APIs contained within the
TAB's Manifests. These agreements are subsequently enforced, on behalf of the
persona- within the TCF to which the TAB instance was deployed. Furthermore, TABs
specify what data may be collected, accessed, stored, how it may be used, etc.;
what access control mechanisms and policies will govern data; and the
"constitutional rules" by which groups may form, manage themselves, and evolve.


**Section Contents:**

.. toctree::
   :maxdepth: 1

   Documentation <documentation>
   Architecture <architecture>


**Further Reading** - Next, you may be interested in one of the following guides:

* :ref:`Get Started with OMS <get_started>`
* :ref:`Tutorials - do stuff with OMS <tutorials>`
* :ref:`Contribute to OMS Development <contributing>`
