:title: TAB Development Tutorial
:description: Tutorial for developing TABs (Trusted Application Bundles)
:keywords: oms, tab, trusted, application, bundle, development, developer,


.. _tab_tutorial:

TAB Development Tutorial
========================

This tutorial is a guide for developing Trusted Application Bundles (TABs) for
the Open Mustard Seed (OMS) platform.

.. note::

  This tutorial should be used on either the :ref:`importable virtual
  appliance <deploy_development_vm>` or an :ref:`OMS Host in the Cloud
  <kickstart_oms>`.


Introduction
------------

This tutorial is an easy-to-follow guide to developing TABs that leverage the
power of the OMS framework. Throughout it, we develop a simple TAB, building
it from scratch and adding OMS-supported features one step at a time.

We'll cover the following topics:

* `Creating a TAB`_
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
build out from there.


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
these files:

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


``~/locationvenv/locationproj/pds/views.py``

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
provided with a their schema and list endpoints. Our app has one endpoint
called ``location``:

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
which lists all the resources, along with some useful metadata:

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
information about a single object. This object is specified by adding the
``id`` to the list endpoint:

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


Creating OMS-compatible modules
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

OMS apps are collections of OMS modules.

We can take our ``pds`` app and convert it into an OMS module by copying it
from the Django project into the top level of a git repository.

Let's assume you have an empty git repo that you're going to use for this
project. We'll clone it here and put our new code in it.

.. code:: bash

  oms% cd /var/oms/src
  oms% git clone https://github.com/IDCubed/oms-example.git
  oms% cd /var/oms/src/oms-example
  oms% cp -r ~/locationvenv/locationproj/pds /var/oms/src/oms-example


.. note::

  Make sure to use your own repo instead of the fictional ``oms-example`` repo.


Next, we need to copy ``urls.py`` into the new module, ensuring that it
contains only the code relevant to that module (not a problem for the ``pds``
module).

.. code:: bash

  oms% cp ~/locationvenv/locationproj/locationproj/urls.py /var/oms/src/oms-example/pds


Creating a deployable manifest
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A manifest is a file that describes and configures a TAB. It is used by
oms-deploy to deploy the TAB into a TCC.

Manifests can be combined with other applications, bundled together in a
*manifest collection*, and even imported into an OMS Registry to be deployed
from a web interface.

Manifests are in `YAML <http://www.yaml.org>`_ format. They also support
templating, so that variable data (such as hostnames) can be factored out and
placed in ``/var/oms/etc/deploy.conf``. During deployment, the manifest is
rendered using the variable definitions in ``deploy.conf``.

Create a manifest for our TAB in ``~/Location.yaml``:

.. code:: yaml

  deploy:
    apps:
      - pds

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie

    modules:
      - oms-example/pds

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - pds

    urls:
      - url(r'', include('pds.urls'))


``deploy.conf`` uses a simple key-value syntax using the ``:`` separator.
Update it so it provides a value for ``ssl_setup`` variable in the manifest,
using ``True`` or ``False`` depending on your TCC's SSL setup:

``/var/oms/etc/deploy.conf``:

.. code::

  ssl_setup: False


Some notes about the contents of this manifest:

* The ``modules_repo`` parameter specifies the repository where our module is
  located (oms-example) as well as the oms-core repository (which contains
  other components that we'll need later for additional functionality).
* The ``pip_requirements`` parameter declares the TAB's Python dependencies.
* The ``modules`` parameter specifies the OMS module we'll be using in our TAB.
* The ``installed_apps`` parameter lists the apps we're using in the TAB,
  mirroring Django's ``INSTALLED_APPS`` setting.
* The ``urls`` parameter lists the URLs for this TAB, pointing to the
  ``urls.py`` in the ``location`` module.

Manifests also support other parameters, which we'll explore in the sections
below.

This example manifest describes a simple but complete TAB. We'll be fleshing it
out with additional features in the sections that follow.

.. note::

  You can now deploy the manifest using the command ``oms deploy -m
  ~/Location.yaml``. The TAB will be installed in ``/var/oms/python/PDS``.
  Redeploy your TAB anytime you update your source code.


Adding a UI
-----------

Let's add a web interface to our TAB.

First, create a template along with its parent directory in our module:

.. code:: bash

  oms% mkdir /var/oms/src/oms-example/pds/templates
  oms% touch /var/oms/src/oms-example/pds/templates/locations.html


Let's make a template that lists the stored locations:

``/var/oms/src/oms-example/pds/templates/locations.html``:

.. code:: html

  <html>
    <head>
      <title>Locations</title>
    </head>
    <body>
      <table>
        {% for location in locations %}
        <tr>
          <td>
            {{ location.latitude}}, {{ location.longitude }}
          </td>
        </tr>
        {% empty %}
        <tr>
          <td>
            No locations
          </td>
        </tr>
        {% endfor %}
      </table>
    </body>
  </html>


Now, let's add a view for this template:

``/var/oms/src/oms-example/pds/views.py``:

.. code:: python

  from django.http import HttpResponse
  from django.shortcuts import render_to_response

  from pds.models import Location

  def ok(request):
      return HttpResponse('ok')

  def locations(request):  # new view
      locations = Location.objects.all()
      return render_to_response('locations.html', {'locations': locations})


The last step is add a URL for our view:

``/var/oms/src/oms-example/pds/urls.py``:

.. code:: python

  from django.conf.urls import patterns, include, url
  from tastypie.api import Api

  from pds.api import LocationResource

  v1_api = Api(api_name='v1')
  v1_api.register(LocationResource())

  urlpatterns = patterns('',
      url(r'^api/', include(v1_api.urls)),
      url(r'^ok/$', 'pds.views.ok'),
      url(r'^locations/$', 'pds.views.locations'),  # new URL
  )


Now you can redeploy, and the new UI will be available at
http://HOST.TLD/PDS/locations/ (or https).


Adding the API Console
----------------------

The API Console is an optional but useful tool to help you test and debug your
API endpoints. It presents a simple, clean web UI in which you can craft HTTP
requests to--and receive responses from--your app's endpoints, avoiding the
need to rely on other tools.

Update your manifest to include the module and its dependencies:

.. code:: yaml

  modules:
    - oms-core/static
    - oms-core/templates
    - oms-core/api_console


Install the API Console:

.. code:: yaml

  installed_apps:
    - api_console


Finally, add the URL for the console:

.. code:: yaml

  urls_snippet: |
    from django.views.generic import TemplateView

  urls: |
    - url(r'^console/$', TemplateView.as_view(template_name='console.html'))


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-example/pds

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'', include('pds.urls'))


