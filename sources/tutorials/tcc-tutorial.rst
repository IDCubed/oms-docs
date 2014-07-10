:title: TCC Development Tutorial
:description: Tutorial for developing TCCs (Trusted Computer Cells).
:keywords: oms, tcc, trusted, rTCC, development, developer,


.. _tcc_tutorial:

TCC Development Tutorial
========================

This tutorial is a guide for developing Trusted Compute Cells (TCCs) for the
Open Mustard Seed (OMS) platform, built as extensions to the Root TCC (rTCC).

.. note::

  This tutorial should be used on either the :ref:`importable virtual
  appliance <deploy_development_vm>` or an :ref:`OMS Host in the Cloud
  <kickstart_oms>`.


Introduction
------------

This tutorial is an easy-to-follow guide to developing TCCs that leverage the
power of the OMS framework. Throughout it, we develop a simple TCC as an
extension of the rTCC as a generic base on which new types of TCC can easily be
built.

We'll cover the following topics:

* :ref:`Introduction to the rTCC <rTCC_intro>`
* :ref:`Extend the rTCC <extend_rTCC>`
* :ref:`Define a new type of TCC <define_new_tcc>`_


.. _rTCC_intro:

The Root Trusted Compute Cell (rTCC)
------------------------------------

The rTCC is meant to provide the bare minimum base into which one or more Trusted
Application Bundles (TABs) may be deployed as a new type of TCC. In other words,
the rTCC defines the basic components of an OMS TCC as a container for additional
TABs to be deployed and run.


What is included in the rTCC?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As of *v0.8.6.2*, the rTCC includes the following components:

**Root Virtual Resource Controller (rVRC)**

By combining `SaltStack`_, `Reclass`_, and numerous system automation formula
for various services and applications, the OMS rVRC provides an extensible and
powerful foundation for the development and deployment of cloud-based
applications. Salt is deployed in a masterless, stand-alone configuration, and
reclass has been configured to manage all aspects of the formula and manifests
associated with the TCC instance. 

.. _SaltStack: http://www.saltstack.com
.. _Reclass: http://reclass.pantsfullofunix.net


**OMS Core**

The OMS deployment library (oms-deploy), administrative utility (oms-admin), and
all OMS source code.


**The ELK Logging Stack**

Combining `Elasticsearch`_, `Logstash`_, and `Kibana`_, the ELK Stack provides
a powerful foundation for the collection, indexing and interaction with the log
messages produced by the TCC and the services and applications deployed within.

.. _Elasticsearch: http://www.elasticsearch.org
.. _Logstash: http://www.logstash.net
.. _Kibana: http://www.elasticsearch.org/overview/kibana/


**The TCC Health Metric**

To be included in the upcoming *v0.8.6.3* release.


**Set Master**

To be included in the upcoming *v0.8.6.3* release.


What is not included?
~~~~~~~~~~~~~~~~~~~~~

The rTCC is the most minimal set of components that form the basis for TCCs in
OMS, and it makes no assumptions about what the developer will want to use in
building and deploying TABs into a TCC.

As of the *v0.8.6.2* release, the rTCC does not include nginx, uwsgi, postgres,
tomcat, or any of the other services typically included or used by OMS TABs.
Instead, the rTCC provides the developer with the means to build TCC using the
core components and services they need.


Getting the rTCC
~~~~~~~~~~~~~~~~

The rTCC is currently distributed as a downloadable VM appliance, though it may
also be deployed through *oms-kickstart*. Additional documentation to come.


.. _extend_rTCC:

Extending the rTCC
------------------

In this example, we will demonstrate extending an instance of the rTCC with
nginx, uwsgi, and postgres - the most common services used in OMS reference TABs
and demos.

Each of these services has a manifest defined in the rVRC, currently located in
``/etc/salt/states/manifests/``:

.. code::

   root@oms-dev:/etc/salt/states/manifests# ls -alh {nginx,postgres,uwsgi}*

   -rw-r--r-- 1 root root 43 Jun 30 20:55 nginx.yml
   -rw-r--r-- 1 root root 27 Jun 30 20:55 postgres.yml
   -rw-r--r-- 1 root root 24 Jun 30 20:55 uwsgi.yml


