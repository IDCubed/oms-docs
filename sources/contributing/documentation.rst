:title: Contributing to Documentation
:description: How to Contributed Documentation to OMS
:keywords: contributing, oms, documentation, help, guideline


.. _contribute_docs:

Contributing Documentation
==========================

This guide will provide the reader with the information needed to get started
with contributing to the project's documentation. 

The end result will be an understanding of the following:

* where to see the latest source code for the documentation
* how to get setup to hack on the docs
* guiding principals and conventions


.. note::

   Please see the `oms-docs README`_ for additional details on contributing to the
   oms-docs repository.


.. _oms-docs README: https://github.com/IDCubed/oms-docs/blob/qa-develop/README.md


Where to find source code
-------------------------

The OMS project documentation is source code formatted as ReStructure Text, built
by Sphinx, version controlled with git, and `hosted on github`_.

.. _hosted on github: https://github.com/IDCubed/oms-docs


How to get started
------------------

Getting started is easy, Though we need to reset our expectations. It is not
possible to open a word document, or create a new wiki article and start making
updates.

The project documentation is interacted with and maintained as code because it
is code. We are not writing novels or fiction or prose; we are writing technical
descriptions, design details, how-tos etc - we use the tools and maintain
practices that are well-suited to the needs of this environment:

* track all changes, from updates to style, images, diagrams, references, and content
* distributed development, but must stay in sync with OMS codebase
* leverage modular design, reuse code and practices, keep it simple
* keep it easy to hack on and a joy to write and maintain our docs

At present, the simplest way to get started is to use an OMS Host, as this will
be setup with all the tools needed to hack on oms-docs. You can get an OMS Host
as a :ref:`Downloadable VM Image <deploy_development_vm>`, or you can create an
OMS Host using the :ref:`OMS Kickstart Provisioning Tools <kickstart_oms>`.

Once you have an OMS host, you can use this shortcut to install the sphinx
dependencies. we use ``test=True`` first so we can evaluate the results from salt
before it makes any changes to the system:

.. code:: bash

   oms% salt-call --local state.sls oms.doc_dev test=True
   oms% salt-call --local state.sls oms.doc_dev


We are now ready to build the docs. Sphinx and its dependencies have been
installed into a python virtualenv, so we activate that environment before
running ``make``. Building the docs will create a bunch of output, with artifacts
created in the ``_build/html/`` directory.

.. code:: bash

   oms% source /var/oms/python/oms-docs/bin/activate
   (oms-docs) oms% cd /var/oms/src/oms-docs/
   (oms-docs) oms% make docs
   ...
   (oms-docs) oms% ls -alh _build/html/
   total 128K
   drwxr-xr-x 17 root root 4.0K Dec  8 23:35 .
   drwxr-xr-x  4 root root 4.0K Dec  8 23:34 ..
   drwxr-xr-x  2 root root 4.0K Dec  8 23:34 api
   drwxr-xr-x  3 root root 4.0K Dec  8 23:34 builder
   -rw-r--r--  1 root root  230 Dec  8 23:35 .buildinfo
   drwxr-xr-x  4 root root 4.0K Dec  8 23:34 concepts
   drwxr-xr-x  3 root root 4.0K Dec  8 23:34 contributing
   drwxr-xr-x  2 root root 4.0K Dec  8 23:34 faq
   drwxr-xr-x  2 root root 4.0K Dec  8 23:34 genindex
   drwxr-xr-x  9 root root 4.0K Dec  8 23:34 get_started
   drwxr-xr-x  2 root root 4.0K Dec  8 23:34 _images
   -rw-r--r--  1 root root  15K Dec  8 23:34 index.html
   drwxr-xr-x  6 root root 4.0K Dec  8 23:34 introduction
   -rw-r--r--  1 root root 1.1K Dec  8 23:35 objects.inv
   drwxr-xr-x  8 root root 4.0K Dec  8 23:34 oidc
   drwxr-xr-x  2 root root 4.0K Dec  8 23:34 search
   -rw-r--r--  1 root root  33K Dec  8 23:35 searchindex.js
   drwxr-xr-x  8 root root 4.0K Dec  8 23:34 _sources
   drwxr-xr-x  5 root root 4.0K Dec  8 23:35 _static
   drwxr-xr-x  2 root root 4.0K Dec  8 23:34 toctree
   drwxr-xr-x  6 root root 4.0K Dec  8 23:34 tutorials


We can also run ``make server`` to run a small python HTTP server suitable for
development:

.. code:: bash

   (oms-docs) oms% make server
   ...
   done
   dumping search index... done
   dumping object inventory... done
   build succeeded, 10 warnings.
   
   Build finished. The documentation pages are now in _build/html.
   Serving HTTP on 0.0.0.0 port 9000 ...


To be sure the build artifacts are fresh, with no contamination from a previous
build, remove the build directory prior to running ``make``. This is a good way
to combine the commands. Eg, run this after you make an update and want to see
the update through your browser:

.. code:: bash

   (oms-docs) oms% rm -rf _build && make docs server


Point your browser at http://$ip:9000 to see HTML docs served up by the
minimal HTTP server (replace *$ip* with the IP of your OMS Host).

At this point, you may want to review the `oms-docs README`_ for details about
restructured text, sphinx, and style conventions found in oms-docs.

.. _oms-docs README: https://github.com/IDCubed/oms-docs/blob/qa-develop/README.md


Intended Layout of OMS Documentation
------------------------------------

For the documentation on this site, our intended layout is described by the
following mindmap:

.. image:: images/layout_of_oms-docs.png
   :alt: Layout of oms-docs Sections
   :align: center


.. Note::

   This mindmap can be edited with `XMind`_, the source is located in
   ``oms-docs/sources/xmind/layout_of_oms-docs.xmind``. It needs to be updated,
   but is still mostly correct (it's missing OIDC and upcoming changes to TCC)

.. _XMind: http://www.xmind.net/