After you redeploy, the API Console will be available at
http://HOST.TLD/PDS/console/ (or https).

The main feature of the API Console is a form that allows you to tailor
aspects of an HTTP request to an application endpoint. It gives you
control of the URL (``Action URL``), HTTP method (``choose http method``),
headers, as well as the body of the HTTP request (``data for
POST/PUT/PATCH methods``).

The ``Authorization Header`` field makes it simple to add the ``Authorization``
header, and it will come in handy later when you need to submit an access token
required by OpenID Connect authorization.

Start by selecting ``get location list`` from the ``Actions`` dropdown. When
you do this, the API Console will populate some of the other form fields,
including the HTTP method (``GET``) and the URL
(``/PDS/api/v1/location/?limit=1000``).

Click ``Send``, and the response body will be displayed below the form.


Adding Django Admin support
---------------------------

If you would like to enable support for the `Django Admin
<https://docs.djangoproject.com/en/1.5/ref/contrib/admin/>`_, you'll need to
make some updates to your manifest.

First, enable the Admin URLs in ``~/Location.yaml``:

.. code:: yaml

  urls:
    - url(r'^admin/', include(admin.site.urls))


.. note::

  * Place the URL for the Admin before any URLs with catch-all patterns such as
    ``r''``.
  * You don't need to add the code ``from django.contrib import admin;
    admin.autodiscover()`` anywhere; this is done automatically for you.


Then, install the Admin (and its dependencies, if necessary) into your app:

.. code:: yaml

  installed_apps:
    - django.contrib.auth
    - django.contrib.contenttypes
    - django.contrib.sessions
    - django.contrib.messages
    - django.contrib.admin


Finally, install the fixture that creates an admin user for your app. You may
wish to edit this fixture to change the password. By default, the username is
``admin`` and the password is ``adminadmin``.

.. code:: yaml

  fixtures:
    - oms-core/admin_user


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-example/pds

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'', include('pds.urls'))

    fixtures:
      - oms-core/admin_user


Of course, you also need an ``admin.py`` file for your module:

``/var/oms/src/oms-example/pds/admin.py``:

.. code:: python

  from django.contrib import admin

  from pds.models import Location

  class LocationAdmin(admin.ModelAdmin):
      list_display = ['id', 'latitude', 'longitude']

  admin.site.register(Location, LocationAdmin)


After deployment, the Admin will be available at
http://HOST.TLD/PDS/admin/ (or https).


Adding django-constance support
-------------------------------

.. note::

  Prerequisite: install the Django Admin as described in `Adding Django Admin
  support`_.


If you would like to have the ability to update your app's settings while the
app is running, you can use a Django plugin called `django-constance
<https://github.com/comoga/django-constance>`_. This plugin lets you update
specially designated settings from within the Django Admin, on the fly.

In Django, the settings are typically stored in the project's ``settings.py``,
but OMS uses the manifest for this purpose.

.. warning::

  The latest release of django-constance (0.6) is not compatible with Django
  1.6.x .  Make sure your manifest uses Django<1.6 with this plugin.


To install django-constance, you'll need to make a few updates to your
``~/Location.yaml`` manifest.

First, install django-constance (with database support):

.. code:: yaml

  pip_requirements:
    - django-constance[database]


Then, install django-constance into your app:

.. code:: yaml

  installed_apps:
    - constance
    - constance.backends.database


