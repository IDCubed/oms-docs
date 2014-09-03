:title: Basic Django Web Development Tutorial
:description: Introductory Tutorial, Basics to Building Webapps with Django
:keywords: oms, django, webapp, tab, development, developer,


.. _tutorial-basic-django:

Basics to Building Webapps with Django
======================================

This tutorial aims to provide an introduction to building powerful and flexible
web applications using the Django web development framework. We will try to
focus on details pertinent to making our development easier and faster.

Django is known as the *web development framework for perfectionists with
deadlines*, and has stood test of time (on the Internet) rather well. It is
based on Python and leverages all the power of the Python ecosystem.

Let's get started!


Starting out with virtualenv
----------------------------

Set the ``WORKON_HOME`` environment variable:

.. code::

   root@anubis:~# export WORKON_HOME=/var/oms/python


You can confirm the value of this environment variable with:

.. code::

   root@anubis:~# echo $WORKON_HOME
   /var/oms/python


Now *load* the virtualenv wrapper utilities into your shell:

.. code::

   root@anubis:~# source /usr/local/bin/virtualenvwrapper.sh 


Now we can create a virtual python environment:

.. code::

   root@anubis:~# mkvirtualenv HelloWorld
   New python executable in HelloWorld/bin/python
   Installing setuptools............done.
   Installing pip...............done.


Note that you should now see a ``(HelloWorld)`` prefix added to your prompt:

.. code::

   (HelloWorld)root@anubis:~#

This means your shell is working within the context of this particular
(``HelloWorld``) python virtualenv. In other words, if you run ``python``, you
are using the python executable from ``$WORKON_HOME/HelloWorld/bin/python``.

You should also be able to see this virtualenv with ``lsvirtualenv``:

.. code::

   (HelloWorld)root@anubis:~# lsvirtualenv 
   HelloWorld


To walk you through some important points on how to use virtualenv, let's
deactivate this environment:

.. code::

   (HelloWorld)root@anubis:/var/oms/python# deactivate
   root@anubis:~# 


To reactivate, use ``workon <virtualenv>``, eg:

.. code::

   root@anubis:~# workon HelloWorld
   (HelloWorld)root@anubis:~# 


What is the significance of activating/deactivating the virtualenv?

The purpose of the virtualenv is to create a container for a python environment
that is isolated from the system's python environment as well as other virtual
environments that may exist on the system. When you *activate* a virtualenv,
then run ``python``, you are using (executing) the python binary from within
that virtualenv. Additionally, python packages installed with a virtualenv
active, are installed *into* that virtualenv. let's try something to illustrate,
install django, with your virtualenv still active:

.. code::

   (HelloWorld)root@anubis:~# pip install django
   Downloading/unpacking django
     Downloading Django-1.5.2.tar.gz (8.0MB): 8.0MB downloaded
     Running setup.py egg_info for package django
       
       warning: no previously-included files matching '__pycache__' found under directory '*'
       warning: no previously-included files matching '*.py[co]' found under directory '*'
   Installing collected packages: django
     Running setup.py install for django
       changing mode of build/scripts-2.7/django-admin.py from 644 to 755
       
       warning: no previously-included files matching '__pycache__' found under directory '*'
       warning: no previously-included files matching '*.py[co]' found under directory '*'
       changing mode of /var/oms/python/HelloWorld/bin/django-admin.py to 755
   Successfully installed django
   Cleaning up...


Now deactivate your virtualenv and try to run the ``django-admin.py`` command:

.. code::

   (HelloWorld)root@anubis:~# deactivate 
   root@anubis:~# django-admin.py
   django-admin.py: command not found


If you reactivate the virtualenv, you should have access to the
``django-admin.py`` command:

.. code-block:: python

   root@anubis:~# workon HelloWorld
   (HelloWorld)root@anubis:~# django-admin.py
   Usage: django-admin.py subcommand [options] [args]
   
   Options:
     -v VERBOSITY, --verbosity=VERBOSITY
                           Verbosity level; 0=minimal output, 1=normal output,
                           2=verbose output, 3=very verbose output
     --settings=SETTINGS   The Python path to a settings module, e.g.
                           "myproject.settings.main". If this isn't provided, the
                           DJANGO_SETTINGS_MODULE environment variable will be
                           used.
     --pythonpath=PYTHONPATH
                           A directory to add to the Python path, e.g.
                           "/home/djangoprojects/myproject".
     --traceback           Print traceback on exception
     --version             show program's version number and exit
     -h, --help            show this help message and exit
   
   Type 'django-admin.py help <subcommand>' for help on a specific subcommand.
   ...


