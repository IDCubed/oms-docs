:title: Add FACT support to a TAB
:description: How to add FACT API support to a TAB
:keywords: api, fact, tab, function, transformation, transform, access-control

.. _FACT:

OMS FACT API Transforms
=======================

FACT (Functional Access Control Transform) is an OMS implementation of the [[http://en.wikipedia.org/wiki/Transfer_function|transfer function]] for Web APIs, and it provides a structured way to transform requests to an OMS-enabled backend.  In practice, this means removing or modifying request/response objects on the fly according to developer-defined criteria.

FACT consists of four components: the Arbiter, state, rules, and transforms.  The Arbiter is a core OMS component, but the others must be provided by the developer as OMS modules.

Make sure to include all the modules in your manifest.  For example:

.. code::

   modules:
     - oms-core/arbiter
     - oms-experimental/state_generator
     - oms-experimental/rules
     - oms-experimental/transforms


The examples in the following sections assume an OMS module called ``locationapp``.  Its ``models.py`` contains the following model:

.. code::

   from django.db import models

   class Location(models.Model):
       latitude = models.FloatField()
       longitude = models.FloatField()


Its initial ``api.py`` is as follows:

.. code::

   from tastypie.authorization import Authorization
   from tastypie.resources import ModelResource

   from modules.locationapp.models import Location

   class LocationResource(ModelResource):
       class Meta:
           queryset = Location.objects.all()
           resource_name = 'location'
           authorization = Authorization()  # this is insecure!


Creating states
---------------

A state is an object that is passed to a set of rules to inform their behavior.

A state is model.  You can populate it with any fields that make sense for you app, and you can attach it to a Tastypie resource in the standard fashion.  By using the API associated with this resource, your app can control FACT's state.

For example, your ``state_generator/models.py`` might look like this:

.. code::

   from django.db import models

   class FooState(models.Model):
       active = models.BooleanField()
       offset_level = models.PositiveIntegerField()


and your ``state_generator/api.py`` like this:

.. code::

   from tastypie.authorization import Authorization
   from tastypie.resources import ModelResource

   from modules.state_generator.models import FooState

   class FooStateResource(ModelResource):
       class Meta:
           queryset = FooState.objects.all()
           resource_name = 'state'
           authorization = Authorization()  # this is insecure!


Update your manifest to enable the container app and the resource:

.. code::

   installed_apps:
     - modules.state_generator

   urls_snippet: |
     from tastypie.api import Api
     from modules.state_generator.api import FooStateResource

     v1_api = Api(api_name='v1')
     v1_api.register(FooStateResource())


Creating transforms
-------------------

A transform is a function that accepts two arguments.  The first is the object to be evaluated and the second is a dictionary of attributes that are used in this evaluation.

The transform may return the object unaltered, or it may modify it in any way.  It may also return ``None`` in which case the object is removed from the object list for this request/response.

For example, a transform might remove all locations south of a given parallel:

.. code::

   def hide_southern_location(location, attrs):
       if location.latitude >= attrs['parallel']:  # only return points north of the parallel
           return location


Another transform might offset the geographical coordinates in a location object:

.. code::

   def offset_location(location, attrs):
       location.latitude += attrs['lat_offset']
       location.longitude += attrs['lon_offset']
       return location


Creating rules
--------------

A rule is an object with a single method, ``evaluate`` which accepts the current state as an argument.  It returns a 2-tuple in which the first element is a list of transforms (function objects), and the second is a dictionary of attributes that is passed to each of the transforms.

.. code::

   from modules.transforms import offset_location

   class OffsetLocationRule(object):
       def evaluate(self, state):
           funcs, attrs = [], {}
           if state.active:
               funcs.append(offset_location)
               attrs['lat_offset'] = state.offset_level * 0.1
               attrs['lon_offset'] = state.offset_level * 0.1
           return funcs, attrs


Enabling FACT in your app
-------------------------

FACT executes in the Tastypie resource's Authorization class.


Creating an Authorization class
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The Authorization class should instantiate the Arbiter as its attribute.  The class also needs to use its ``resource_meta`` to access the resource's state and rules.  Since the Arbiter returns a list of objects, a decorator is used on the ``*_detail`` methods to covert the list to a boolean.

In our example, the Authorization class in ``locationapp/authorization.py`` looks like this:

.. code::

   from tastypie.authorization import Authorization

   from modules.arbiter import Arbiter

   def list_to_boolean(auth_method):
       '''
       Decorator to convert an empty list to False, and to True otherwise
       '''
       def wrapper(self, object_list, bundle):
           if auth_method(self, object_list, bundle):
               return True
           return False
       return wrapper

   class ATAuthorization(Authorization):

       arbiter = Arbiter()

       def read_list(self, object_list, bundle):
           return self.arbitrate(object_list)

       @list_to_boolean
       def read_detail(self, object_list, bundle):
           return self.arbitrate(object_list)

       # create_list (not used)

       @list_to_boolean
       def create_detail(self, object_list, bundle):
           return self.arbitrate(object_list)

       def update_list(self, object_list, bundle):
           return self.arbitrate(object_list)

       @list_to_boolean
       def update_detail(self, object_list, bundle):
           return self.arbitrate(object_list)

       def delete_list(self, object_list, bundle):
           return self.arbitrate(object_list)

       @list_to_boolean
       def delete_detail(self, object_list, bundle):
           return self.arbitrate(object_list)

       def arbitrate(self, object_list):
           '''
           This method activates the Arbiter, passing in the objects, rules, and
           state.
           '''
           rules = self.resource_meta.rules
           state = self.resource_meta.state.get_latest()
           return self.arbiter.arbitrate(object_list, rules, state)


Enabling FACT in the resource
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To use FACT with your resource, simply use your Arbiter-enabled Authorization class, and add ``rules`` (a list) and ``state`` to the ``class Meta``.

For example, ``locationapp/api.py`` will look like this:

.. code::

   from tastypie.resources import ModelResource

   from modules.locationapp.models import Location
   from modules.locationapp.authorization import ATAuthorization
   from modules.rules import OffsetLocationRule
   from modules.state_generator.models import FooState

   class LocationResource(ModelResource):
       class Meta:
           queryset = Location.objects.all()
           resource_name = 'location'
           authorization = ATAuthorization()
           rules = [OffsetLocationRule]
           state = FooState