Add the ``CONSTANCE_BACKEND`` string to ``settings_snippet`` to tell
django-constance to use your Django database to store your settings, and use
the ``CONSTANCE_CONFIG`` dictionary to specify the dynamic settings.  This
dictionary uses a string key to specify the name of the setting, and a 2-tuple
as its corresponding value.  The first element of this tuple is the default for
that setting, and the second element is a description of that setting.

For example:

.. code:: yaml

  settings_snippet: |
    CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
    CONSTANCE_CONFIG = {
        'REF_LATITUDE': ('42.0', 'reference latitude'),
        'REF_LONGITUDE': ('-71.0', 'reference longitude'),
    }


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie
      - django-constance[database]

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-example/pds

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - constance
      - constance.backends.database
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'', include('pds.urls'))

    settings_snippet: |
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'REF_LATITUDE': ('42.0', 'reference latitude'),
          'REF_LONGITUDE': ('-71.0', 'reference longitude'),
      }

    fixtures:
      - oms-core/admin_user


Now you can use the settings stored with django-constance as you would if
importing them from Django's ``settings.py``. Let's update our view to use the
values stored with the plugin.

``/var/oms/src/oms-example/pds/views.py``:

.. code:: python

  from constance import config
  from django.http import HttpResponse
  from django.shortcuts import render_to_response

  from pds.models import Location

  def ok(request):
      return HttpResponse('ok')

  def locations(request):
      ref_location = float(config.REF_LATITUDE), float(config.REF_LONGITUDE)
      locations = Location.objects.all()
      for location in locations:
          if (location.latitude, location.longitude) == (ref_location[0],
                                                         ref_location[1]):
              location.matches_ref = True
      return render_to_response('locations.html', {'locations': locations})


We'll need to update our template to make use of this new attribute.

``/var/oms/src/oms-example/pds/templates/locations.html``:

.. code:: html

  <html>
    <head>
      <title>Locations</title>
    </head>
    <body>
      <table>
        {% for location in locations %}
        <tr>
          <td>
            {{ location.latitude}}, {{ location.longitude }}
            {% if location.matches_ref %}
            (matches)
            {% endif %}
          </td>
        </tr>
        {% empty %}
        <tr>
          <td>
            No locations
          </td>
        </tr>
        {% endfor %}
      </table>
    </body>
  </html>


Adding OpenID Connect validation
--------------------------------

.. note::

  * This section assumes you have an OIDC server online.
  * Prerequisite: install django-constance as described in `Adding
    django-constance support`_.


OpenID Connect is a core component of OMS, providing security and identity
services to the TCC. It authorizes requests to protected areas of the TCC.

Setting up your OIDC client
~~~~~~~~~~~~~~~~~~~~~~~~~~~

On the machine where OIDC is installed, change to the ``postgres`` user:

.. code:: bash

  oms% su - postgres


Next, create a file called ``insert_client.sql`` with the following SQL:

.. note::

   Here, the ``id`` of the new ``client_details`` row is 7, but you can use any
   available ID.


.. code:: sql

  DELETE FROM client_details WHERE id = 7;
  DELETE FROM client_grant_type WHERE owner_id = 7;
  DELETE FROM client_scope WHERE owner_id = 7;

  SET ROLE :role;

  INSERT INTO client_details
  (id,client_description,reuse_refresh_tokens,dynamically_registered,allow_introspection,id_token_validity_seconds,client_id        ,client_secret         ,access_token_validity_seconds,refresh_token_validity_seconds,application_type,client_name      ,token_endpoint_auth_method,subject_type,logo_uri,policy_uri,client_uri,tos_uri,jwks_uri,sector_identifier_uri,request_object_signing_alg,user_info_signed_response_alg,user_info_encrypted_response_alg,user_info_encrypted_response_enc,id_token_signed_response_alg,id_token_encrypted_response_alg,id_token_encrypted_response_enc,default_max_age,require_auth_time,created_at,initiate_login_uri,post_logout_redirect_uri) VALUES
  (7 ,null              ,true                ,false                 ,true               ,31536000                 ,'location_client','1EgLsR9JaOMGoaqpSOHD',31536000                     ,null                          ,null            ,'Location Client','SECRET_BASIC'            ,null        ,null    ,null      ,null      ,null   ,null    ,null                 ,null                      ,null                         ,null                            ,null                            ,null                        ,null                           ,null                           ,60000          ,false            ,now()     ,null              ,null                    )
  ;

  INSERT INTO client_grant_type (owner_id, grant_type) VALUES (7, 'authorization_code');
  INSERT INTO client_grant_type (owner_id, grant_type) VALUES (7, 'client_credentials');
  INSERT INTO client_grant_type (owner_id, grant_type) VALUES (7, 'implicit');
  INSERT INTO client_scope (owner_id, scope) VALUES (7, 'openid');
  INSERT INTO client_scope (owner_id, scope) VALUES (7, 'location');

  RESET ROLE;


This SQL sets up a client called ``Location Client`` with the client ID
``location_client``, client secret ``1EgLsR9JaOMGoaqpSOHD``, and an associated
scope called ``location``.