Create a django project
-----------------------

Great, let's get into creating a new django project/webapp - cd to
``/var/oms/python/HelloWorld`` then use the ``django-admin.py`` utility:

.. code::

   (HelloWorld)root@anubis:/var/oms/python# cd /var/oms/python/HelloWorld/

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld# django-admin.py startproject sandbox

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld# ls -alh sandbox/
   total 16K
   drwxr-xr-x 3 root root 4.0K Aug 29 03:02 .
   drwxr-xr-x 7 root root 4.0K Aug 29 03:02 ..
   -rw-r--r-- 1 root root  250 Aug 29 03:02 manage.py
   drwxr-xr-x 2 root root 4.0K Aug 29 03:02 sandbox


Let's take a quick look at what django has provided us. note that this is an
empty project with no apps, has settings unconfigured, and no URL routes - *but*
this empty project can still run the development server, so we can confirm that
we have everything setup correctly before we jump into developing our first
django project. here's a directory listing, the four ``.py`` source files in
particular:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# ls -alh sandbox/
   total 36K
   drwxr-xr-x 2 root root 4.0K Aug 29 03:33 .
   drwxr-xr-x 3 root root 4.0K Aug 29 03:02 ..
   -rw-r--r-- 1 root root    0 Aug 29 03:02 __init__.py
   -rw-r--r-- 1 root root  141 Aug 29 03:33 __init__.pyc
   -rw-r--r-- 1 root root 5.3K Aug 29 03:02 settings.py
   -rw-r--r-- 1 root root 2.8K Aug 29 03:33 settings.pyc
   -rw-r--r-- 1 root root  559 Aug 29 03:02 urls.py
   -rw-r--r-- 1 root root 1.4K Aug 29 03:02 wsgi.py
   -rw-r--r-- 1 root root 1.1K Aug 29 03:33 wsgi.pyc


For the next set of steps, we'll need to confirm the Host's IP and open an
external port so we can access the django development server in the cloud. $ote
that you will see a different IP with ``ifconfig`` than what is listed here.
Also note that you do not need to use port 8000, just make sure what you open
with ``ufw`` is what you use with runserver:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# ifconfig eth0 | grep inet
          inet addr:1.1.2.2  Bcast:1.1.255.255  Mask:255.255.255.0


Open the port for remote connections. alternatively, you could limit access to a
specific remote IP with ``ufw allow from $IP``, where ``$IP`` is a valid numeric
IP address or network block:

.. code-block:: python

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# ufw allow 8000
    adding rule
    adding rule (v6)


Let's go into this new sandbox project and start up django's builtin HTTP server,
available with the ``runserver`` management command:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py runserver 1.1.2.2:8000
   Validating models...
   
   0 errors found
   August 28, 2013 - 22:48:36
   Django version 1.5.2, using settings 'sandbox.settings'
   Development server is running at http://1.1.2.2:8000/
   Quit the server with CONTROL-C.


Fire up your web browser to confirm you can access runserver ok. your URL will
be something like http://1.1.2.2:8000/ - or, if you have DNS setup for your
host: http://host.domain.tld:8000/. You should see an entry in output from
``runserver`` on the console, similar to:
``[28/Aug/2013 22:49:40] "GET / HTTP/1.1" 200 1958``

Ok, let's complete the config bits we need, create a database, and get on with
creating our app. Start by using ``ctrl-c`` to close the ``runserver`` process,
then edit ``sandbox/settings.py``, adding the following at the top:

.. code-block:: python

   import os
   import sys 
   
   PROJECT_ROOT = os.path.dirname(__file__)


Tell django we want to use the sqlite3 file-based database and where it lives:

.. code-block:: python

   DATABASES = { 
       'default': {
           'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
           'NAME': 'dev.db',                      # Or path to database file if using sqlite3.
           # The following settings are not used with sqlite3:
           'USER': '', 
           'PASSWORD': '', 
           'HOST': '',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
           'PORT': '',                      # Set to empty string for default.
       }   
   }


Uncoment the following, further down in ``sandbox/settings.py``, look for
``INSTALLED_APPS``:

.. code-block:: python

   'django.contrib.admin',
   'django.contrib.admindocs',


And edit ``sandbox/urls.py`` to include the URL routes for the admin interface.
ensure it has the following:

.. code-block:: python

   from django.conf.urls import patterns, include, url

   # Uncomment the next two lines to enable the admin:
   from django.contrib import admin
   admin.autodiscover()

   urlpatterns = patterns('',
       url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
       url(r'^admin/', include(admin.site.urls)),
   )


We've added the built in admin apps and their URL routes, so let's create a
database with all this. note that we will create an admin user as part of this,
because this is the first use of ``syncdb`` since enabling the django admin:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py syncdb
   Creating tables ...
   Creating table auth_permission
   Creating table auth_group_permissions
   Creating table auth_group
   Creating table auth_user_groups
   Creating table auth_user_user_permissions
   Creating table auth_user
   Creating table django_content_type
   Creating table django_session
   Creating table django_site
   Creating table django_admin_log
   
   You just installed Django's auth system, which means you don't have any superusers defined.
   Would you like to create one now? (yes/no): yes
   Username (leave blank to use 'root'): admin
   Email address: admin``admin.tld
   Password: 
   Password (again): 
   Superuser created successfully.
   Installing custom SQL ...
   Installing indexes ...
   Installed 0 object(s) from 0 fixture(s)


And finally, start the django runserver back up:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py runserver 1.1.2.2:8000
   Validating models...
   
   0 errors found
   August 28, 2013 - 22:48:36
   Django version 1.5.2, using settings 'sandbox.settings'
   Development server is running at http://1.1.2.2:8000/
   Quit the server with CONTROL-C.


You should now be able to go to the django admin UI in your browser. Your URL
will be something like http://1.1.2.2:8000/admin/ - or, if you have DNS setup for
your host: http://host.domain.tld:8000/admin/. You should see the login form -
enter your user/password credentials you provided to django when creating the
database and including the admin models.


Create a Todo app module
------------------------

Let's add some models and create some objects with the admin UI. We will
first need to create a module/app in our project:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# cd sandbox/
   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox/sandbox# django-admin.py startapp todo


What did this do? Django created a new directory ``todo`` and then created some
files for us, an ``__init__.py``, ``models.py``, ``tests.py``, and ``views.py``,
seen here:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox/sandbox# ls -alh
   total 44K
   drwxr-xr-x 3 root root 4.0K Aug 29 17:50 .
   drwxr-xr-x 4 root root 4.0K Aug 29 17:33 ..
   -rw-r--r-- 1 root root    0 Aug 29 03:02 __init__.py
   -rw-r--r-- 1 root root  141 Aug 29 03:33 __init__.pyc
   -rw-r--r-- 1 root root 5.3K Aug 29 17:42 settings.py
   -rw-r--r-- 1 root root 3.1K Aug 29 17:42 settings.pyc
   drwxr-xr-x 2 root root 4.0K Aug 29 17:50 todo
   -rw-r--r-- 1 root root  303 Aug 29 04:18 urls.py
   -rw-r--r-- 1 root root  491 Aug 29 17:20 urls.pyc
   -rw-r--r-- 1 root root 1.4K Aug 29 03:02 wsgi.py
   -rw-r--r-- 1 root root 1.1K Aug 29 03:33 wsgi.pyc
   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox/sandbox# ls -alh todo/
   total 20K
   drwxr-xr-x 2 root root 4.0K Aug 29 17:50 .
   drwxr-xr-x 3 root root 4.0K Aug 29 17:50 ..
   -rw-r--r-- 1 root root    0 Aug 29 17:50 __init__.py
   -rw-r--r-- 1 root root   57 Aug 29 17:50 models.py
   -rw-r--r-- 1 root root  383 Aug 29 17:50 tests.py
   -rw-r--r-- 1 root root   26 Aug 29 17:50 views.py


Let's edit ``sandbox/todo/models.py`` to add a simple ``Todo`` model class.
Ensure this file contains the following:

.. code-block:: python

   from django.db import models

   class Task(models.Model):
       '''
       data model for an OMS example todo app
   
       '''
       description = models.CharField(max_lenth=255,
           help_text='short description of the task, limited to 255 characters')
       done = models.BooleanField(default=False, 
           blank=True,            
           help_text='flag to confirm whether or not the task is complete')


Here we've defined a data model for our example OMS app reflecting a simple TODO
list. In this data model we have a short description of the task and a flag to
track whether or not the task is complete.

Let's tell django how to display this model in the admin UI by creating a file
``sandbox/sandbox/todo/admin.py`` with the following contents:

.. code-block:: python

   '''
   django admin definitions for the Todo example OMS app
   
   '''
   from django.contrib import admin
   from sandbox.todo.models import Task
   
   admin.site.register(Task)


We'll need to tell django about this ``todo`` module, so edit
``sandbox/settings.py`` to include ``'sandbox.todo'`` in ``INSTALLED_APPS``.
Note that django uses ``INSTALLED_APPS`` (defined in ``<project>/settings.py``)
to look for models, migrations, fixtures, management commands, and other bits
to your app modules. be really careful, python is sensitive to tabs and spaces -
recommendation: setup your editor to use _spaces for tabs_, with a *tabstop* of
4 spaces.

While on the topic of editing source files.. some developers will be comfortable
working on the linux/unix console, while others will not - this tutorial assumes
you are working on the console and editing source files this way, but recognizes
that you can just as easily edit source on your local laptop/desktop and upload
changes to the project directory with rsync or another tool.

We have just created a new data model and told django about it as well as how to
display the model in the admin UI, but django needs to update the database to
have a place to put instance of the model - for this we use the ``syncdb``
management command:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox/sandbox# cd .. 
   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py syncdb                                        
   Creating tables ...
   Creating table todo_task
   Installing custom SQL ...
   Installing indexes ...
   Installed 0 object(s) from 0 fixture(s)


Runserver will have picked up the changes to the project's ``settings.py`` and
the module's ``models.py``, so we ought to be able to reload the admin dashboard
and see our Todo module included with our Task model - <SCREENSHOT>. you can now
use the UI to create a few Tasks.

Once you have a few Task objects, take a look at the list of Tasks at
http://host.domain.tld:8000/admin/todo/task/ - note the ``Task Object`` title..
this isn't so helpful, so let's add the following method to our ``Task`` model
in ``sandbox/todo/models.py``. note that after updating the file you ought to be
able to simply reload the Task list in the admin UI and see the change immediately:

.. code-block:: python

   def __unicode__(self):
       return self.description


This Task list in the admin UI is pretty neat, but missing some detail - why not
also show whether or not the Task were complete? ensure
``sandbox/sandbox/todo/admin.py`` has the following:

.. code-block:: python

   '''
   django admin definitions for the Todo example OMS app
   
   '''
   from django.contrib import admin
   from sandbox.todo.models import Task
   
   
   class TaskAdmin(admin.ModelAdmin):
       '''
       admin definition for the Task model
   
       '''
       list_display = ('id', 'description', 'done')
   
   
   admin.site.register(Task, TaskAdmin)


Reload the Task list and you should now see three columns in the table with our
list of Tasks to include the Primary Key ID (``id``), ``description``, and status
of the ``done`` flag for each Task.

Let's make a change to the model and then move on to some other stuff. The change
we would like to make is to add a date/time stamp to the Task model, a
``Task.created_on`` field. In ``sandbox/sandbox/todo/model.py`` ensure you have
the ``Task`` model as the following:

.. code-block:: python

   '''
   data models for an OMS example todo app
   
   '''
   import datetime
   from django.db import models
   from django.utils.timezone import utc
   
   class Task(models.Model):
       '''
       Tasks are items in the TODO list
   
       '''
       description = models.CharField(max_length=255,
           help_text='short description of the task, limited to 255 characters')
       done = models.BooleanField(default=False,
           blank=True,
           help_text='flag to confirm whether or not the task is complete')
       created_on = models.DateTimeField(blank=True,
           null=True,
           help_text='date the task was created')
   
       def __unicode__(self):
           return self.description
   
       def save(self, *args, **kwargs):
           '''
           ensure our Task has a ``created_on`` timestamp, and make this a timezone
           aware datetime object based on the UTC timezone.
   
           '''
           if not self.created_on:
               now = datetime.datetime.utcnow().replace(tzinfo=utc)
               self.created_on = now
           # call the superclass .save() - eg: models.Model.save()
           super(Task, self).save(*args, **kwargs)


.. **
.. this comment here grounds out bad syntax highlinging for .rst and the ** above


Given how django handles time zones and timezone objects, we have a few more
updates to make, outlined here: https://docs.djangoproject.com/en/1.5/topics/i18n/timezones/.
First, we will need the ``pytz`` python package. While we're here with pip and
python packages, let's do things *the right way*, so as to make our lives easier
later. create a directory ``/var/oms/python/HelloWorld/sandbox/conf``:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# mkdir conf


And create a file ``/var/oms/python/HelloWorld/sandbox/conf/requirements.txt``
with the following contents:

.. code::

   django
   pytz


As we include new python packages as dependencies in our project (later), we will
add them to this file and use ``pip install -r
/var/oms/python/HelloWorld/sandbox/conf/requirements.txt`` to install the
dependencies.. so with ``pytz`` in our ``sandbox/conf/requirements.txt`` we can
then install the package with ``pip install -r conf/requirements.txt``:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# pip install -r conf/requirements.txt
   Downloading/unpacking pytz (from -r conf/requirements.txt (line 1))
     Downloading pytz-2013b.zip (535kB): 535kB downloaded
     Running setup.py egg_info for package pytz
       
       warning: no files found matching '*.pot' under directory 'pytz'
       warning: no previously-included files found matching 'test_zdump.py'
   Requirement already satisfied (use --upgrade to upgrade): django in /var/oms/python/HelloWorld/lib/python2.7/site-packages (from -r conf/requirements.txt (line 1))
   Installing collected packages: pytz
     Running setup.py install for pytz
       
       warning: no files found matching '*.pot' under directory 'pytz'
       warning: no previously-included files found matching 'test_zdump.py'
   Successfully installed pytz
   Cleaning up...


With the package available, django can do what it needs with timezones, but we
also need to update ``sandbox/sandbox/settings.py`` to enable this support - find
``USE_TZ`` and set this to ``True``.

Now, if you reload the admin UI, you'll get an error - this is django telling you
it sees that this ``Task`` model should have a field - ``created_on``, but when
trying to load the objects from the database, django's admin UI did not find the
corresponding column in the ``todo_task`` table. we need to update the database,
but a normal syncdb will not work because we are changing an existing model
rather than creating a new one. At this point we have a few options:

 * use the ``dbshell`` management command to open a shell with our database, then
   use SQL to update the table definition. This might appeal to some developers,
   maybe those used to PHP, but some developers appear to be showing an allergic
   reaction to SQL these days, so let's explore our other options before we
   proceed.
 * use python/django to define a database migration and have django update the
   table for us - this sounds nice.. but with django 1.5.x, this is only available
   if the ``south`` database migration utility is used (django 1.6 or 1.7 appear
   to be getting a database migration support). Defining and running a migration
   makes a lot of sense for large or complex changes, but we've only added a
   single field, so maybe this isn't the best option for this situation.
 * remove the ``dev.db`` sqlite database and have django create a new one.

But before we remove the database file, let's export the data so we can easily
import it later - django uses fixtures for exporting and import data. In this
case, let's create two fixtures to make things easier for us later.

Let's start with a fixture for the admin user we created, saving the data dump
to a ``fixtures`` directory:

.. ** temporary 

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# mkdir fixtures
   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py dumpdata --indent=4 auth.user > fixtures/admin.json


This is what the fixture looks like:

.. code-block:: json

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# cat fixtures/admin.json 
   [
   {
       "pk": 1, 
       "model": "auth.user", 
       "fields": {
           "username": "admin", 
           "first_name": "", 
           "last_name": "", 
           "is_active": true, 
           "is_superuser": true, 
           "is_staff": true, 
           "last_login": "2013-08-29T18:45:42.426Z", 
           "groups": [], 
           "user_permissions": [], 
           "password": "pbkdf2_sha256$10000$YzWkcgb7M6Mr$9RLkj3xCaqjJCYygT5vvoYcVrVQNFrxDlBUdgMY+1ds=", 
           "email": "admin``admin.tld", 
           "date_joined": "2013-08-29T18:45:16.919Z"
       }
   }
   ]



Let's make a fixture for our Tasks objects from this Todo app, but we first need
to comment out our previous changes to ``sandbox/sandbox/todo/models.py``, the
``created_on`` field and ``Task.save()`` method. With this edit in place, create
the fixture:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py dumpdata --indent=4 todo.task > fixtures/tasks.json


Now that we have a fixture to make it easier to repopulate our database later, we
can remove the ``dev.db`` file and start fresh. Before doing this, uncomment the
field and class method we just commented out (before creating the fixture). We
can now remove the file and have django recreate the database. Note that we are
saying ``no`` to django's question if we should create a superuser:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# rm dev.db 
   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py syncdb
   Creating tables ...
   Creating table auth_permission
   Creating table auth_group_permissions
   Creating table auth_group
   Creating table auth_user_groups
   Creating table auth_user_user_permissions
   Creating table auth_user
   Creating table django_content_type
   Creating table django_session
   Creating table django_site
   Creating table django_admin_log
   Creating table todo_task
   
   You just installed Django's auth system, which means you don't have any superusers defined.
   Would you like to create one now? (yes/no): no
   Installing custom SQL ...
   Installing indexes ...
   Installed 0 object(s) from 0 fixture(s)


