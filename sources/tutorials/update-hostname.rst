How to Update the Hostname of a System running OMS
==================================================

This tutorial will provide a walkthrough of how to update the hostname in the
Trusted Compute Framework of a system running an Open Mustard Seed Trusted
Compute Cell (OMS TCC).

.. note::

   There are a few reasons why this might make sense to do, though this is
   necessary if you have a TCC on a *new* host that was *cloned* from an existing
   host.


Review the Existing Configuration
---------------------------------

Let's first review the state of this system, so we are all on the same page. You
should be able to run the same commands listed here and see similar, but not
identical results. In this walkthrough, we will update the hostname of our demo
host from *beta-new* to *chiron* and the fully qualified domain name from
*beta.openmustardseed.org* to *omega.openmustardseed.org* - replace these values
with those applicable to your update.

This VM was originally created with the hostname ``beta-new``, which we can see
in ``/etc/hostname`` and ``/etc/salt/minion_id``:

.. code:: bash

   # cat /etc/hostname
   beta-new
   # cat /etc/salt/minion_id
   beta-new


OMS sees the TCC from the perspective of a fully qualified domain name - such as
*beta.openmustardseed.org* - recognizing that the system's hostname may actually
be different. This is an important distinction that allows many TCC (each on a
different virtual host) to co-exist on a single system/host. We can see this in
``/var/oms/etc/deploy.conf``:

.. code:: bash

   # cat /var/oms/etc/deploy.conf 
   oidc_host: beta.openmustardseed.org
   vhost_base_url: https://beta.openmustardseed.org/
   hostname: beta.openmustardseed.org
   ssl_setup: True
   oidc_base_url: https://beta.openmustardseed.org/oidc
   coreid_client_id: coreid_registry
   coreid_registration_view: modules.coreid_registration.views.CoreIDPersonaInitRegistrationView
   coreid_registration_form_class: modules.coreid_registration.forms.CoreIDRegistrationForm
   coreid_client_secret: coreid_registry


These values are derived from configuration provided to the host's VRC, which we
can see in ``/etc/salt/pillar/bootstrap.sls``:

.. code:: yaml

   base_packages: [build-essential, tmux, vim, git, htop, wget, curl, python-setuptools]
   reclass:
     localhost:
       classes: [oms-tcc-small-community]
       parameters:
         oms:
           deploy_defaults: {ssl_setup: True, hostname: beta.openmustardseed.org, vhost_base_url: 'https://${oms:deploy_defaults:hostname}/' }
           version: v0.8.5

.. note::

   You might wonder where we derive the configuration keys defined in
   *deploy.conf*, and which are not shown above in *bootstrap.sls*. Internally,
   the VRC is intelligently combining multiple definitions of the *oms* and
   *deploy_defaults* config keys to derive the net result. The important point
   here is that what is defined in *bootstrap.sls* takes precedence, and in the
   case of *oms:deploy_defaults:hostname*, (by default) updates to this key will
   cascade to others, such as *oms:deploy_defaults:vhost_base_url*.


Update the Hostname
-------------------

We'll take this in steps:

#. Update the VRC Configuration;
#. Review and apply the updates to the VRC;
#. Use the VRC to update the system.


Update the VRC Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Updating the hostname requires updating the host's VRC configuration, then
propogatng these updates to the OMS TCC installed on the host.

Let's start by updating the VRC configuration:

#. Open ``/etc/salt/pillar/bootstrap.sls`` for editing.
#. Look for ``reclass:localhost:parameters``, open a new line below this, and
   add ``system_fqdn: <hostname>`` with *<hostname>* set to the new hostname for
   this system. This example will use *chiron*. **Please see the note below about
   the importance of maintaining the proper indentation and spacing.**
#. Look for the following key: ``oms:deploy_defaults:hostname``, also found
   under ``reclass:localhost:parameters``, seen above as
   ``beta.openmustardseed.org``. Update the ``hostname`` key as needed, and
   save/close the file. In this tutorial we've updated the TCC vhost to
   ``omega.openmustardseed.org``.