The rTCC manifest is found in ``oms/tcc/rTCC.yml`` (within the manifest path),
and is defined as:

.. code:: yaml

   classes:
     - oms-admin
     - oms.tab.elk-stack


This manifest is processed by reclass, and simply inherits the *oms-admin* and
*oms.tab.elk-stack* manifests. The OMS Admin manifest ensures the core OMS
components (oms-deploy, oms-admin, and all OMS source code) are present in the
rTCC, while the ELK Stack TAB includes the Elasticsearch, Logstash, and Kibana
services (as a bundle).

To add nginx, uwsgi, and postgres to this rTCC, we would update the rTCC manifest
with the following:

.. code:: yaml

   classes:
     - oms-admin
     - oms.tab.elk-stack
     - nginx
     - uwsgi
     - postgres


With the manifest updated, we can review the full list of formula and details
defined by the collection of manifests associated with this instance of the rTCC
using reclass:

.. code::

   root@oms-dev:~# reclass -n oms-dev | less


.. note::

   Update *oms-dev* with the correct hostname for your host, if applicable.


If you have updated or changed the git repositories in ``/var/oms/src/`` in any
way, take note of the revisions for the OMS source code included in the rTCC. If
a specific git revision (branch/tag/commit) is needed for one or more
repositories, the rTCC manifest can be updated to include these details. For
example, if the ``qa-develop`` branch were needed for the oms-experimental and
oms-core repositories, the rTCC manifest would be updated to include:

.. code:: yaml

   classes:
     - oms-admin
     - oms.tab.elk-stack
     - nginx
     - uwsgi
     - postgres
   parameters:
     oms:
       repos:
         oms-experimental:
           rev: qa-develop   
         oms-core:
           rev: qa-develop   


As exemplified here, it is only necessary to define the specific keys that must
be updated. The changes to the manifest can then be reviewed within the context
of all manifests associated with the rTCC - we use reclass to confirm these
updates:

.. code::

   root@oms-dev:~# reclass -n oms-dev | less

   
When reviewing the updates, the following will be seen:

.. code:: yaml

   ...
      oms-core:
        rev: qa-develop
        url: git@github.com:IDCubed/oms-core.git
      oms-deploy:
        rev: v0.8.6.2
        url: git@github.com:IDCubed/oms-deploy.git
      oms-docs:
        rev: v0.8.6.2
        url: git@github.com:IDCubed/oms-docs.git
      oms-experimental:
        rev: qa-develop
        url: git@github.com:IDCubed/oms-experimental.git
   ...


When ready to apply the updates from the manifest, to the rTCC, use the rVRC:

.. code::

   root@oms-dev:~# salt-call --local state.highstate test=True


.. note::

   We include ``test=True`` when running this command to ensure you have the
   opportunity to review the updates the rVRC will make, before they are made.
   Drop this bit from the command to actually apply the formula. Also note that
   when applying the formula in test mode, several states will be noted as
   failing. This is because the formula is looking to try to run a service that
   has not yet been installed/setup (such as the nginx or postgres services).


Applying the formula will produce a lot of output to stdout, so it is helpful to
run these commands from within an instance of tmux (allowing you to easily review
the output). When the formula have been applied, you will see the following at
the very end, confirming success:

.. code::

   Summary
   --------------
   Succeeded: 121
   Failed:      0
   --------------
   Total:     121


.. .. _define_new_tcc:
.. 
.. Define a New TCC
.. ----------------
.. 
.. Rather than updating the rTCC manifest, we can also create a new manifest to
.. define a new TCC as an extension of the rTCC. To do so, first create the new
.. manifest in ``/etc/salt/states/manifests/oms/tcc/``, in this example we will
.. name this TCC as *myTCC*, and include the updates from the last section. Be
.. sure to first reset the updates to the *rTCC.yml* manifest, then create the
.. new manifest with the following:
.. 
.. .. code:: yaml
.. 
..    classes:
..      - oms.tcc.rTCC
..      - nginx
..      - uwsgi
..      - postgres
..    parameters:
..      oms:
..        repos:
..          oms-experimental:
..            rev: qa-develop
..          oms-core:
..            rev: qa-develop
..    
.. 
.. The *myTCC* manifest can now be associated with the host. As of the *v0.8.6*
.. series release, this is a bit of a cumbersome process.