With the empty database recreated, let's import our fixtures, creating an admin
(super)user and our tasks from before:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py loaddata fixtures/admin.json fixtures/tasks.json 
   Installed 4 object(s) from 2 fixture(s)


While we're here, let's add the ``created_on`` field to the ``list_display``
tuple in our ``Task`` admin definition.

If we reload the admin UI, we should now see the tasks from before.  Note that
none of our Task objects have a date/time stamp yet, but our ``Task.save()``
method would add one if it did not exist, so let's open each Task object in the
admin UI and save it <SCREENSHOT>. GREAT!


debugging helpers
-----------------

Ok, let's leave runserver up and do some work in another console. note that if
you are not familiar with SSH or the console, you can either start a new SSH
session, or use a console (terminal) multiplexor like ``tmux``. describing how to
use tmux is outside the scope of this tutorial, but a few hours of use will prove
its worth - rather than start new SSH sessions, you create a pseudo terminal that
can have many windows and panes. you can also 'detach' the session, logout, and
reattach later after logging back in from another location (which you can't
really do with SSH).

Let's install some tools to help us.. having created a second terminal/console,
activate your virtualenv and install the ``werkzeug`` and ``django-extensions``
packages with pip by first adding ``werkzeug`` and ``django-extensions`` to our
requirements.txt file, then installing with ``pip install -r
conf/requirements.txt``

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# pip install -r conf/requirements.txt
   Downloading/unpacking werkzeug
     Downloading Werkzeug-0.9.4.tar.gz (1.1MB): 1.1MB downloaded
     Running setup.py egg_info for package werkzeug
       
       warning: no files found matching '*' under directory 'werkzeug/debug/templates'
       warning: no files found matching '*' under directory 'tests'
       warning: no previously-included files matching '*.pyc' found under directory 'docs'
       warning: no previously-included files matching '*.pyo' found under directory 'docs'
       warning: no previously-included files matching '*.pyc' found under directory 'tests'
       warning: no previously-included files matching '*.pyo' found under directory 'tests'
       warning: no previously-included files matching '*.pyc' found under directory 'examples'
       warning: no previously-included files matching '*.pyo' found under directory 'examples'
       no previously-included directories found matching 'docs/_build'
   Downloading/unpacking django-extensions
     Downloading django-extensions-1.2.0.tar.gz (149kB): 149kB downloaded
     Running setup.py egg_info for package django-extensions
       
   Downloading/unpacking six (from django-extensions)
     Downloading six-1.3.0.tar.gz
     Running setup.py egg_info for package six
     
   Requirement already satisfied (use --upgrade to upgrade): django in /var/oms/python/HelloWorld/lib/python2.7/site-packages (from -r conf/requirements.txt (line 1))
   Requirement already satisfied (use --upgrade to upgrade): pytz in /var/oms/python/HelloWorld/lib/python2.7/site-packages (from -r conf/requirements.txt (line 2))
       
   Installing collected packages: werkzeug, django-extensions, six
     Running setup.py install for werkzeug
       
       warning: no files found matching '*' under directory 'werkzeug/debug/templates'
       warning: no files found matching '*' under directory 'tests'
       warning: no previously-included files matching '*.pyc' found under directory 'docs'
       warning: no previously-included files matching '*.pyo' found under directory 'docs'
       warning: no previously-included files matching '*.pyc' found under directory 'tests'
       warning: no previously-included files matching '*.pyo' found under directory 'tests'
       warning: no previously-included files matching '*.pyc' found under directory 'examples'
       warning: no previously-included files matching '*.pyo' found under directory 'examples'
       no previously-included directories found matching 'docs/_build'
     Running setup.py install for django-extensions
       
     Running setup.py install for six
       
   Successfully installed werkzeug django-extensions six
   Cleaning up...


We're going to use a debugger built into werkzeug to do in-browser debugging,
using the modified version of django's ``runserver``, provided by
``django-extensions`` as the ``runserver_plus`` management command. Thus, to get
``runserver_plus``, we need to tell django about the extensions package - edit
``sandbox/settings.py`` again and add ``'django_extensions',`` to the
``INSTALLED_APPS`` tuple.

