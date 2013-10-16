:title: Initial OMS Deployment
:description: How to take your first steps with OMS deployment 
:keywords: OMS, deployment, developers, dev environment

.. _oms_deployment:

Initial Deployment
==================

Getting started is easy, you'll need a new/clean host running Ubuntu 12.04 LTS.
This can be either a VM running locally, or in the cloud, or even a *bare metal*
server.


Run OMS-Kickstart
-----------------

OMS appreciates automation, but does not want this to limit flexibility or an
ability to change the details. Thus, we have written the oms-kickstart utility
to make the deployment process as simple and painless as possible (along with
all of the advanced automation this utility will *kickstart* for you).


Get the script
~~~~~~~~~~~~~~

You will then want to get a copy of `the kickstart script`_ and `the external
config`_ to the OMS host you are deploying to. The git repos are currently
private, so you will need to login to github. It is also easiest to copy the
files if you view them in their *raw* state, which you can do through the github
UI (using button in the top right of the page).

.. _the kickstart script: https://github.com/IDCubed/oms-kickstart/blob/qa-develop/kickstart-oms.py
.. _the external config: https://github.com/IDCubed/oms-kickstart/blob/qa-develop/example.yaml

Create an SSH Key
~~~~~~~~~~~~~~~~~

Create an ssh key with ``ssh-keygen``, saved to ``~/.ssh/id_rsa``, and do not
use a passphrase for the key. A future release of OMS will allow you to do so -
at present, a passphrase will prevent OMS' automation from working properly.

Add the public key to your github account, you can view the key with: ``cat
~/.ssh/id_rsa.pub``. To add the key to your account, navigate to ``Account
Settings`` in the Github web UI and then ``SSH Keys`` in the navigation bar on
the lefthand side.

With the public key in Github, OMS will be able to checkout its code on your
behalf, and we are now ready to run the kickstart script.


Run the Script
~~~~~~~~~~~~~~

Given the details of how SSH and long-running processes work, it is best to run
the kickstart from within an instance of tmux, so first start tmux with:
``tmux``. A full tmux tutorial is beyond the scope of this document, but here
are a few helpful details:

* If you lose your connection to the VM, you can simply login again and run
  ``tmux att``.
* Commands are prefixed with a modifier, ``Ctrl-b`` by default.
* You can separate from a running instance, to reattach later, with:
  ``Ctrl-b,d``.
* Create a new window with ``Ctrl-b,c`` (*create*), and switch between with
  ``p``, ``n``, and ``l``, for *previous*, *next* and *last*, respectively.
* Exit tmux by closing all open windows (exit the shell with ``exit``).


With tmux open, run the script with: ``python kickstart-oms.py -H -c
example.yaml``

You are now good to go grab a fresh beverage and/or entertain yourself for 10
minutes or so. Once complete, the VM ought to be completely setup and ready for
either additional webapp deployments or for you to start hacking away!


What has this just done?
~~~~~~~~~~~~~~~~~~~~~~~~

The kickstart script has:

* installed the salt-minion package and its dependencies
* configured salt-minion to run in *masterless* mode (eg local, no master)
* used salt-minion to apply a set of base states, installing git and running
  through some basic *first steps*. EG: cloning the oms-deploy git repo, copied
  the salt states from oms-deploy and salt pillar config from this repo to the
  host and re-synced the salt-minion service to be up-to-date.
* used salt-minion and the states/pillar from oms-deploy to run the salt module
  ``state.highstate`` to provision the host with all of the services, packages,
  configuration, and fluff that is needed on an OMS host.
* and finally, used the ``oms.admin`` salt state to wrap up some last-minute
  details, such as cloning the entire OMS source code to ``/var/oms/src/`` and
  installing both the oms-deploy and oms-admin python pacakge.

.. todo::

    All git repositories have been checked out with the ``qa-develop`` branch,
    and you may need to update the active revision depending on what you need
    to do.

At this point, you have *everything* needed to either hack on OMS code, or to
deploy additional OMS components.


Domain and SSL Setup
--------------------

While the details of these steps may vary slightly depending on your environment
(eg, running OMS in the cloud versus in a local virtualbox VM), let's take one
final step before deploying additional OMS components.

If running OMS in the cloud, it is best to setup hosts running OMS with both a
domain and an SSL certificate, and if running multiple hosts, a wildcard SSL
certificate in particular.

You will want to update ``/etc/nginx/sites-available/default`` to correct the
domain (replace ``localhost`` with your domain, eg: ``host.domain.tld``), as
well as the SSL configuration. Once complete, the vhost config ought to include
the following, replacing ``HOST.DOMAIN.TLD`` with the value for your domain:

.. code::

   server {

       listen  443 default ssl;
       listen  80;

       ssl_certificate      /etc/nginx/ssl/DOMAIN.TLD.crt;
       ssl_certificate_key  /etc/nginx/ssl/DOMAIN.TLD.key;

       ssl_ciphers RC4:HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 10m;

       server_name  HOST.DOMAIN.TLD;

       root /var/www/default/;
       index  index.html;

       include /etc/nginx/proxy.conf;

       if ($ssl_protocol = "") {
           rewrite ^ https://$server_name$request_uri? permanent;
       }

       include /etc/nginx/conf.d/default/*.location;

       #* This will deny access to any hidden file (beginning with a .period)
       location ~ /\. { deny  all; }

   }


Alternatively, if the SSL certificate configuration included above does not
match the files you have on hand, the following may be simpler for the format
of the certificates you have:

.. code::

   server {

       ...

       ssl_certificate /etc/ssl/DOMAIN_TLD/chained_ca.crt;
       ssl_certificate_key /etc/ssl/DOMAIN_TLD/server.pem;
       ssl_client_certificate /etc/ssl/DOMAIN_TLD/ca.crt;

       ...
   }


After updating, test the changes with ``nginx -t``, and if nginx confirms the
updates are acceptable, reload the nginx config with ``nginx -s reload``.

You will also need to open the SSL port in the firewall: ``ufw allow 443``.


Where to go from here?
----------------------

The answer will depend on what you wish to do with OMS.

If you simply want a development environment, you've got what you need to start
hacking, and you ought to jump over to the :ref:`OMS Tutorials <tutorials>`. If
you plan to hack on a specific OMS component, such as the OMS Portal or Private
Trusted Compute Cell (Registry), or Virtual Resource Controller, use the direct
links listed below.

The :ref:`OMS Private Trusted Compute Cell (TCC) <deploy_private_tcc>` is
intended for individual use, where as the :ref:`OMS Portal Registry
<deploy_portal>` is intended for organizations looking to provide Private TCCs
to other users.

.. In general, the best place to start is with the :ref:`OMS Virtual Resource
.. Controller (VRC) <deploy_vrc>` - this is a generic component that can be used to
.. deploy and maintain nearly any host/app from new VMs to additional OMS apps on
.. those VMs. The VRC can even be used to deploy an entire :ref:`Trust Network
.. <trust_network>`.

.. There are different types of Trusted Compute Cell (TCC) for different purposes.
.. If you already have a VRC, you could also start with either the :ref:`OMS Portal
.. Registry <deploy_portal>`, or :ref:`OMS Private Registry <deploy_private_tcc>`.


Customizing OMS-Kickstart
-------------------------

The kickstart script is very flexible and will allow you to customize the salt
states that are used to control the state of the OMS host you are provisioning
and bootstrapping with OMS.

Details of how to do this are included in `the OMS-Kickstart README`_

.. _the OMS-Kickstart README: https://github.com/IDCubed/oms-kickstart/blob/qa-develop/README.rst

