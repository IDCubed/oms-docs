:title: OIDC Tutorial
:description: Tutorial for using OpenID Connect
:keywords: oidc, openid, connect, development, developer,


.. _oidc_tutorial:

OIDC Tutorial
=============

This tutorial is a guide for enabling OIDC access in your application code.
It contains information only about this feature, without taking advantage of
the other aspects of the Open Mustard Seed (OMS) platform.

.. note::

  This tutorial should be used on either the :ref:`importable virtual
  appliance <deploy_development_vm>` or an :ref:`OMS Host in the Cloud
  <kickstart_oms>`.


Introduction
------------

.. note::

  * This section assumes you have an OIDC server online.


This tutorial is intended to help you set up your OIDC client, so that it can
obtain a valid token from the OIDC server with which to authorize requests to
an OIDC-protected backend.


OIDC in the frontend
--------------------

The following represents a minimal example for using OIDC with HTML and
JavaScript. Feel free to modify and expand it once you get it working.

Start by obtaining a copy of the ``OMSOIDC.js`` library from
https://github.com/IDCubed/oms-core/blob/qa-develop/static/js/OMSOIDC.js

Next, you can quickly point your frontend code to your OIDC backend by copying
the example file below and updating the 4 places that are noted.

``client.html``:

.. code:: html

  <html>
    <head>
      <script type="text/javascript">
        // 1) set your OIDC-related variables here
        var oidc_base_url = 'https://bpp.idhypercubed.org/idoic';
        var app_client = 'location_client';
        var app_scope = 'location';
      </script>
      <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
      <!-- 2) update the path to OMSOIDC.js here -->
      <script src="OMSOIDC.js"></script>
      <script type="text/javascript">
      $(document).ready(function() {
        $.ajax({
          // 3) set your OIDC-protected endpoint here
          url: "https://aten.idhypercubed.org/GPSDemoPDS/api/v1/location/",
        })
        .success(function(msg) {
          // 4) handle the endpoint response here
          $("#output").html(JSON.stringify(msg));
        });
      });
      </script>
    </head>
    <body>
      <div id="output"></div>
    </body>
  </html>


To summarize:

1. The variables ``oidc_base_url``, ``app_client``, and ``app_scope`` are
   required by ``OMSOIDC.js`` and must point to your OIDC server.
2. You may need to update the location of your ``OMSOIDC.js`` file.
3. Replace this URL with a valid OIDC-protected endpoint.
4. Handle the reply as required by your application.


Verifying without OMS
+++++++++++++++++++++

If you would like to verify (outside of OMS) that you've set this up correctly,
then place ``client.html`` and ``OMSOIDC.js`` in ``/var/www/default`` on your
Ubuntu machine. The files will then be available at
``https://<IP>/client.html`` and ``https://<IP>/OMSOIDC.js``. Change this to
``http`` if you don't have SSL and substitute ``<IP>`` with your hostname or IP
address.

When you open ``https://<IP>/client.html``, you will be automatically
redirected to your OIDC server. After you complete the authorization process,
you will be redirected back to ``https://<IP>/client.html``, and the response
to the OIDC-protected endpoint request will appear in the body of the page.

``OMSOIDC.js`` caches the access token in a cookie which you can inspect.
