:title: TAB Development Tutorial
:description: Tutorial for developing TABs (Trusted Application Bundles)
:keywords: oms, tab, trusted, application, bundle, development, developer,


.. _tab_tutorial:

Creating a Trusted Application Bundle (TAB)
===========================================

This is the first tutorial in the TAB Development Series, and will get you
started on the path to creating TABs for the Open Mustard Seed (OMS) platform.

.. note::

  This tutorial should be used on either the :ref:`importable virtual
  appliance <deploy_development_vm>` or an :ref:`OMS Host in the Cloud
  <kickstart_oms>`.


.. _tab_tutorial_overview:

Introduction
------------

This tutorial is meant to be an easy-to-follow guide to developing TABs that
leverage the power of the OMS framework. Throughout it, we develop a simple TAB,
building it from scratch and adding OMS-supported features one step at a time.

The complete tutorial has been split up into separate documents to lighten the
cognitive load and to give you a chance to absorb the concepts and explore the
system.

We'll cover the following topics:

* `Creating a TAB`_ - 
* `Adding the API Console`_
* `Adding Django Admin support`_
* `Adding django-constance support`_
* `Adding OpenID Connect validation`_
* `Adding PDS support`_
* `OMS FACT API Transforms`_


Creating a TAB
--------------

Let's start by creating a TAB with a single app. Here are the steps we will
take in this process:

1. create the web app as a Django project
2. create OMS-compatible modules from the Django project
3. write our own manifest to deploy the app
4. include the TAB in a manifest collection

Another way to go about this would be to start with a deployable manifest and
build out from there, but this is a more advanced route to take.


