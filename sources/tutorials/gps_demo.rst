:title: GPS Demo Tutorial
:description: How to use and hack on the GPS Demo app
:keywords: gps demo, examples, tutorials, oms app, django,


.. _gps_demo:

GPS Demo Tutorial
=================

The GPS Demo TAB uses an Android application called Funf Journal to collect GPS
data from a user's phone. It utilizes a computational sandbox to compare the
real-time GPS data with a reference value, reporting whether or not the user is
within a pre-specified distance from the reference GPS value.


Deploy GPS Demo
---------------

.. include:: tutorial_setup.inc

The manifests for the GPS Demo can be found in the oms-core module repository,
included in ``/var/oms/src/oms-core/manifests``. There is a manifest for the
backend (``GPSDemo.yaml``) and a separate manifest for the UI
(``GPSDemoUI.yaml``).


Obtaining an OIDC token
~~~~~~~~~~~~~~~~~~~~~~~

The GPS Demo app requires a token to function properly. To obtain a token, you
must run a Python script.

Open a shell and install the ``requests`` package used by the script:

.. code:: bash

  oms% sudo pip install requests


Next, create a file called ``get_token.py`` and paste the following code into
it:

.. code:: python

  from __future__ import print_function
  import json
  import base64

  import requests

  client_id = 'gps-demo-client'
  client_secret = 'c2b3e080-1923-4b16-9a85-786104d29cf8'
  url = 'https://aten.idhypercubed.org/idoic/token'
  scope = 'gpsdemo'

  auth = base64.b64encode('{}:{}'.format(client_id, client_secret))
  headers = {'Authorization': 'Basic {}'.format(auth),
             'Content-Type': 'application/x-www-form-urlencoded'}
  body = 'grant_type=client_credentials&scope={}'.format(scope)

  r = requests.post(url, headers=headers, data=body)
  reply = json.loads(r.text)

  print(reply['access_token'])


Replace the values for ``client_id``, ``client_secret``, ``url``, and ``scope``
with those that apply to your OIDC setup.

Run the script:

.. code:: bash

  oms% python get_token.py
  eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjEzODkwODc1MzQsImF1ZCI6WyJicHBfYXBwIl0sImlzcyI6Imh0dHBzOlwvXC9icHAuaWRoeXBlcmN1YmVkLm9yZ1wvaWRvaWNcLyIsImp0aSI6Ijc3MjcyMzE1LTUyODItNGZmZC05MzY5LTJkNmU2MWZlYWVjYyIsImlhdCI6MTM4OTA4MzkzNX0.2CameLJxae_-7RW2_FecrtqvYZ3piOVkBFLT_dIWNdJxIoznyWtyz_JpFPLZTZ2eRSKk3aIe0V6exxGfThhinlyMDnhl42acmwIcVAAW-Vl-O_ro-c5tsiLIo1l4-PRfVcjdp316WUeBYr0tih2Hp-a_oBQkHiLfMwd8ty0Gqas


The resulting output is the token, which you'll need for the next section. It's
quite long, so take care when cutting and pasting.


Setting the manifest template variables
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Since both GPS Demo manifests are templates, we need to provide the values they
require. During deployment, the manifests will be rendered with these values.

Open ``/var/oms/etc/deploy.conf`` and set the values for the following template
variables, with one key-value pair per line, using a colon as a separator:

============================   ================================================
Template variable              Description
============================   ================================================
**GPS Demo**
``ssl_setup``                  Boolean. Describes whether the app will be using
                               HTTP or HTTPS.
``vhost_base_url``             String. The base URL of the machine where GPS
                               Demo is installed.
``funf_connector_base_url``    String. The base URL of the Connector app to
                               which Funf Journal will connect. Forward slashes
                               must be escaped with two backslashes.
``allowed_hosts``              String. The host/domain that can be served by
                               this app (security feature). For a subdomain
                               wildcard, place a dot (period) before the
                               domain.
``oidc_base_url``              String. The base URL of the OpenID Connect
                               server.
``gps_demo_scope``             String. The OIDC scope used by this app.
``gps_demo_access_token``      String. The access token from the previous
                               section.

**GPS Demo UI**
``ssl_setup``                  See above.
``oidc_base_url``              See above.
``gps_demo_ui_scope``          See ``gps_demo_scope`` above.
``gps_demo_ui_client_id``      String. The ID of the OIDC client.
============================   ================================================

For example, ``deploy.conf`` might look liks this:

.. code::

  ssl_setup: True
  vhost_base_url: https://aten.idhypercubed.org
  funf_connector_base_url: https:\\/\\/aten.idhypercubed.org\\/Connector
  allowed_hosts: .idhypercubed.org
  oidc_base_url: https://aten.idhypercubed.org/idoic
  gps_demo_scope: gpsdemo
  gps_demo_access_token: eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjEzODkwODMxNDcsImF1ZCI6WyJicHBfYXBwIl0sImlzcyI6Imh0dHBzOlwvXC9icHAuaWRoeXBlcmN1YmVkLm9yZ1wvaWRvaWNcLyIsImp0aSI6ImE1NjNiODdhLTVjYmQtNGYwYi1hMTAyLTZkOTA2NTNiZTA2NyIsImlhdCI6MTM4OTA3OTU0N30.Gsbnssex3ia1FCavZdPJufIrVQKI_YvDMolmfP3xiCyo0fbEi1HN_f1XzccisnV1jXoUuoyuTeA60DUd_7y_x8QstVdsjIpTIaX_3nWun84kpZ-SVNkh2tsSg16pjC19SQkCrC7PVOPuJ0nw9BTafFek9dbvs6zvt-YzQyIEGkg

  gps_demo_ui_client_id: gps-demo-client


Deploy!
~~~~~~~

When ready, deploy the GPS Demo TAB with the ``oms`` command line utility.
Start with the GPS backend, which includes the PDS, the Funf Journal Connector,
the Proximity app, and a test suite:

.. code:: bash

  # specify `localhost` when prompted for a host
  oms deploy -m GPSDemo.yaml
  No hosts found. Please specify (single) host string for connection: localhost


Now deploy the UI (this ought to be a lot faster than the backend deployment):

.. code:: bash

  # specify `localhost` when prompted for a host
  oms deploy -m GPSDemoUI.yaml
  No hosts found. Please specify (single) host string for connection: localhost


Once deployed, you ought to be able to view the GPS Demo Web UI with your
browser pointed at https://HOST.DOMAIN.TLD/GPSUI/ (update accordingly if using
SSL and/or DNS).

You will have just deployed 5 apps as part of the GPS Demo TAB! The GPS Demo
application should now be operational on the server side. It only needs to be
connected to an Android device running Funf Journal.


Linking to the Funf Journal Android application
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Perform the following steps:

* Install `Funf Journal`_ on your Android device, or search for *Funf Journal*
  in the Play Store app.
* Launch Funf Journal.
* Click the phone's menu button and select ``Link to Server``.
* Click the checkbox to delegate control to a server.
* Fill in the ``Configuration URL`` box with the URL of the Funf Journal
  Connector's configuration endpoint. With SSL and DNS set up:
  https://HOST.DOMAIN.TLD/Connector/c/.
* Press ``Save``.

.. _Funf Journal: https://play.google.com/store/apps/details?id=edu.mit.media.funf.journal


Setting the reference point
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Now you just need to add a reference point to compare your location to. Create
a file named ``reference.json`` with the latitude and longitude of the
reference location, along with the allowed distance (in km) from that location.
For example:

.. code:: json

  {
   "latitude": 42.40483967,
   "longitude": -71.12860532,
   "radius": 10.0
  }


Finally, POST it to the Proximity app, updating the URL accordingly:

.. code:: bash

  curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" -X POST --data @reference.json -H "Content-Type: application/json" https://HOST.DOMAIN.TLD/Proximity/api/v1/clientlocation/


Verifying the GPS Demo installation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To verify the installation of GPS Demo, you can check a few of the endpoints.

First, make sure that your reference location was stored correctly:

.. code:: bash

  curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" https://HOST.DOMAIN.TLD/Proximity/api/v1/clientlocation/


You should see a JSON-formatted response with the same information as in
``reference.json`` above.

Next, make sure that Funf Journal is uploading your data correctly:

.. code:: bash

  curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" https://HOST.DOMAIN.TLD/PDS/api/v1/location/


For each of these commands, you should see a JSON-formatted response with one
or more "objects" corresponding to your location at a point in time.


Checking proximity
~~~~~~~~~~~~~~~~~~

Now you can check the proximity endpoint to see if your current location is
within the radius from the reference location:

.. code:: bash

  curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" https://HOST.DOMAIN.TLD/Proximity/proximity/


The response body should look like this if you're close to the reference point:

.. code:: json

  {"are_proximate": true}


... or if you aren't:

.. code:: json

  {"are_proximate": false}


Using the UI
------------

The UI can be accessed at https://HOST.DOMAIN.TLD/GPSUI/ .

Once you go to this URL, you will be redirected to your OIDC server, where you
must log in and authorize the app, after which point you will be redirected
back to the app UI.

You will see pins dropping onto a map, one for each location point in the
database. After all the pins drop, a dialog will be displayed.
