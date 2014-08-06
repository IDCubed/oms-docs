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

`Now available`_ as an alpha release (Summer 2014), Open Mustard Seed is both a
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
projects - we strongly believe in the DRY principles. Though additional projects
can and are being added as needed, the existing reference platform includes and
makes use of the following open source projects: 


Languages
~~~~~~~~~

* `Python`_
* `Java`_
* JavaScript
* `PIP`_
* `Maven`_


Libraries and Web Frameworks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* `Django`_
* `Tastypie`_
* `Spring`_
* `Node.js`_
* `Bootstrap`_
* `jQuery`_
* `Backbone.js`_
* `Underscore.js`_
* `Gulp.js`_ and `Grunt.js`_
* `Jinja2`_
* `ConfigObj`_
* `Requests`_
* `Fabric`_
* `Zeromq`_
* `Funf`_
* `Werkzeug`_
* `Reclass`_
* `SQLite`_
* `PyYAML`_
* `django-extensions`_


Services
~~~~~~~~

* `Nginx`_
* `uWSGI`_
* `Apache Tomcat`_
* `Postgres`_
* `OpenID Connect`_
* `Logstash`_
* `Elasticsearch`_
* `Kibana`_
* `Salt Stack`_
* `OpenSMTPd`_
* `Supervisord`_


Utilities
~~~~~~~~~

* `Git`_
* `tmux`_
* `OpenSSH`_
* `GNU GPG`_


OS and Virtualization
~~~~~~~~~~~~~~~~~~~~~

* `Ubuntu`_
* `OpenStack`_
* `VirtualBox`_
* `Docker`_
* `Packer`_


.. _Python: http://www.python.org/
.. _Java: https://www.java.com/en/
.. _PIP: http://www.pip-installer.org/en/latest/
.. _Maven: https://maven.apache.org/
.. _Django: https://www.djangoproject.com/
.. _Node.js: https://www.nodejs.com/
.. _Tastypie: http://tastypieapi.org/
.. _Spring: http://spring.io/
.. _Bootstrap: http://twitter.github.com/bootstrap/
.. _jQuery: http://jquery.com/
.. _Backbone.js: http://backbonejs.org/
.. _Underscore.js: http://underscorejs.org/
.. _Gulp.js: http://gulpjs.com/
.. _Grunt.js: http://gruntjs.com/
.. _Reclass: http://reclass.pantsfullofunix.net
.. _SQLite: http://sqlite.org
.. _PyYAML: http://pyyaml.org/
.. _django-extensions: http://django-extensions.readthedocs.org/en/latest/
.. _Jinja2: http://jinja.pocoo.org/
.. _ConfigObj: http://www.voidspace.org.uk/python/configobj.html
.. _Requests: http://docs.python-requests.org/en/latest/
.. _Fabric: http://docs.fabfile.org/en/latest/
.. _Nginx: http://wiki.nginx.org/Main
.. _uWSGI: https://uwsgi-docs.readthedocs.org/en/latest/
.. _Apache Tomcat: https://tomcat.apache.org/
.. _Zeromq: http://www.zeromq.org/
.. _Funf: http://funf.org/
.. _Supervisord: http://supervisord.org
.. _OpenSMTPd: http://opensmtpd.org
.. _OpenID Connect: http://openid.net/connect/
.. _Salt Stack: http://saltstack.org/
.. _Logstash: http://logstash.net/
.. _Elasticsearch: http://www.elasticsearch.org/
.. _Kibana: http://www.elasticsearch.org/overview/kibana/
.. _Postgres: http://www.postgresql.org/
.. _Werkzeug: http://werkzeug.pocoo.org/
.. _tmux: http://tmux.sourceforge.net/
.. _Git: http://www.git-scm.com/
.. _OpenSSH: https://openssh.com
.. _GNU GPG: http://gnugpg.org
.. _OpenStack: http://www.openstack.org/
.. _VirtualBox: http://www.virtualbox.org/
.. _Docker: http://www.docker.io
.. _Packer: http://www.packer.io
.. _Ubuntu: http://www.ubuntu.com/


.. _oms_features:

OMS Features
------------

Here is a mindmap of the features of the OMS TCF:

.. image:: introduction/images/Trust_Framework_Features_mindmap_01.png
   :alt: Trusted Compute Framework Features
   :align: center