#. Review *bootstrap.sls*, our example has: 

.. code:: yaml

   base_packages: [build-essential, tmux, vim, git, htop, wget, curl, python-setuptools]
   reclass:
     localhost:
       classes: [oms-tcc-small-community]
       parameters:
         system_fqdn: chiron
         oms:
           deploy_defaults: {ssl_setup: True, hostname: omega.openmustardseed.org, vhost_base_url: 'https://${oms:deploy_defaults:hostname}/' }
           version: v0.8.5


.. note::

   **Be sure that you maintain the correct indentation and spacing, and use spaces
   not tabs. This is VERY important, and will cause you headaches if not correct.
   Your updated bootstrap.sls should have the same spacing and intentation
   exemplified above - please review your update before continuing**.


Review the VRC Updates
~~~~~~~~~~~~~~~~~~~~~~

With the updates above complete, we'll now run these changes through the VRC and
review the output to ensure the updates are correct: ``salt-call --local
state.sls reclass.update_tops test=True`` - you should see salt describe the
updates it would make, had ``test=True`` not been included. In this update, we
see the following, and you will see something similar:

.. code:: bash

   ...

   ----------
       State: - file
       Name:      /etc/salt/states/nodes/chiron.yml
       Function:  managed
           Result:    None
           Comment:   The following values are set to be changed:
   diff: --- 
   +++ 
   @@ -3,5 +3,5 @@
      - oms-tcc-small-community

    parameters: 
   -  oms: {'deploy_defaults': {'ssl_setup': True, 'hostname': 'beta.openmustardseed.org', 'vhost_base_url': 'https://${oms:deploy_defaults:hostname}/'}, 'version': 'v0.8.5'}
   +  oms: {'deploy_defaults': {'ssl_setup': True, 'hostname': 'omega.openmustardseed.org', 'vhost_base_url': 'https://${oms:deploy_defaults:hostname}/'}, 'version': 'v0.8.5'}


   Changes:   
   ----------
       State: - cmd
       Name:      reclass-salt --top --nodes-uri /etc/salt/states/nodes  --classes-uri /etc/salt/states/classes  > /etc/salt/states/top.sls
       Function:  run
           Result:    None
           Comment:   Command "reclass-salt --top --nodes-uri /etc/salt/states/nodes  --classes-uri /etc/salt/states/classes  > /etc/salt/states/top.sls" would have been executed
           Changes:   

   Summary
   ------------
   Succeeded: 3
   Failed:    0
   Not Run:   2
   ------------
   Total:     5


Keep the Salt Minion ID in Sync
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This next step is optional.

This update will help with consistency, as the hostname and minion ID are often
set to the same value. This update will not directly affect the hostname set in
``/etc/hostname``.

Open ``/etc/salt/minion_id`` and update the ID defined here. This is the ID salt
will use when running ``salt-minion`` and ``salt-call --local``. Internally, the
VRC will also use this ID.

If you do edit *minion_id* with the updated hostname, let's review the proposed
update (seen above) by applying the formula in test mode: ``salt-call --local
state.sls reclass.update_tops test=True``.

Note that you will see errors from reclass and salt in the beginning of the
output, they are associated with reclass being unable to find a node definition
(because we just changed it), and they will be addressed by the formula about to
be applied.

The output will be similar to the following:

.. code:: bash

   ...

   ----------
       State: - file
       Name:      /etc/salt/states/nodes/chiron.yml
       Function:  managed
           Result:    True
           Comment:   File /etc/salt/states/nodes/chiron.yml updated
           Changes:   diff: New file
                      
   ----------
       State: - cmd
       Name:      reclass-salt --top --nodes-uri /etc/salt/states/nodes  --classes-uri /etc/salt/states/classes  > /etc/salt/states/top.sls
       Function:  run
           Result:    True
           Comment:   Command "reclass-salt --top --nodes-uri /etc/salt/states/nodes  --classes-uri /etc/salt/states/classes  > /etc/salt/states/top.sls" run
           Changes:   pid: 1906
                      retcode: 0
                      stderr: 
                      stdout: 
                      
   
   Summary
   ------------
   Succeeded: 5
   Failed:    0
   ------------
   Total:     5