Execute the SQL with the following command:

.. code:: bash

  oms% psql -d oidc -v role=oidc -f insert_client.sql


This command connects to the ``oidc`` database while setting the variable
``role`` (used by the SQL script) to ``oidc``.

Lastly, log out of the ``postgres`` account:

.. code::

  oms% logout


OIDC in the backend
~~~~~~~~~~~~~~~~~~~

Update the TAB manifest to include the ``oidc_validation`` module:

.. code:: yaml

  modules:
    - oms-core/oidc_validation


Include the libraries used by the ``oidc_validation`` module:

.. code:: yaml

  pip_requirements:
    - requests
    - python-dateutil
    - pytz
    - django-constance[database]


Add OIDC-related settings to constance:

.. code:: yaml

  settings_snippet: |
    CONSTANCE_CONFIG = {
        'INTROSPECTION_ENDPOINT': ('{{ oidc_base_url }}/introspect',
            'introspection endpoint'),
        'CLIENT_ID': ('{{ client_id }}', 'OIDC client ID'),
        'CLIENT_SECRET': ('{{ client_secret }}', 'OIDC client secret'),
    }


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie
      - django-constance[database]
      - requests
      - python-dateutil
      - pytz

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-core/oidc_validation
      - oms-example/pds

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - constance
      - constance.backends.database
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'', include('pds.urls'))

    settings_snippet: |
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'INTROSPECTION_ENDPOINT': ('{{ oidc_base_url }}/introspect',
              'introspection endpoint'),
          'CLIENT_ID': ('{{ client_id }}', 'OIDC client ID'),
          'CLIENT_SECRET': ('{{ client_secret }}', 'OIDC client secret'),
          'REF_LATITUDE': ('42.0', 'reference latitude'),
          'REF_LONGITUDE': ('-71.0', 'reference longitude'),
      }

    fixtures:
      - oms-core/admin_user


Remember to define the template variables.

``/var/oms/etc/deploy.conf``:

.. code::

  ssl_setup: False
  oidc_base_url: https://oidc.example.com/oidc
  client_id: location_client
  client_secret: 1EgLsR9JaOMGoaqpSOHD


To add OIDC validation to a Tastypie API endpoint, use the
``OpenIdConnectAuthorization`` class.

``/var/oms/src/oms-example/pds/api.py``:

.. code:: python

  from tastypie.resources import ModelResource

  from pds.models import Location
  from oidc_validation.authorization import OpenIdConnectAuthorization

  class LocationResource(ModelResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'
          authorization = OpenIdConnectAuthorization()


OIDC validation can also be added to a view using the ``validate_access_token``
decorator.

``/var/oms/src/oms-example/pds/views.py``:

.. code:: python

  from constance import config
  from django.http import HttpResponse
  from django.shortcuts import render_to_response

  from pds.models import Location
  from oidc_validation.decorators import validate_access_token

  @validate_access_token
  def ok(request):
      return HttpResponse('ok')

  @validate_access_token
  def locations(request):
      ref_location = float(config.REF_LATITUDE), float(config.REF_LONGITUDE)
      locations = Location.objects.all()
      for location in locations:
          if (location.latitude, location.longitude) == (ref_location[0],
                                                         ref_location[1]):
              location.matches_ref = True
      return render_to_response('locations.html', {'locations': locations})


Let's redeploy the app and make sure that OpenID Connect validation is working.
Afterwards, when accessing the protected URLs, we should get an HTTP 401 status
code because we are not submitting an ``Authorization`` header with a valid
access token.

.. code:: bash

  oms% curl -i https://HOST.TLD/PDS/api/v1/location/
  HTTP/1.1 401 UNAUTHORIZED
  Server: nginx/1.4.3
  Date: Tue, 17 Dec 2013 08:33:35 GMT
  Content-Type: text/html; charset=utf-8
  Transfer-Encoding: chunked
  Connection: keep-alive

  oms% curl -i https://HOST.TLD/PDS/locations/
  HTTP/1.1 401 UNAUTHORIZED
  Server: nginx/1.4.3
  Date: Tue, 17 Dec 2013 08:33:39 GMT
  Content-Type: text/html; charset=utf-8
  Transfer-Encoding: chunked
  Connection: keep-alive


OIDC in the frontend
~~~~~~~~~~~~~~~~~~~~

Let's create another app in which we'll use OIDC functionality in the frontend.

First, let's create a new module called ``ui`` for use in this app:

.. code:: bash

  oms% mkdir -p /var/oms/src/oms-example/ui/templates
  oms% touch /var/oms/src/oms-example/ui/__init__.py
  oms% touch /var/oms/src/oms-example/ui/models.py
  oms% touch /var/oms/src/oms-example/ui/urls.py
  oms% touch /var/oms/src/oms-example/ui/templates/ui.html


We only need to create an HTML template and give it a URL.

``/var/oms/src/oms-example/ui/templates/ui.html``:

.. code:: html

  <html>
    <head>
      <script type="text/javascript">
        var app_client = '{{ config.APP_CLIENT }}';
        var app_scope = '{{ config.APP_SCOPE }}';
        var oidc_base_url = '{{ config.OIDC_BASE_URL }}';
      </script>
      <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
      <script src="{{ STATIC_URL }}js/OMSOIDC.js"></script>
      <script type="text/javascript">
      $(document).ready(function() {
        $.ajax({
          url: "{{ config.LOCATION_ENDPOINT }}",
        })
        .success(function(msg) {
          $("#output").html(msg["meta"]["total_count"] + ' object(s)');
        });
      });
      </script>
    </head>
    <body>
      <div id="output"></div>
    </body>
  </html>


``/var/oms/src/oms-example/ui/urls.py``:

.. code:: python

  from django.conf.urls import patterns, include, url
  from django.views.generic import TemplateView

  urlpatterns = patterns('',
      url(r'^$', TemplateView.as_view(template_name='ui.html'))
  )


Next, let's update the manifest with our new app, also called ``ui``:

.. code:: yaml

  deploy:
    apps:
      - pds
      - ui

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie
      - django-constance[database]
      - requests
      - python-dateutil
      - pytz

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-core/oidc_validation
      - oms-example/pds

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - constance
      - constance.backends.database
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'', include('pds.urls'))

    settings_snippet: |
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'INTROSPECTION_ENDPOINT': ('{{ oidc_base_url }}/introspect',
              'introspection endpoint'),
          'CLIENT_ID': ('{{ client_id }}', 'OIDC client ID'),
          'CLIENT_SECRET': ('{{ client_secret }}', 'OIDC client secret'),
          'REF_LATITUDE': ('42.0', 'reference latitude'),
          'REF_LONGITUDE': ('-71.0', 'reference longitude'),
      }

    fixtures:
      - oms-core/admin_user

  ui:
    template: sandbox
    instance: UI
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-constance[database]

    modules:
      - oms-example/ui
      - oms-core/static
      - oms-core/api_console

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.admin
      - django.contrib.staticfiles
      - constance
      - constance.backends.database
      - api_console
      - ui

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^admin/', include(admin.site.urls))
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'', include('ui.urls'))

    settings_snippet: |
      TEMPLATE_CONTEXT_PROCESSORS = (
          'django.contrib.auth.context_processors.auth',
          'django.core.context_processors.debug',
          'django.core.context_processors.i18n',
          'django.core.context_processors.media',
          'django.core.context_processors.static',
          'django.core.context_processors.tz',
          'django.contrib.messages.context_processors.messages',
          'constance.context_processors.config',
      )
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'LOCATION_ENDPOINT': ('/PDS/api/v1/location/', 'location endpoint'),
          'OIDC_BASE_URL': ('{{ oidc_base_url }}', 'OIDC server base URL'),
          'APP_CLIENT': ('{{ client_id }}', 'OIDC client ID'),
          'APP_SCOPE': ('{{ scope }}', 'OIDC client scope'),
      }

    fixtures:
      - oms-core/admin_user


Lastly, list ``location`` as the client scope.

``/var/oms/etc/deploy.conf``:

.. code::

  ssl_setup: False
  oidc_base_url: https://oidc.example.com/oidc
  client_id: location_client
  client_secret: 1EgLsR9JaOMGoaqpSOHD
  scope: location


Now you can redeploy, and the new app wll be installed in
``/var/oms/python/UI``. The UI itself will be available at http://HOST.TLD/UI/
(or https).

When you load that page, you will be immediately redirected to the OIDC server,
where you will need to log in and approve the client and scope. You will then
be redirected back to the app. At the end of this process, a valid access token
is saved in a cookie for later use.

The ``OMSOIDC.js`` library, which provides this OIDC functionality in the
frontend and is found in the ``oms-core/static`` module, will add the
``Authorization`` header containing the access token to your HTTP requests.


Adding PDS support
------------------

.. note::

  Prerequisite: install the Django Admin as described in `Adding Django Admin
  support`_.


The Personal Data Store (PDS) supports the secure storage of data in a TCC.

To add support for this feature, update the ``pds`` app's manifest entry to
include the ``pds_base`` module:

.. code:: yaml

  modules:
    - oms-core/pds_base


Next, include the dependencies that this module requires:

.. code:: yaml

  pip_requirements:
    - django-extensions


Finally, remember to install the necessary components:

.. code:: yaml

  installed_apps:
    - django_extensions
    - pds_base


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds
      - ui

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie
      - django-constance[database]
      - requests
      - python-dateutil
      - pytz
      - django-extensions

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-core/oidc_validation
      - oms-example/pds
      - oms-core/pds_base

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - constance
      - constance.backends.database
      - django_extensions
      - pds_base
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'', include('pds.urls'))

    settings_snippet: |
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'INTROSPECTION_ENDPOINT': ('{{ oidc_base_url }}/introspect',
              'introspection endpoint'),
          'CLIENT_ID': ('{{ client_id }}', 'OIDC client ID'),
          'CLIENT_SECRET': ('{{ client_secret }}', 'OIDC client secret'),
          'REF_LATITUDE': ('42.0', 'reference latitude'),
          'REF_LONGITUDE': ('-71.0', 'reference longitude'),
      }

    fixtures:
      - oms-core/admin_user

  ui:
    template: sandbox
    instance: UI
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-constance[database]

    modules:
      - oms-example/ui
      - oms-core/static
      - oms-core/api_console

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.admin
      - django.contrib.staticfiles
      - constance
      - constance.backends.database
      - api_console
      - ui

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^admin/', include(admin.site.urls))
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'', include('ui.urls'))

    settings_snippet: |
      TEMPLATE_CONTEXT_PROCESSORS = (
          'django.contrib.auth.context_processors.auth',
          'django.core.context_processors.debug',
          'django.core.context_processors.i18n',
          'django.core.context_processors.media',
          'django.core.context_processors.static',
          'django.core.context_processors.tz',
          'django.contrib.messages.context_processors.messages',
          'constance.context_processors.config',
      )
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'LOCATION_ENDPOINT': ('/PDS/api/v1/location/', 'location endpoint'),
          'OIDC_BASE_URL': ('{{ oidc_base_url }}', 'OIDC server base URL'),
          'APP_CLIENT': ('{{ client_id }}', 'OIDC client ID'),
          'APP_SCOPE': ('{{ scope }}', 'OIDC client scope'),
      }

    fixtures:
      - oms-core/admin_user


Now, when you create the models for this app, make sure they inherit from
``pds_base.models.PdsModel`` (here: ``pds_models.PdsModel`` because of
a renamed import) instead of Django's ``models.Model``.

``/var/oms/src/oms-example/pds/models.py``:

.. code:: python

  from django.db import models

  from pds_base import models as pds_models

  class Location(pds_models.PdsModel):
      # inherited fields: guid, created_on, and last_modified
      latitude = models.FloatField()
      longitude = models.FloatField()


``PdsModel`` automatically provides three useful fields for each model:
``guid``, ``created_on``, and ``last_modified``, so avoid adding fields with
these names to your models. Feel free to access (read) these fields wherever
you find them to be useful. Continue using Django field classes such as
``models.BooleanField`` to define the fields in your models.

When creating API resource for the PDS-enabled models, inherit from
``PdsResource`` instead of Tastypie's ``ModelResource``.

``/var/oms/src/oms-example/pds/api.py``:

.. code:: python

  from pds.models import Location
  from pds_base.resources import PdsResource
  from oidc_validation.authorization import OpenIdConnectAuthorization

  class LocationResource(PdsResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'
          authorization = OpenIdConnectAuthorization()


Once your TAB is deployed, you can log into the Django Admin to view audit logs
for your PDS-enabled models. After logging into the Admin, click "Audit logs"
in the "Pds_Base" section. You'll see a table of logs, with each entry
representing an access attempt. For each of these attempts, the following
information is stored:

* timestamp
* IP address of the remote client
* path that was accessed
* HTTP method
* HTTP status code of the response


OMS FACT API Transforms
-----------------------

FACT (Functional Access Control Transform) provides a structured way to
transform requests to an OMS backend. In practice, this means removing or
modifying request/response objects on the fly according to developer-defined
criteria.

FACT consists of four components: the Arbiter, state, rules, and transforms.
The Arbiter is a core OMS component, but the others must be provided by the
developer as OMS modules.

Let's continue developing our location app in this tutorial.

First, create empty FACT modules which we'll be expanding in the sections
below:

.. code:: bash

  oms% mkdir /var/oms/src/oms-example/state_generator
  oms% touch /var/oms/src/oms-example/state_generator/__init__.py
  oms% mkdir /var/oms/src/oms-example/rules
  oms% touch /var/oms/src/oms-example/rules/__init__.py
  oms% mkdir /var/oms/src/oms-example/transforms
  oms% touch /var/oms/src/oms-example/transforms/__init__.py


.. note::

  Make sure to use your own repo instead of the fictional ``oms-example`` repo.


Next, add all the modules to the ``~/Location.yaml`` manifest. For example:

.. code:: yaml

  modules:
    - oms-core/arbiter
    - oms-example/state_generator
    - oms-example/rules
    - oms-example/transforms


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds
      - ui

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie
      - django-constance[database]
      - requests
      - python-dateutil
      - pytz
      - django-extensions

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-core/oidc_validation
      - oms-core/arbiter
      - oms-example/state_generator
      - oms-example/rules
      - oms-example/transforms
      - oms-example/pds
      - oms-core/pds_base

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - constance
      - constance.backends.database
      - django_extensions
      - pds_base
      - api_console
      - pds

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'', include('pds.urls'))

    settings_snippet: |
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'INTROSPECTION_ENDPOINT': ('{{ oidc_base_url }}/introspect',
              'introspection endpoint'),
          'CLIENT_ID': ('{{ client_id }}', 'OIDC client ID'),
          'CLIENT_SECRET': ('{{ client_secret }}', 'OIDC client secret'),
          'REF_LATITUDE': ('42.0', 'reference latitude'),
          'REF_LONGITUDE': ('-71.0', 'reference longitude'),
      }

    fixtures:
      - oms-core/admin_user

  ui:
    template: sandbox
    instance: UI
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-constance[database]

    modules:
      - oms-example/ui
      - oms-core/static
      - oms-core/api_console

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.admin
      - django.contrib.staticfiles
      - constance
      - constance.backends.database
      - api_console
      - ui

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^admin/', include(admin.site.urls))
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'', include('ui.urls'))

    settings_snippet: |
      TEMPLATE_CONTEXT_PROCESSORS = (
          'django.contrib.auth.context_processors.auth',
          'django.core.context_processors.debug',
          'django.core.context_processors.i18n',
          'django.core.context_processors.media',
          'django.core.context_processors.static',
          'django.core.context_processors.tz',
          'django.contrib.messages.context_processors.messages',
          'constance.context_processors.config',
      )
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'LOCATION_ENDPOINT': ('/PDS/api/v1/location/', 'location endpoint'),
          'OIDC_BASE_URL': ('{{ oidc_base_url }}', 'OIDC server base URL'),
          'APP_CLIENT': ('{{ client_id }}', 'OIDC client ID'),
          'APP_SCOPE': ('{{ scope }}', 'OIDC client scope'),
      }

    fixtures:
      - oms-core/admin_user


