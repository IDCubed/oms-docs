:title: TAB Development Tutorial
:description: Tutorial for developing TABs (Trusted Application Bundles)
:keywords: oms, tab, trusted, application, bundle, development, developer,


.. _tab_tutorial_1:

Creating a Trusted Application Bundle (TAB) - Part I
====================================================

This is the first tutorial in the TAB Development Series, and will get you
started on the path to creating TABs for the Open Mustard Seed (OMS) platform.

.. note::

  This tutorial should be used on either the :ref:`importable virtual
  appliance <deploy_development_vm>` or an :ref:`OMS Host in the Cloud
  <kickstart_oms>`.


Creating a basic Django project
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Let's start with a Django project called ``locationproj`` with a single
Tastypie-enabled app called ``pds``.  We'll convert the Django project to an
OMS app and the Django app to an OMS module.

Follow these steps in the shell to create a virtual environment, install the
dependencies, and set up a project with a single app:

.. code:: bash

  oms% cd
  oms% pip install virtualenv
  oms% mkdir locationvenv
  oms% cd locationvenv
  oms% virtualenv .
  oms% . bin/activate
  oms% pip install Django\<1.6
  oms% pip install django-tastypie
  oms% django-admin.py startproject locationproj
  oms% cd locationproj
  oms% python manage.py startapp pds


Now, open ``~/locationvenv/locationproj/locationproj/settings.py``. Update the
``ENGINE`` and ``NAME`` settings under the ``DATABASE`` setting so it looks
like this:

.. code:: python

  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.sqlite3',  # added
          'NAME': 'dev.db',  # added
          'USER': '',
          'PASSWORD': '',
          'HOST': '',
          'PORT': '',
      }
  }


Next, scroll down and add your new ``pds`` app to ``INSTALLED_APPS``:

.. code:: python

  INSTALLED_APPS = (
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.sites',
      'django.contrib.messages',
      'django.contrib.staticfiles',
      'pds',  # added
  )


Now, open ``~/locationvenv/locationproj/locationproj/urls.py``. Update it so it
looks like so:

.. code:: python

  from django.conf.urls import patterns, include, url
  from tastypie.api import Api

  from pds.api import LocationResource

  v1_api = Api(api_name='v1')
  v1_api.register(LocationResource())

  urlpatterns = patterns('',
      url(r'^api/', include(v1_api.urls)),
      url(r'^ok/$', 'pds.views.ok'),
  )


Now we'll focus on the ``pds`` app, which is located in
``~/locationvenv/locationproj/pds``. We want to set it up so it contains
these files (you may delete ``tests.py``, which was auto-created):

* ``__init__.py`` (empty)
* ``models.py``
* ``api.py``
* ``views.py``

Update the three files with the following code:

``~/locationvenv/locationproj/pds/models.py``:

.. code:: python

  from django.db import models

  class Location(models.Model):
      latitude = models.FloatField()
      longitude = models.FloatField()


``~/locationvenv/locationproj/pds/api.py``:

