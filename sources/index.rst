:title: Open Mustard Seed Documentation
:description: An overview of the OMS Documentation
:keywords: OMS, Open Mustard Seed, TCF, concepts, explanation

.. _overview:

Open Mustard Seed Trusted Compute Framework
===========================================

**A Framework for developing and deploying secure cloud applications to collect,
compute on, and share personal data**

The Open Mustard Seed (OMS) project is an open-source framework for developing
and deploying web apps in a secure, user-centric personal cloud. The framework
provides a stack of core technologies that work together to provide a high level
of security and ease of use when sharing and collecting personal and
environmental data, controlling web-enabled devices, and engaging with others to
aggregate information and view the results of applied computation via protected
services.


Releases
--------

`Now available`_ as an alpha release (Spring 2014), Open Mustard Seed is both a
framework for trusted computing, as well as a set of reference implementations
built on that framework (the Trusted Compute Framework or TCF). Thus, OMS
provides a collection of tools and applications that aim to let people build
their own highly distributed social ecosystems with reliable management of
various types of shared resources, including their personal data.

OMS provides lightweight frameworks focused on meeting the most generic form of
a need. In particular, OMS includes a powerful framework for bootstrapping new
hosts and application stacks with specific needs in simple, declarative, and
repeatable ways. OMS is used to build OMS.

OMS also provides an implementation of a Trusted Compute Framework as the
foundation to support the identity management included in OMS. The software is
a synthesis of a variety of existing software systems - for digital identity,
security, computable legal contracts, and data-management - designed to serve as
a new platform for social and economic exchange.

Just as the original HTML code gave rise to the World Wide Web and new types of
bottom-up social communication and collaboration, OMS can be understood as a new
"social stack" of protocols.

A simple yet powerful way to experience Open Mustard Seed is through the
importable VM appliance, distributed by IDCubed. You may use `this form`_ to
make requests for early access to the OMS source code.

.. _Now available: https://alpha.openmustardseed.org/downloads/
.. _this form: https://alpha.openmustardseed.org/downloads/


Where to Get Started
--------------------

* :ref:`Overview of OMS Documentation <api_doc_overview>`
* :ref:`Introduction to OMS Concepts <introduction>`
* :ref:`Get Started with OMS Demos and Development <get_started>`
* :ref:`Dive into Tutorials <tutorials>`
* :ref:`Next Steps <next_steps>`


Leveraging the Open-Source Community
------------------------------------

The framework is made possible by integrating and building on top of numerous
projects including (we strongly believe in the DRY principles):

* `Python`_, `Java`_, `PIP`_, `Maven`_
* `Django`_, `Tastypie`_, `Spring`_
* `Bootstrap`_, `jQuery`_, `Backbone.js`_, `Underscore.js`_
* `Jinja2`_, `ConfigObj`_, `Celery`_, `Fabric`_
*  `Nginx`_, `uWSGI`_, `Apache Tomcat`_, `Zeromq`_
* `Funf`_
* `OpenID Connect`_
* `Salt Stack`_, `Salt-Cloud`_, `Salt-API`_, `OpenStack`_
* `Logstash`_, `Elasticsearch`_, `Redis`_, `Postgres`_
* `Werkzeug`_, `Sentry`_, `Graylog2`_, `Shinken`_


.. _Python: http://www.python.org/
.. _Java: https://www.java.com/en/
.. _PIP: http://www.pip-installer.org/en/latest/
.. _Maven: https://maven.apache.org/
.. _Django: https://www.djangoproject.com/
.. _Tastypie: http://tastypieapi.org/
.. _Spring: http://spring.io/
.. _Bootstrap: http://twitter.github.com/bootstrap/
.. _jQuery: http://jquery.com/
.. _Backbone.js: http://backbonejs.org/
.. _Underscore.js: http://underscorejs.org/
.. _Jinja2: http://jinja.pocoo.org/
.. _ConfigObj: http://www.voidspace.org.uk/python/configobj.html
.. _Celery: http://celeryproject.org/
.. _Fabric: http://docs.fabfile.org/en/latest/
.. _Nginx: http://wiki.nginx.org/Main
.. _uWSGI: https://uwsgi-docs.readthedocs.org/en/latest/
.. _Apache Tomcat: https://tomcat.apache.org/
.. _Zeromq: http://www.zeromq.org/
.. _Funf: http://funf.org/
.. _OpenID Connect: http://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server/
.. _Salt Stack: http://saltstack.org/
.. _Salt-Cloud: https://salt-cloud.readthedocs.org/en/latest/
.. _Salt-API: https://salt-api.readthedocs.org/en/latest/
.. _OpenStack: http://www.openstack.org/
.. _Logstash: http://logstash.net/
.. _Elasticsearch: http://www.elasticsearch.org/
.. _Redis: http://redis.io/
.. _Postgres: http://www.postgresql.org/
.. _Werkzeug: http://werkzeug.pocoo.org/
.. _Sentry: http://github.com/getsentry/sentry/
.. _Graylog2: http://www.graylog2.org/
.. _Shinken: http://www.shinken-monitoring.org/


.. _oms_features:

OMS Features
------------

Here is a mindmap of the features of the OMS TCF:

.. image:: introduction/images/Trust_Framework_Features_mindmap_01.png
   :alt: Trusted Compute Framework Features
   :align: center
