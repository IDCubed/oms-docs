:title: GPS Demo Tutorial
:description: How to use and hack on the GPS Demo app
:keywords: gps demo, examples, tutorials, oms app, django,


.. _gps_demo:

GPS Demo Tutorial
=================

The GPS Proximity Service uses an Android application called Funf Journal to
collect GPS data from a user's phone. It utilizes a computational sandbox to
compare the real-time GPS data with a preset value, reporting whether or not the
user is within a pre-specified distance from the preset GPS value.


Deploy GPS Demo
---------------

.. include:: tutorial_setup.inc

The manifests for the GPS Demo can be found in the oms-core module repository,
included in ``/var/oms/src/oms-core/manifests``. There is a manifest for the
backend (``GPSDemo.yaml``) and a separate manifest for the UI
(``GPSDemoUI.yaml``).


Edit the manifest
~~~~~~~~~~~~~~~~~

Update ``ACCESS_TOKEN`` with the access token created at the OpenID Connect
server.

.. note:: we need something that describes how to retrieve this token from OIDC

The URL endpoints that appear in the manifest must be updated to reference the
correct host. For example, each app in the GPS Demo TAB contains a setting,
``TOKENSCOPE_ENDPOINT``, embedded in the manifest. This endpoint is used to
validate access tokens at the OpenID Connect server.

There are other URLs/endpoints that you should update with the correct base URL
based on how your OMS host was deployed (either with/without SSL and DNS):

============================   =================================================
Setting Key                    Description
============================   =================================================
**PDS**
``LOCATION_ENDPOINT``          location endpoint on the PDS, used for
                               self-testing.
**Connector**
``LOCATION_ENDPOINT``          location endpoint on the PDS.
``CONFIG_ENDPOINT``            endpoint containing the Funf Journal
                               configuration.
``UPLOAD_ENDPOINT``            endpoint for uploading SQLite databases with
                               location data.
``FUNF_CONFIG_ENDPOINT``       endpoint containing the Funf Journal
                               configuration (used by Funf Journal). Forward
                               slashes should be escaped with `\\`.
``FUNF_UPLOAD_ENDPOINT``       endpoint for uploading SQLite databases with
                               location data (used by Funf Journal). Forward
                               slashes should be escaped with `\\`.
**Proximity**
``LOCATION_ENDPOINT``          location endpoint on the PDS.
``CLIENT_LOCATION_ENDPOINT``   endpoint containing the reference location for
                               determining proximity.
``PROXIMITY_ENDPOINT``         endpoint to determine proximity by comparing the
                               current location to the reference location.
**Test**
``CONFIG_ENDPOINT``            endpoint containing the Funf Journal
                               configuration.
``LOCATION_ENDPOINT``          location endpoint on the PDS.
``CLIENT_LOCATION_ENDPOINT``   endpoint containing the reference location for
                               determining proximity.
``PROXIMITY_ENDPOINT``         endpoint to determine proximity by comparing the
                               current location to the reference location.
============================   =================================================

Open the manifests for editing:

.. code:: bash

   # this is where you'll find most OMS manifests
   oms% cd /var/oms/src/oms-core/manifests
   # update config in GPS Demo TAB manifests
   oms% vim GPSDemo.yaml
   oms% vim GPSDemoUI.yaml


Deploy!
~~~~~~~

When ready, deploy the GPS Demo TAB with the ``oms`` command line utility.
Start with the GPS backend, which includes the PDS, the Funf Journal Connector,
the Proximity app, and a test suite:

.. code:: bash

   # specify `localhost` when prompted for a host
   oms% oms deploy -m GPSDemo.yaml
   No hosts found. Please specify (single) host string for connection: localhost


Now deploy the UI (this ought to be a lot faster than the backend deployment):

.. code:: bash

   # specify `localhost` when prompted for a host
   oms% oms deploy -m GPSDemoUI.yaml
   No hosts found. Please specify (single) host string for connection: localhost


Once deployed, you ought to be able to view the GPS Demo Web UI with your
browser pointed at https://HOST.DOMAIN.TLD/GPSUI/ (update accordingly if using
SSL and/or DNS).

You will have just deployed 4 apps as part of the GPS Demo TAB! The GPS Demo
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

   oms% curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" -X POST --data @reference.json -H "Content-Type: application/json" https://HOST.DOMAIN.TLD/Proximity/api/v1/clientlocation/


Verifying the GPS Demo installation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To verify the installation of GPS Demo, you can check a few of the endpoints.

First, make sure that your reference location was stored correctly:

.. code:: bash

   oms% curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" https://HOST.DOMAIN.TLD/Proximity/api/v1/clientlocation/


You should see a JSON-formatted response with the same information as in
``reference.json`` above.

Next, make sure that Funf Journal is uploading your data correctly:

.. code:: bash

   oms% curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" https://HOST.DOMAIN.TLD/PDS/api/v1/location/


For each of these commands, you should see a JSON-formatted response with one or
more "objects" corresponding to your location at a point in time.


Checking proximity
~~~~~~~~~~~~~~~~~~

Now you can check the proximity endpoint to see if your current location is
within the radius from the reference location:

.. code:: bash

   oms% curl -i -H "Authorization: Bearer INSERT_TOKEN_HERE" https://HOST.DOMAIN.TLD/Proximity/proximity/


The response body should look like this if you're close to the reference point:

.. code:: json

   {"are_proximate": true}


... or if you aren't:

.. code:: json

   {"are_proximate": false}


Using the UI
------------

.. note:: need to describe more about the app and how to use it.