.. code:: python

  from tastypie.authorization import Authorization
  from tastypie.resources import ModelResource

  from pds.models import Location

  class LocationResource(ModelResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'
          authorization = Authorization()


``~/locationvenv/locationproj/pds/views.py``:

.. code:: python

  from django.http import HttpResponse

  def ok(request):
      return HttpResponse('ok')


Accessing API endpoints
~~~~~~~~~~~~~~~~~~~~~~~

Let's create the database and start the development server:

.. code:: bash

  oms% cd ~/locationvenv/locationproj
  oms% python manage.py syncdb --noinput
  oms% python manage.py runserver


.. note::

  The development server will run on port 8000.


Open a new shell. We'll be using the cURL program to check out our API
endpoints.

First, let's look at the topmost endpoint available to us. The ``/api/v1/``
endpoint lists all the model endpoints available. For each of these, we are
provided with their schema and list endpoints. Our app has one endpoint called
``location``:

.. code:: bash

  oms% curl http://localhost:8000/api/v1/
  {
      "location": {
          "list_endpoint": "/api/v1/location/",
          "schema": "/api/v1/location/schema/"
      }
  }


The first endpoint under the ``location`` endpoint is the ``schema`` endpoint,
which provides detailed information about the resource schema:

.. code:: bash

  oms% curl http://localhost:8000/api/v1/location/schema/
  {
      "allowed_detail_http_methods": [
          "get",
          "post",
          "put",
          "delete",
          "patch"
      ],
      "allowed_list_http_methods": [
          "get",
          "post",
          "put",
          "delete",
          "patch"
      ],
      "default_format": "application/json",
      "default_limit": 20,
      "fields": {
          "id": {
              "blank": true,
              "default": "",
              "help_text": "Integer data. Ex: 2673",
              "nullable": false,
              "readonly": false,
              "type": "integer",
              "unique": true
          },
          "latitude": {
              "blank": false,
              "default": "No default provided.",
              "help_text": "Floating point numeric data. Ex: 26.73",
              "nullable": false,
              "readonly": false,
              "type": "float",
              "unique": false
          },
          "longitude": {
              "blank": false,
              "default": "No default provided.",
              "help_text": "Floating point numeric data. Ex: 26.73",
              "nullable": false,
              "readonly": false,
              "type": "float",
              "unique": false
          },
          "resource_uri": {
              "blank": false,
              "default": "No default provided.",
              "help_text": "Unicode string data. Ex: \"Hello World\"",
              "nullable": false,
              "readonly": true,
              "type": "string",
              "unique": false
          }
      }
  }


The second endpoint under the ``location`` endpoint is the ``list_endpoint``,
which lists all the resources along with some useful metadata:

* ``total_count``: the total number of objects in this query
* ``limit``: the maximum number of items returned in a single HTTP response
* ``offset``: the offset from the beginning of the query
* ``previous`` and ``next``: links to adjacent pages in the query

.. code:: bash

  oms% curl http://localhost:8000/api/v1/location/
  {
      "meta": {
          "limit": 20,
          "next": null,
          "offset": 0,
          "previous": null,
          "total_count": 2
      },
      "objects": [
          {
              "id": 1,
              "latitude": 42.0,
              "longitude": -71.0,
              "resource_uri": "/api/v1/location/1/"
          },
          {
              "id": 2,
              "latitude": 42.0,
              "longitude": -72.0,
              "resource_uri": "/api/v1/location/2/"
          }
      ]
  }


There also exists another type of endpoint called the detail endpoint. Whereas
the list endpoint lists all the resources, the detail endpoint provides
information about a single object. A detail endpoint is constructed by adding
an object's ``id`` to the list endpoint:

.. code:: bash

  oms% curl http://localhost:8000/api/v1/location/1/
  {
      "id": 1,
      "latitude": 42.0,
      "longitude": -71.0,
      "resource_uri": "/api/v1/location/1/"
  }


CRUD operations
~~~~~~~~~~~~~~~

CRUD operations are supported by POSTing to the list endpoint (*create*),
GETting from the list and detail endpoints (*read*), PUTting or PATCHing to the
detail endpoint (*update*), and DELETEing at the detail endpoint (*delete*).

To create an object:

.. code:: bash

  oms% curl -X POST -H "Content-Type: application/json" --data '{"latitude": 42.0, "longitude": -73.0}' http://localhost:8000/api/v1/location/


To update an object:

.. code:: bash

  oms% curl -X PUT -H "Content-Type: application/json" --data '{"latitude": 41.0, "longitude": -73.0}' http://localhost:8000/api/v1/location/3/


To read all the objects;

.. code:: bash

  oms% curl http://localhost:8000/api/v1/location/
  {
      "meta": {
          "limit": 20,
          "next": null,
          "offset": 0,
          "previous": null,
          "total_count": 3
      },
      "objects": [
          {
              "id": 1,
              "latitude": 42.0,
              "longitude": -71.0,
              "resource_uri": "/api/v1/location/1/"
          },
          {
              "id": 2,
              "latitude": 42.0,
              "longitude": -72.0,
              "resource_uri": "/api/v1/location/2/"
          },
          {
              "id": 3,
              "latitude": 41.0,
              "longitude": -73.0,
              "resource_uri": "/api/v1/location/3/"
          }
      ]
  }


To read a single object:

.. code:: bash

  oms% curl http://localhost:8000/api/v1/location/3/
  {
      "id": 3,
      "latitude": 41.0,
      "longitude": -73.0,
      "resource_uri": "/api/v1/location/3/"
  }


To delete an object:

.. code:: bash

  oms% curl -X DELETE http://localhost:8000/api/v1/location/3/


We now have a working Django project with a single app, and we are ready to
convert it into an OMS module.

You can now stop the Django server with ``Ctrl-c`` and deactivate your
virtual environment:

.. code:: bash

  oms% deactivate


Next Steps
----------


