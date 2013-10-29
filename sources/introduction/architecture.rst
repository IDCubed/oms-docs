:title: Architecural Overview
:description: Introduction to OMS Architecture
:keywords: OMS, documentation, architecture, developers

.. _Architecture:

Architecture
------------

A Trust Framework is a combination of software mechanisms, contracts, and rules for defining, governing, and enforcing the sharing and protection of information according to a common and independently verifiable standard of performance.

The functional components are organized into distinct functional components: OpenID Connect authentication service and Registry, a Resource Server managing access to Personal Data Stores with TABs, and a Trust Framework REST service interface. Personal Data Stores are designed to facilitate migration to a distributed peer-to-peer architecture, where each member controls his or her Personal Data Store, which will not be resident within the Trust Framework server itself.

Personal Data Store: A protected Resource owned and controlled by a Participant to hold the Participant's personal data. The Participant controls access to use, modification, copying, derivative works, and redaction or deletion of the data they enter into the Trust Framework Personal Data Store, including, without limitation, data entered based upon sensor data passively collected from the Participant's smartphone, and also including, without limitation, audio, text, or survey responses input actively by the Participant.

TAB: Access to each Personal Data Store Resource is regulated through a TAB. The TAB permissions logic matches the Participant's sharing settings with Permissions mapping data, and determines whether to allow the data request.

The TAB may be specified by the institution hosting the Trust Framework and be used to reflect rules and permissions options granted to its users.

In addition to this implementation, we are developing a sort of "Computational Sandbox" that will allow developers to write web services that are easily queued, monitored, and destroyed in a protected environment in the cloud. The Computation Sandbox provides protected access to shared data and is authorized to publish results via a REST interface as long as the result does not violate rules and permissions of the TAB.