Creating states
~~~~~~~~~~~~~~~

A state is an object that is passed to a set of rules to inform their behavior.

A state is model. You can populate it with any fields that make sense for your
app, and you can attach it to a Tastypie resource in the standard fashion. By
using the API associated with this resource, your app can control FACT's state.

Create a new state model in the location app.

``/var/oms/src/oms-example/state_generator/models.py``:

.. code:: python

  from django.db import models

  class ParallelState(models.Model):
      active = models.BooleanField()
      parallel = models.FloatField()

      @classmethod
      def get_latest(cls):
          latest_query = cls.objects.all().order_by('-id')
          try:
              return latest_query[0]
          except IndexError:
              return None

Add a Tastypie resource for the new model.

``/var/oms/src/oms-example/state_generator/api.py``:

.. code:: python

  from tastypie.authorization import Authorization
  from tastypie.resources import ModelResource

  from state_generator.models import ParallelState

  class ParallelStateResource(ModelResource):
      class Meta:
          queryset = ParallelState.objects.all()
          resource_name = 'state'
          authorization = Authorization()


It's useful to be able to access the ``ParallelState`` model in the Django
Admin.

``/var/oms/src/oms-example/state_generator/admin.py``:

.. code:: python

  from django.contrib import admin

  from state_generator.models import ParallelState

  class ParallelStateAdmin(admin.ModelAdmin):
      list_display = ['id', 'active', 'parallel']

  admin.site.register(ParallelState, ParallelStateAdmin)


Update your manifest to enable the container app and the resource:

.. code:: yaml

  installed_apps:
    - state_generator

  urls_snippet: |
    from tastypie.api import Api

    from state_generator.api import ParallelStateResource

    fact_api = Api(api_name='fact')
    fact_api.register(ParallelStateResource())

   urls:
     - url(r'^api/', include(fact_api.urls))


.. note::

  The ``api_name`` in this ``Api`` object is ``fact`` because the ``v1``
  ``Api`` object already exists in the ``pds`` app's ``urls.py``.


Now our manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - pds
      - ui

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  pds:
    template: sandbox
    instance: PDS
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-tastypie
      - django-constance[database]
      - requests
      - python-dateutil
      - pytz
      - django-extensions

    modules:
      - oms-core/static
      - oms-core/templates
      - oms-core/api_console
      - oms-core/oidc_validation
      - oms-core/arbiter
      - oms-example/state_generator
      - oms-example/rules
      - oms-example/transforms
      - oms-example/pds
      - oms-core/pds_base

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - django.contrib.admin
      - constance
      - constance.backends.database
      - django_extensions
      - pds_base
      - api_console
      - pds
      - state_generator

    urls_snippet: |
      from django.views.generic import TemplateView
      from tastypie.api import Api

      from state_generator.api import ParallelStateResource

      fact_api = Api(api_name='fact')
      fact_api.register(ParallelStateResource())

    urls:
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'^admin/', include(admin.site.urls))
      - url(r'^api/', include(fact_api.urls))
      - url(r'', include('pds.urls'))

    settings_snippet: |
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'INTROSPECTION_ENDPOINT': ('{{ oidc_base_url }}/introspect',
              'introspection endpoint'),
          'CLIENT_ID': ('{{ client_id }}', 'OIDC client ID'),
          'CLIENT_SECRET': ('{{ client_secret }}', 'OIDC client secret'),
          'REF_LATITUDE': ('42.0', 'reference latitude'),
          'REF_LONGITUDE': ('-71.0', 'reference longitude'),
      }

    fixtures:
      - oms-core/admin_user

  ui:
    template: sandbox
    instance: UI
    ssl: {{ ssl_setup }}
    debug: True
    run_tests: False

    pip_requirements:
      - Django<1.6
      - django-constance[database]

    modules:
      - oms-example/ui
      - oms-core/static
      - oms-core/api_console

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.admin
      - django.contrib.staticfiles
      - constance
      - constance.backends.database
      - api_console
      - ui

    urls_snippet: |
      from django.views.generic import TemplateView

    urls:
      - url(r'^admin/', include(admin.site.urls))
      - url(r'^console/$', TemplateView.as_view(template_name='console.html'))
      - url(r'', include('ui.urls'))

    settings_snippet: |
      TEMPLATE_CONTEXT_PROCESSORS = (
          'django.contrib.auth.context_processors.auth',
          'django.core.context_processors.debug',
          'django.core.context_processors.i18n',
          'django.core.context_processors.media',
          'django.core.context_processors.static',
          'django.core.context_processors.tz',
          'django.contrib.messages.context_processors.messages',
          'constance.context_processors.config',
      )
      CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
      CONSTANCE_CONFIG = {
          'LOCATION_ENDPOINT': ('/PDS/api/v1/location/', 'location endpoint'),
          'OIDC_BASE_URL': ('{{ oidc_base_url }}', 'OIDC server base URL'),
          'APP_CLIENT': ('{{ client_id }}', 'OIDC client ID'),
          'APP_SCOPE': ('{{ scope }}', 'OIDC client scope'),
      }

    fixtures:
      - oms-core/admin_user


