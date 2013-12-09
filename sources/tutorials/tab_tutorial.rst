:title: TAB Development Tutorial
:description: Tutorial for developing TABs (Trusted Application Bundles)
:keywords: oms, tab, trusted, application, bundle, development, developer,


.. _tab_tutorial:

TAB Development Tutorial
========================

This tutorial is a guide for developing Trusted Application Bundles (TABs) for
the Open Mustard Seed (OMS) platform.


Introduction
------------

This tutorial is an easy-to-follow guide to developing TABs that leverage the
power of the OMS framework. Throughout it, we develop a simple TAB, building
it from scratch and adding OMS-supported features one step at a time.

The modularity and reusability of OMS components make it easy to create
full-featured applications in a short amount of time.


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


Create a Basic Django Project
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Let's start with a Django project with a single Tastypie-enabled app called
``location``.  We'll convert the Django project to an OMS app and the Django
app to an OMS module.

The ``INSTALLED_APPS`` setting in the ``settings.py`` file for this project
looks like this (we'll need this later when we set up the manifest for the
TAB).

.. code:: python

  INSTALLED_APPS = (
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.sites',
      'django.contrib.messages',
      'django.contrib.staticfiles',
      'location',
  )


The ``location`` app contains three files:

* ``__init__.py`` (empty)
* ``models.py``
* ``api.py``
* ``views.py``

This is ``models.py``:

.. code:: python

  from django.db import models

  class Location(models.Model):
      latitude = models.FloatField()
      longitude = models.FloatField()


This is ``api.py``:

.. code:: python

  from tastypie.resources import ModelResource

  from location.models import Location

  class LocationResource(ModelResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'


This is ``views.py``

.. code:: python

  from django.http import HttpResponse

  def ok(request):
      return HttpResponse('ok')


Additionally, the ``urls.py`` file for the project looks like this:

.. code:: python

  from django.conf.urls import patterns, include, url
  from tastypie.api import Api

  from location.api import LocationResource

  v1_api = Api(api_name='v1')
  v1_api.register(LocationResource())

  urlpatterns = patterns('',
      url(r'^api/', include(v1_api.urls)),
      url(r'^ok/$', 'location.views.ok'),
  )


Create OMS-Compatible Modules
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

OMS apps are collections of OMS modules.

We can take our ``location`` app and convert it into an OMS module
by copying it from the Django project into the top level of a git repository
(we'll use the fictional ``oms-example`` repo).

Next, we need to copy ``urls.py`` into the new module, ensuring that it
contains only the code relevant to that module (not a problem for the
``location`` module).

Finally, we need to update the code so that references to the ``location``
module are prefixed with ``modules.`` (this is because all modules are placed
in the ``modules`` package during deployment).  Therefore, we need to update
the import in ``api.py``:

.. code:: python

  from tastypie.resources import ModelResource

  from modules.location.models import Location  # adding "modules."

  class LocationResource(ModelResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'


We also need to do this for ``urls.py``:

.. code:: python

  from django.conf.urls import patterns, include, url
  from tastypie.api import Api

  from modules.location.api import LocationResource  # adding "modules."

  v1_api = Api(api_name='v1')
  v1_api.register(LocationResource())

  urlpatterns = patterns('',
      url(r'^api/', include(v1_api.urls)),
      url(r'^ok/$', 'modules.location.views.ok'),  # adding "modules."
  )


Create a Deployable Manifest
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A manifest is file that describes and configures a TAB. It is used by
oms-deploy to deploy the TAB into a TCC. Manifests can then be combined with
other applications, bundled together in a *manifest collection*, and even
imported into an OMS Registry to be deployed from a web interface.

Manifests are in `YAML <http://www.yaml.org>`_ format. They also support
templating, so that variable data (such as hostnames) can be factored out and
placed in ``/var/oms/etc/deploy.conf``. During deployment, the manifest is
rendered using the variable definitions in ``deploy.conf``.

``deploy.conf`` uses a simple key-value syntax using the ``:`` separator.  For
example:

.. code::

  ssl_setup: True
  hostname: foo.example.com
  oidc_base_url: https://oidc.example.com/idoic


In our TAB, the manifest looks like this:

.. code:: yaml

  deploy:
    apps:
      - location

  module_repos:
    oms-core: https://github.com/IDCubed/oms-core
    oms-example: https://github.com/IDCubed/oms-example

  location:
    template: sandbox
    instance: Location
    ssl: {{ ssl_setup }}
    debug: True

    pip_requirements:
      - Django==1.5.5
      - django-tastypie

    modules:
      - oms-example/location

    installed_apps:
      - django.contrib.auth
      - django.contrib.contenttypes
      - django.contrib.sessions
      - django.contrib.sites
      - django.contrib.messages
      - django.contrib.staticfiles
      - modules.location

    urls:
      - url(r'', include('modules.location.urls'))


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
* ``ssl_setup`` must be defined with ``True`` or ``False`` in ``deploy.conf``.

Manifests also support other parameters (e.g. ``urls_snippet``,
``settings_snippet``).

This example manifest describes a simple but complete TAB. We'll be fleshing it
out with additional features in the sections that follow.


..
  Create a TAB
  ~~~~~~~~~~~~

  Create a manifest collection to serve as the TAB for this app. This is
  primarily a step related to TABs installed from/through the web interface of a
  Registry. It is OK to skip this step if developing and working from the command
  line (and thus deploying TABs from manifests as ``.yaml`` files).


Create a Manifest for an Existing Django Project
------------------------------------------------

As an aside from our location example, it is also possible to use OMS to deploy
an existing Django project from a git repository, rather than the default of
compiling a Django project from modules pulled together from various module
repositories.

Here is an example using an application called OpenPDS:

.. code:: yaml

  deploy:
    apps:
      - openpds


  openpds:
    compile: False
    instance: openpds
    project_name: OMS-PDS
    vhost: localhost

    pip_requirements:
      - Django==1.5.4
      - django-tastypie==0.9.15
      - mongoengine
      - django-celery
      - pymongo
      - requests
      - django-extensions
      - django-uni-form

    repo:
      branch: MITv0.4
      name: OMS-PDS
      url: 'https://github.com/IDCubed/OMS-PDS/'


This will deploy the OMS-PDS Django project from GitHub, checking out the
``MITv0.4`` branch in the process. This would result in the following:

* a virtualenv created for the ``openpds`` project at
  ``/var/oms/python/openpds/``
* the OMS-PDS git repo cloned from GitHub to ``$virtualenv/OMS-PDS/``
* in this case, the OMS-PDS git repo has a Django project now available at
  ``$virtualenv/OMS-PDS/oms_pds/``
* all project dependencies listed in
  ``$virtualenv/OMS-PDS/conf/requirements.txt`` are installed into the
  virtualenv
* no scripts, configs, etc. installed or fixtures loaded into the database
* the ``vhost`` parameter can be ignored in this example
* Nginx and uWSGI hooked up to serve up the application


Adding Django Admin support
---------------------------

If you would like to enable support for the `Django Admin
<https://docs.djangoproject.com/en/dev/ref/contrib/admin/>`_, you'll need to
make some updates to your manifest.

First, enable the Admin URLs:

.. code:: yaml

  urls:
    - url(r'^admin/', include(admin.site.urls))
    ...


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
    ...


Finally, install the fixture that creates an admin user for your app. You may
wish to edit this fixture to change the password. By default, the username is
``admin`` and the password is ``adminadmin``.

.. code:: yaml

  fixtures:
    ...
    - oms-core/admin_user


The Admin will be available at http://HOST.TLD/Location/admin/ (or https).


Adding django-constance support
-------------------------------

.. warning::

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
  1.6 .  Please update your manifest to use Django<1.6 with this plugin.


To install django-constance, you'll need to make a few updates to your
manifest.

First, install django-constance (with database support):

.. code:: yaml

  pip_requirements:
    ...
    - django-constance[database]


Then, install django-constance into your app:

.. code:: yaml

  installed_apps:
    ...
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
    ...
    CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'
    CONSTANCE_CONFIG = {
        'FOO': ('bar', 'my random setting'),
    }


Now you can use the settings stored with django-constance as you would if
importing them from the Django's ``settings.py``:

.. code:: python

  from constance import config
  ...
  token = config.FOO


django-constance in the frontend
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Some additional setup is required to use constance in the frontend.

Override the hidden default ``TEMPLATE_CONTEXT_PROCESSORS`` setting by adding
constance's context processor:

.. code:: yaml

  settings_snippet: |
    ...
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


You can now use constance variables in your templates:

.. code:: html

  <p>{{ config.FOO }}</p>


.. note::

  Remember to render your template with a ``RequestContext`` object instead of
  the usual ``Context`` object.


Add OpenID Connect Validation
-----------------------------

.. warning::

  * This section assumes you have an OIDC server online, along with at least
    one client and one associated scope.
  * Prerequisite: install django-constance as described in `Adding
    django-constance support`_.


OpenID Connect is a core component of OMS, providing security and identity
services to the TCC. Requests to protected areas of the TCC are authorized by
the OIDC server.

Update the TAB manifest to include the ``oic_validation`` module:

.. code:: yaml

  modules:
    ...
    - oms-core/oic_validation


Include the libraries used by the ``oic_validation`` module:

.. code:: yaml

  pip_requirements:
    ...
    - requests
    - python-dateutil
    - pytz
    - django-constance[database]


Add OIDC-related settings to constance:

.. code:: yaml

  settings_snippet: |
    ...
    CONSTANCE_CONFIG = {
         ...
        'TOKENSCOPE_ENDPOINT': ('{{ oidc_base_url }}/tokenscope?scope={{ scope }}',
                                'tokenscope endpoint'),
    }


.. note::

  Don't forget to define the template variables in ``deploy.conf``.


To add OIDC validation to a Tastypie API endpoint, use the
``OpenIdConnectAuthorization`` class:

.. code:: python

  from tastypie.resources import ModelResource

  from modules.location.models import Location
  from modules.oic_validation.authorization import OpenIdConnectAuthorization

  class LocationResource(ModelResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'
          authorization = OpenIdConnectAuthorization()


OIDC validation can also be added to a view using the ``validate_access_token``
decorator:

.. code:: python

  from django.http import HttpResponse

  from modules.oic_validation.decorators import validate_access_token

  @validate_access_token
  def ok(request):
      return HttpResponse('ok')


OIDC in the frontend
~~~~~~~~~~~~~~~~~~~~

If you require OIDC functionality in your UI, you need to make a few more updates.

Add a module containing the ``OMSOIDC.js`` library to your manifest:

.. code:: yaml

  modules:
    ...
    oms-core/static


Add additional settings to constance:

.. code:: yaml

  settings_snippet: |
    ...
    CONSTANCE_CONFIG = {
         ...
        'TOKENSCOPE_ENDPOINT': ('{{ oidc_base_url }}/tokenscope?scope={{ scope }}',
                                'tokenscope endpoint'),
        'TOKEN_ENDPOINT': ('{{ oidc_base_url }}/token', 'token endpoint'),
        'CLIENT_ID': ('{{ client_id }}', 'client id'),
        'CLIENT_SECRET': ('{{ client_secret }}', 'client secret'),
        'SCOPES': ('{{ scopes }}', 'scopes'),
    }


.. note::

  Don't forget to define the template variables in ``deploy.conf``.


In the templates where you require OIDC, make sure jQuery is available and add
the following JavaScript snippet, which defines three variables required by
``OMSOIDC.js``:

.. code:: html

  <script type="text/javascript">
    var app_client = '{{ config.APP_CLIENT }}';
    var app_scope = '{{ config.APP_SCOPE }}';
    var oidc_base_url = '{{ config.OIDC_BASE_URL }}';
    ...
  </script>


You must also include the ``OMSOIDC.js`` file in your templates:

.. code:: html

  <script src="{{ STATIC_URL }}js/OMSOIDC.js"></script>


.. note::

  * ``STATIC_URL`` points to the server location where the static content is
    stored and is automatically defined for you.


``OMSOIDC.js`` will intercept jQuery's ``ajax`` calls, adding the
``Authorization`` header containing an access token to your HTTP requests. The
access token is obtained during the first AJAX request, when the user is
temporarily redirected to the OIDC server. The token is then cached in a cookie
for later use.


Adding the API Console
----------------------

The API Console is an optional but useful tool to help you test and debug your
API endpoints. It presents a simple, clean web UI in which you can craft HTTP
requests to--and receive responses from--your app's endpoints, avoiding the need to
rely on other tools.

Update your manifest to include the module and its dependencies:

.. code:: yaml

  modules:
    ...
    - oms-core/static
    - oms-core/templates
    - oms-core/api_console


Install the API console:

.. code:: yaml

  installed_apps:
    ...
    - modules.api_console


Finally, add the URL for the console:

.. code:: yaml

  urls_snippet: |
    ...
    from django.views.generic import TemplateView

  urls: |
    ...
    - url(r'^console/$', TemplateView.as_view(template_name='console.html'))


The API console will be available at http://HOST.TLD/Location/console/ (or
https).


Adding a Web Frontend (UI)
--------------------------

In the frontend, OMS supports regular static files (e.g. JavaScript, CSS) as
well as templates created with `Django's template language
<https://docs.djangoproject.com/en/dev/topics/templates/>`_ .

A module's static files should be placed a directory called ``static`` and its
templates in a directory called ``templates``. Both of these directories should
be placed at the top level of the module.


Static Files
~~~~~~~~~~~~

OMS uses Django's ``staticfiles`` management command to collect a TAB's static
files into a single location that can be easily served in production.

If there is more than one file with the same name across two or more modules,
``staticfiles`` will collect only the first file it finds (as determined by the
ordering in the manifest's ``installed_apps`` setting).

You can work around this limitation by renaming the duplicate files or by
changing the order of modules in ``installed_apps``.


Creating and Extending Templates
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Templates need to be referenced in the manifest's ``urls`` parameter. For
example:

.. code:: yaml

  urls_snippet: |
    ...
    from django.views.generic import TemplateView

  urls:
    ...
    - url(r'^$', TemplateView.as_view(template_name='index.html'))


You may wish to create a base template (called ``app_base.html`` or similar)
that can be extended by other templates in your module. This template will
be the skeleton of the frontend, containing common code used by all templates
in your app. Code that is not common can be marked with ``block`` tags, which
are filled in by inheriting templates.

Here is an example ``app_base.html``:

.. code:: html

  <!DOCTYPE html>
  <html lang="en">
      <head>
          <title>{% block title %}{% endblock %}</title>
          <link href="{{ STATIC_URL }}css/bootstrap.css" rel="stylesheet">
          <link href="{{ STATIC_URL }}css/bootstrap-responsive.css" rel="stylesheet">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
          <!--[if lt IE 9]>
          <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
          <![endif]-->
          {% block extrahead %}{% endblock %}
      </head>
      <body>
          {% block content %}{% endblock %}
          {% block le_javascript %}{% endblock %}
      </body>
  </html>


.. note::

  * ``STATIC_URL`` points to the server location where the static content is
    stored and is automatically defined for you.


You can now create a template called ``app_base_nav.html`` that extends
``app_base.html``:

.. code:: html

  {% extends "app_base.html" %}

  {% block extrahead %}
  <script>var someVariablesSetInHead=NULL;</script>
  {% endblock %}

  {% block content %}
      <div class="navbar navbar-inverse navbar-fixed-top">
        <div class="navbar-inner">
          <div class="container">
            <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </a>
            <div class="nav-collapse collapse">
              <ul class="nav">
                <li><a href="#">Trust Frameworks</a></li>
                <li><a href="#">Testing Console</a></li>
                <li><a href="#">Login</a></li>
              </ul>
            </div> <!-- /.nav-collapse -->
          </div>
        </div>
      </div>

      <div class="container" id="container">
        {% block incontent %}{% endblock %}
      </div> <!-- /container -->
  {% endblock %}


Note how this template fills in the ``extrahead`` and ``content`` blocks while
adding a new ``incontent`` block.

The ``app_base_nav.html`` template itself can be extended, such that the
extending templates inherit both the basic layout and navigation.


Loading OMS Templates and Static Files
--------------------------------------

As a convenience, OMS bundles a set of JavaScript libraries in a module that is
available for your use. The libraries include the following:

* `Backbone <http://backbonejs.org>`_
* `Bootstrap <http://getbootstrap.com/javascript/>`_
* `jQuery <http://jquery.com>`_
* `Modernizr <http://modernizr.com>`_
* `Underscore <http://underscorejs.org>`_

To use this module, update your manifest:

.. code:: yaml

  modules:
    ...
    - oms-core/static


.. note::

  OMS static files take precedence over application files. See
  the `Static Files`_ section for solutions.


There is also a convenient base template which you can extend in your
templates. It is contained in another module, and you can likewise add it to
your manifest:

.. code:: yaml

  modules:
    ...
    - oms-core/templates


.. note::

  OMS template files take precedence over application files. See
  the `Static Files`_ section for solutions.


Adding PDS support to your models
---------------------------------

.. warning::

  Prerequisite: install the Django Admin as described in `Adding Django Admin
  support`_.


The Personal Data Store (PDS) supports the secure storage of data in a TCC. To
add support for this feature, choose an app in your manifest as your PDS app.
Then, update this app's manifest entry to include the ``pds_base`` module:

.. code:: yaml

  modules:
    ...
    - oms-core/pds_base


Next, include the dependencies that this module requires:

.. code:: yaml

  pip_requirements:
    ...
    - django-extensions


Finally, remember to install the necessary components:

.. code:: yaml

  installed_apps:
    ...
    - django_extensions
    - modules.pds_base


Now, when you create the models for this app, make sure they inherit from
``modules.pds_base.models.PdsModel`` (here: ``pds_models.PdsModel`` because of
a renamed import) instead of Django's ``models.Model``:

.. code:: python

  from django.db import models

  from modules.pds_base import models as pds_models

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
``PdsResource`` instead of Tastypie's ``ModelResource``:

.. code:: python

  from modules.location.models import Location
  from modules.pds_base.resources import PdsResource

  class LocationResource(PdsResource):
      class Meta:
          queryset = Location.objects.all()
          resource_name = 'location'


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
