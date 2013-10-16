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

Run the script with: ``python kickstart-oms.py -H -c example.yaml``

Now, go grab a fresh beverage and/or entertain yourself for 10 minutes or so.
Once complete, the VM ought to be completely setup and ready for either
additional webapp deployments or for you to start hacking away!


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

At this point, you have *everything* needed to either hack on OMS code, or to
deploy more OMS.


Where to go from here?
----------------------

The answer will depend on what you wish to do with OMS.

If you simply want a development environment, you've got what you need to start
hacking, and you ought to jump over to the :ref:`OMS Tutorials <tutorials>`. If
you plan to hack on a specific OMS component, such as the OMS Portal or Private
Trusted Compute Cell (Registry), or Virtual Resource Controller, use the direct
links listed below.

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