After editing ``sandbox/settings.py``, go back to the first console with
``runserver`` running and kill it with ``ctrl-c``, it's time to use
``runserver_plus``:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# python manage.py runserver_plus 1.1.2.2:8000
   Validating models...
   0 errors found
   
   Django version 1.5.2, using settings 'sandbox.settings'
   Development server is running at http://1.1.2.2:8000/
   Using the Werkzeug debugger (http://werkzeug.pocoo.org/)
   Quit the server with CONTROL-C.
    * Running on http://1.1.2.2:8000/
    * Restarting with reloader
   Validating models...
   0 errors found
   
   Django version 1.5.2, using settings 'sandbox.settings'
   Development server is running at http://1.1.2.2:8000/
   Using the Werkzeug debugger (http://werkzeug.pocoo.org/)
   Quit the server with CONTROL-C.


Adding a REST API
-----------------

Note that some tastypie tutorials might suggest putting your API resource
definitions in ``mymodule/api.py``, but this does not scale well when you get to
adding many resources, custom authentication and other bits and pieces many
webapps end up with. Thus, we are using this opportunity to exemplify a slightly
different, more flexible, and explicit approach.

We first need to add another python package, ``django-tastypie``, to our
dependency list for pip in ``sandbox/conf/requirements.txt``, and install
tastypie with ``pip install -r conf/requirements.txt``. Note that, for some
reason that is beyond us, tastypie does not set the ``mimeparse`` package as a
dependency in its ``setup.py`` so we have to include this in our
``requirements.txt`` as well. At this point, our ``requirements.txt`` ought to
look something like:

.. code::

   
   django
   pytz
   mimeparse
   django-tastypie
   
   # for debugging
   werkzeug
   django-extensions


Next, create a new directory in the Todo module and give it an empty file
``__init__.py`` - this will create ``todo.api`` as a python module:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# mkdir sandbox/todo/api
   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# touch sandbox/todo/api/__init__.py


Create ``sandbox/todo/api/resources.py`` with the following:

.. code-block:: python

   '''
   API resource definitions for an example Todo module
   
   '''
   from tastypie.resources import ModelResource
   from sandbox.todo.models import Task
   
   
   class TaskResource(ModelResource):
       class Meta:
           queryset = Task.objects.all()
           resource_name = 'tasks'



...and update the ``sandbox/todo/api/__init__.py`` to include the following:

.. code-block:: python

   '''
   Todo app API

   '''
   from .resources import TaskResource


With the API Resource defined, we now need to add this API to our project. While
this is currently a simple project, it'll grow in size and complexity over time,
and we may find this project's APIs being pulled in from many different modules
(like our ``todo`` module). Thus, we will first create a project-level API
module - ``sandbox/sandbox/api.py`` with the following, this will register each
API resource and define URL routes for the webapp's API as a whole (as opposed
to APIs the module provides):

.. code-block:: python

   '''
   API resource registration and URL routes for an example OMS webapp
   
   '''
   from tastypie.api import Api 
   from sandbox.todo.api import TaskResource
   
   v1_api = Api(api_name='v1')
   v1_api.register(TaskResource())


Lastly, we need to ensure the project's ``urls.py`` has the following:

.. code-block:: python

   '''
   URL routes for an example OMS webapp
   
   '''
   from django.conf.urls import patterns, include, url
   
   # Uncomment the next two lines to enable the admin:
   from django.contrib import admin
   admin.autodiscover()
   
   from .api import v1_api
   
   
   urlpatterns = patterns('',
       url(r'^api/',
           include(v1_api.urls)),
       url(r'^admin/doc/',
           include('django.contrib.admindocs.urls')),
       url(r'^admin/',
           include(admin.site.urls)),
   )


We're now ready to start looking at this API resource from the browser, and we'll
use the following URL to start: http://host.domain.tld:8000/api/v1/?format=json
- this is the base URL of the project's API, and returns a *schema* for the APIs
available. You ought to see: ``{"tasks": {"list_endpoint": "/api/v1/tasks/",
"schema": "/api/v1/tasks/schema/"}}``. This is telling us that there is a
``tasks`` resource with a *list endpoint* available at ``/api/v1/tasks/`` and the
full schema for the ``tasks`` resource at ``/api/v1/tasks/schema/``.

Let's checkout the schema for the ``tasks`` resource at
http://host.domain.tld:8000/api/v1/tasks/schema/, you should see the following
returned:

.. code-block:: json

   {"allowed_detail_http_methods": ["get", "post", "put", "delete", "patch"], "allowed_list_http_methods": ["get", "post", "put", "delete", "patch"], "default_format": "application/json", "default_limit": 20, "fields": {"created_on": {"blank": false, "default": "No default provided.", "help_text": "date the task was created", "nullable": true, "readonly": false, "type": "datetime", "unique": false}, "description": {"blank": false, "default": "No default provided.", "help_text": "short description of the task, limited to 255 characters", "nullable": false, "readonly": false, "type": "string", "unique": false}, "done": {"blank": true, "default": false, "help_text": "flag to confirm whether or not the task is complete", "nullable": false, "readonly": false, "type": "boolean", "unique": false}, "id": {"blank": true, "default": "", "help_text": "Integer data. Ex: 2673", "nullable": false, "readonly": false, "type": "integer", "unique": true}, "resource_uri": {"blank": false, "default": "No default provided.", "help_text": "Unicode string data. Ex: \"Hello World\"", "nullable": false, "readonly": true, "type": "string", "unique": false}}}


Unfortunately, by default, tastypie does not use a pretty print response for JSON
(with indentation and newlines), but this is why OMS includes an API console. (at
a later date, this tutorial ought to include the API console at this point or in
the previous section). Regardless, if you take a look at this response you will
see that the schema describes what a client can expect from this API resource.
Note that it is not perfect/complete, but it's a good start for something
auto-generated by the tastypie library.

Let's take a look at the actual task API resource at
http://host.domain.tld:8000/api/v1/tasks/?format=json - you should see a JSON
representation of the objects currently in the app, and if you look at
http://host.domain.tld:8000/api/v1/tasks/1/?format=json you ought to only see the
first object. Note that the ``?format=json`` is a convenience for poking at the
API via the browser but is not required for other clients (who set the appropriate
``Accept`` and ``Content Type`` HTTP headers).


Add a View
~~~~~~~~~~

We're now going to add a basic django ``TemplateView`` using django's _class-based
views_. More documentation about django's CBV's can be seen here <LINK>. We will
use this basic view to define a template, include some JavaScript, and eventually,
to access our current project's API via js.

It's generally best to define URL routes per-module, and then include these
routes in a project ``urls.py``, just as we did with the django admin. In other
words, when we added the django admin, we did not define all the URL routes for
the admin UI, we simply told django that requests for ``/admin/`` should include/use
the admin URLs from the admin module. We will follow the same methodology here,
so first create a URL routes source file for the todo module at
``sandbox/sandbox/todo/urls.py`` with the following:

.. code-block:: python

   '''
   URL routes for the todo example module
   
   '''
   from django.conf.urls import patterns, include, url
   from django.views.generic import TemplateView
   
   
   urlpatterns = patterns('',
       url(r'$',
           TemplateView.as_view(template_name='tasks.html'),
           name='todo_tasks'),
   )



Next, we'll hook up a route for the todo module to include the URL we just
defined - ensure the project ``urls.py`` at ``sandbox/sandbox/urls.py`` has the
following:

.. code-block:: python

   '''
   URL routes for an example OMS webapp
   
   '''
   from django.conf.urls import patterns, include, url
   
   # Uncomment the next two lines to enable the admin:
   from django.contrib import admin
   admin.autodiscover()
   
   from .api import v1_api
   
   urlpatterns = patterns('',
       url(r'^todo/',
           include('sandbox.todo.urls')),
       url(r'^api/',
           include(v1_api.urls)),
       url(r'^admin/doc/',
           include('django.contrib.admindocs.urls')),
       url(r'^admin/',
           include(admin.site.urls)),
   )


If you try to load http://host.domain.tld:8000/todo/ you should see a ``Template
does not exist`` error - this is perfect. If you see another error, check over
the details noted above.

We also need to define a template, but we will first create a ``templates``
directory in our ``todo`` module:

.. code::

   (HelloWorld)root@anubis:/var/oms/python/HelloWorld/sandbox# mkdir sandbox/todo/templates


Create a template for the todo module at ``sandbox/sandbox/todo/templates/tasks.html``
with the following content:

.. code-block:: html

   <!DOCTYPE html>
   <html lang="en">
       <head>
           <title>task list</title>
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
       </head>
       <body>
           <div class="container" id="container">
               <p>Hello World!</p>
           <div> <!-- /container -->
       </body>
   </html>


With the URL routes and this ``hello world`` template in place, you ought to be
able to reload the page at http://host.domain.tld:8000/todo/ and see the rendered
HTML from the template.