Note that this will leave two node definitions in ``/etc/reclass/nodes/``, one
associated with each the old and new minion IDs:

.. code:: bash

   root@beta-new:~# ls -alh /etc/reclass/nodes/
   total 16K
   drwxr-xr-x  2 root root 4.0K May 19 16:16 .
   drwx------ 26 root root 4.0K May 19 14:27 ..
   -rw-r--r--  1 root root  260 May 19 16:16 chiron.yml
   -rw-r--r--  1 root root  260 May 19 16:04 beta-new.yml


It is fine to remove the old node definition:
``rm /etc/reclass/nodes/beta-new.yml``.

Note that the *.yml* file on your host will not likely be named *beta-new.yml*,
this is defined by the minion ID, so you will see what your minion ID was set to
previously.


Apply the Updates to the VRC
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Having reviewed the updates with ``salt-call --local reclass.update_tops
test=True``, let's apply the updates by dropping the *test=True*:

.. code:: bash

   root@beta-new:~# salt-call --local state.sls reclass.update_tops

   ...

      ----------
       State: - cmd
       Name:      reclass-salt --top --nodes-uri /etc/salt/states/nodes  --classes-uri /etc/salt/states/classes  > /etc/salt/states/top.sls
       Function:  run
           Result:    True
           Comment:   Command "reclass-salt --top --nodes-uri /etc/salt/states/nodes  --classes-uri /etc/salt/states/classes  > /etc/salt/states/top.sls" run
           Changes:   pid: 1906
                      retcode: 0
                      stderr: 
                      stdout: 


   Summary
   ------------
   Succeeded: 5
   Failed:    0
   ------------
   Total:     5


Propogate the Updates
~~~~~~~~~~~~~~~~~~~~~

With the VRC updated, we can use the VRC to update the system.

Let's first review these updates using *test=True*. We will review the changes
seen if we applied the *hostname* and *oms* formula.

Here is the *hostname* formula:

.. code:: bash

   root@beta-new:~# salt-call --local state.sls hostname test=True

   ...

   local:
   ----------
       State: - file
       Name:      /etc/hostname
       Function:  managed
           Result:    None
           Comment:   The following values are set to be changed:
   diff: --- 
   +++ 
   @@ -1 +1 @@
   -beta-new+chiron
   
           Changes:   
   ----------
       State: - service
       Name:      hostname
       Function:  running
           Result:    None
           Comment:   Service hostname is set to start
           Changes:   
   ----------
       State: - module
       Name:      saltutil.refresh_modules
       Function:  wait
           Result:    True
           Comment:   
           Changes:   
   
   Summary
   ------------
   Succeeded: 1
   Failed:    0
   Not Run:   2
   ------------
   Total:     3

Here is the *oms* formula:

.. code:: bash

   root@beta-new:~# salt-call --local state.sls oms test=True

   ----------
       State: - file
       Name:      /var/oms/etc/deploy.conf
       Function:  managed
           Result:    None
           Comment:   The following values are set to be changed:
   diff: --- 
   +++ 
   @@ -1,8 +1,8 @@
   -oidc_host: beta.openmustardseed.org
   -vhost_base_url: https://beta.openmustardseed.org/
   -hostname: beta.openmustardseed.org
   +oidc_host: omega.openmustardseed.org
   +vhost_base_url: https://omega.openmustardseed.org/
   +hostname: omega.openmustardseed.org
    ssl_setup: True
   -oidc_base_url: https://beta.openmustardseed.org/oidc
   +oidc_base_url: https://omega.openmustardseed.org/oidc
    coreid_client_id: coreid_registry
    coreid_registration_view: modules.coreid_registration.views.CoreIDPersonaInitRegistrationView
    coreid_registration_form_class: modules.coreid_registration.forms.CoreIDRegistrationForm
   
   
           Changes:   
   
   Summary
   -------------
   Succeeded: 12
   Failed:     0
   Not Run:    1
   -------------
   Total:     13


