:title: Setting Up a Dev Environment
:description: Guides on how to contribute to OMS
:keywords: OMS, documentation, developers, contributing, dev environment

Setting Up a Dev Environment
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To make it easier to contribute to OMS, we provide a standard
development environment. It is important that the same environment be
used for all tests, builds and releases. The standard development
environment defines all build dependencies: system libraries and
binaries, go environment, go dependencies, etc.


Step 1: Download the VM 
-----------------------

step



Step 3: Build the Environment
-----------------------------

This following command will build a development environment using the Dockerfile in the current directory. Essentially, it will install all the build and runtime dependencies necessary to build and test OMS. This command will take some time to complete when you first execute it.

.. code-block:: bash

    python kickstart-oms.py -H



.. note:: OMS lives in ``/var/oms``.


**Need More Help?**

If you need more help then hop on to the `#oms IRC channel <irc://chat.freenode.net#oms>`_ or... 