Creating transforms
~~~~~~~~~~~~~~~~~~~

A transform is a function that accepts two arguments. The first is the object
to be evaluated and the second is a dictionary of attributes that are used in
this evaluation.

The transform may return the object unaltered, or it may modify it in any way.
It may also return ``None``, in which case the object is removed from the
object list in this HTTP transaction.

Let's create a transform that removes all locations south of a given parallel:

``/var/oms/src/oms-example/transforms/__init__.py``:

.. code:: python

  def hide_southern_location(location, attrs):
      '''
      only return points at or north of the parallel
      '''
      if location.latitude >= attrs['parallel']:
          return location


Creating rules
~~~~~~~~~~~~~~

A rule is an object with a single method, ``evaluate`` which accepts the
current state as an argument. It returns a 2-tuple in which the first element
is a list of transforms (function objects), and the second is a dictionary of
attributes that is passed to each of the transforms.

Let's create a rule that combines the state and transform we've created.

``/var/oms/src/oms-example/rules/__init__.py``:

.. code:: python

  from transforms import hide_southern_location

  class HideLocationRule(object):
      def evaluate(self, state):
          funcs, attrs = [], {}
          if state.active:
              funcs.append(hide_southern_location)
              attrs['parallel'] = state.parallel
          return funcs, attrs


Enabling FACT in your app
~~~~~~~~~~~~~~~~~~~~~~~~~

To use FACT with your resource, first add ``rules`` (a list) and ``state`` to
the ``class Meta``.

Next, switch your authorization class to ``OIDCFACTAuthorization``, which
performs OIDC token validation followed by FACT execution.

``/var/oms/src/oms-example/pds/api.py``:

.. code:: python

  from pds.models import Location
  from pds_base.resources import PdsResource
  from rules import HideLocationRule
  from state_generator.models import ParallelState
  from oidc_validation.oidc_fact_authorization import OIDCFACTAuthorization

  class LocationResource(PdsResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'
          authorization = OIDCFACTAuthorization()
          rules = [HideLocationRule]
          state = ParallelState


Using FACT in your app
~~~~~~~~~~~~~~~~~~~~~~

After you deploy the FACT-enabled app, the first thing that you need to do is
to set the state. Let's start by creating an inactive state, in which case FACT
isn't used:

.. code:: bash

  oms% curl -X POST -H "Content-Type: application/json" --data '{"active": false, "parallel": 0.0}' https://HOST.TLD/PDS/api/fact/state/
  oms% curl https://HOST.TLD/PDS/api/v1/location/
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
              "resource_uri": "/PDS/api/v1/location/1/"
          },
          {
              "id": 2,
              "latitude": -42.0,
              "longitude": -71.0,
              "resource_uri": "/PDS/api/v1/location/2/"
          }
      ]
  }


When we create an active state, however, FACT kicks in and we see objects being
filtered from the set of results. In our case, the item with the location below
the equator is removed:

.. code:: bash

  oms% curl -X POST -H "Content-Type: application/json" --data '{"active": true, "parallel": 0.0}' https://HOST.TLD/PDS/api/fact/state/
  oms% curl https://HOST.TLD/PDS/api/v1/location/
  {
      "meta": {
          "limit": 20,
          "next": null,
          "offset": 0,
          "previous": null,
          "total_count": 1
      },
      "objects": [
          {
              "id": 1,
              "latitude": 42.0,
              "longitude": -71.0,
              "resource_uri": "/PDS/api/v1/location/1/"
          }
      ]
  }