Apply the updates noted above by re-running these last two commands, dropping
*test=True* each time.

.. code:: bash

   root@beta-new:~# salt-call --local state.sls oms
   root@beta-new:~# salt-call --local state.sls hostname


Test the updates
~~~~~~~~~~~~~~~~

Let's see what the system thinks the hostname is now..

.. code:: bash

   root@beta-new:~# hostname
   chiron

Let's also confirm what the TCC has in *deploy.conf*:

.. code:: bash

   root@omega-new:~# cat /var/oms/etc/deploy.conf 
   oidc_host: omega.openmustardseed.org
   vhost_base_url: https://omega.openmustardseed.org/
   hostname: omega.openmustardseed.org
   ssl_setup: True
   oidc_base_url: https://omega.openmustardseed.org/oidc
   coreid_client_id: coreid_registry
   coreid_registration_view: modules.coreid_registration.views.CoreIDPersonaInitRegistrationView
   coreid_registration_form_class: modules.coreid_registration.forms.CoreIDRegistrationForm
   coreid_client_secret: coreid_registry


This is good.


A Manual Update
---------------

At the moment, the following updates are easier to make manually, rather than
using the VRC to apply the updates. This will change as OMS improves its support
for SSL and nginx vhosts.


Nginx Vhost Config
~~~~~~~~~~~~~~~~~~

* Edit ``/etc/nginx/sites-available/default`` to correct the ``server_name``
  parameter.
* Have Nginx test the config update to confirm the vhost config is still valid:

.. code:: bash

   root@beta-new:~# nginx -t
   nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
   nginx: configuration file /etc/nginx/nginx.conf test is successful

* Reload the Nginx configuration with ``nginx -s reload``.


Tomcat and OpenID Connect
~~~~~~~~~~~~~~~~~~~~~~~~~

* Edit ``/var/lib/tomcat7/shared/classes/oidc_config.properties`` to correct
  the ``production.configBean.issuer`` config key with the updated hostname.
  In our case, this is:
  ``production.configBean.issuer=https://omega.openmustardseed.org/oidc/``
* Open ``/etc/tomcat7/server.xml`` and look for the ``<Connector ... />``, which
  is likely to be found around line 45. Update the ``proxyName`` attribute so
  that it is in alignment with the updates we have made elsewhere. We have SSL
  setup on our host as well, so our *server.xml* looks like:

.. code:: xml

   44     <Connector port="8080"
   45                protocol="HTTP/1.1"
   46                connectionTimeout="20000"
   47                URIEncoding="UTF-8"
   48                proxyName="omega.openmustardseed.org"
   49                redirectPort="443" 
   50                proxyPort="443"
   51                scheme="https"
   52     />


* Having updated the configuration for Tomcat and OIDC, we need to restart the
  service with: ``/etc/init.d/tomcat7 restart``.


The updates are now complete!


.. Additional Details
.. ------------------
.. 
.. .. note::
.. 
..    This section (below) is a work in progress and not yet complete.
.. 
.. 
.. For the curious, here are some of the details regarding how one detail
.. influences another.
.. 
.. The hostname formula uses
.. 
.. ``grains['fqdn']``, which salt derives from the system hostname, as defined in */etc/hosts*. 
.. 
.. 
.. .. code:: bash
.. 
..    root@beta-new:~# salt-call --local grains.get fqdn
..    local:
..        beta-new
..    root@beta-new:~# salt-call --local grains.get id
..    local:
..        chiron



