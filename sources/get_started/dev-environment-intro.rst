:title: Introduction to the Development Environment
:description: How to install and configure your OMS development environment.
:keywords: OMS, developers, dev environment, 

###########################################
Introduction to the Development Environment
###########################################



This tutorial helps you set up an OMS development environment. It has been tested on Debian Linux x64 and Windows 7. Do not use it for production purposes. Here is info on :ref:`Setting Up a Production Environment`.

*****************
Assumed Knowledge
*****************
* **Editing** Simple editing with a Linux command line-accessible text editor like Vim or Nano
* **SSH** How to ``ssh`` into another server on Mac, Linux, (and Windows via Cygwin, or Git bash if you have Git installed).

***********
VM Contents
***********

**Services**

* Python
* Django
* Node.js
* Ruby
* uWSGI
* Nginx
* PostgreSQL
* MongoDB
* SaltStack
* Git

**A Private Trusted Compute Cell, containing:**

* A Private Registry to store your identity
* An Open ID Connect module for authorization/authentication
* Two example Trusted Application Bundles, Perguntus and GPS Demo
* Repositories:
    * oms-admin
    * oms-deploy
    * oms-core
    * oms-experimental


************************************
Get Started - Download Prerequisites
************************************
 * VirtualBox_
 * GnuPG_
 * `Development Environment VM Image`_ (size 2GB)

.. _VirtualBox: https://www.virtualbox.org/wiki/Downloads
.. _GnuPG: http://www.gnupg.org/download/#auto-ref-3
.. _Development Environment VM Image: http://cc2ccf5e7eb9a36051d5-392f3ef49dd2dccea95976ef735392f9.r21.cf1.rackcdn.com/OMS-SDK-v0.8.1-20130930.ova.gpg


***********************
Configure Prerequisites
***********************

 1. `Install VirtualBox`_
 2. Install GPG
   * `windows`_
   * **`linux link?`_**
 3. Decrypt the Development Environment VM Image (Leave passphrase blank. Expect 10 minutes.)
   * windows: Right click on <vm_file_name>.gpg and select "Decrypt and Verify" (leave passphrase blank)
   * linux: ``gpg --decrypt --output <vm_file_name>.gpg``
 4. Install VM Image
   * Open ``<vm_file_name>.ova`` then click "import" in the GUI that appears.

.. _Install VirtualBox: https://www.virtualbox.org/manual/UserManual.html
.. _windows: http://gpg4win.de/handbuecher/novices_5.html
.. _linux link?: http://example.com

**************************
Configure and Start the VM
**************************

#. In the VirtualBox Manager GUI, Click "settings" > "Network" > and select "Attached To: Bridge Adapter", then click OK. This gives the VM its own address on your local network after starting. (You're welcome to use NAT, but this tutorial does not cover it.)
#. Click the green "Start" arrow. A window named "OMS [Running]" should open .
#. Wait a minute or two until you see "dev login:".  Enter "oms" for user and password.
#. Type ```ifconfig``` and note the IP from line 2 "inet:"
#. In your ssh client, type ``ssh@<ip-address-from-above>``, and log in with oms/oms
#. Edit ``/var/oms/python/private_registry/django_project/django_project/settings.py``. Replace ``STREAM_URL: https://registry.idhypercubed.org`` with ``http://<ip-address-from-above>``.
#. Save settings.py
#. Type ``touch /etc/uwsgi/apps-enabled/private_registry.ini`` to restart the private registry.
#. Edit ``/var/oms/python/PerguntusUI/django_project/django_project/settings.py`` with your favorite editor. In the the ``STREAM_URL`` key, replace replace ``https://registry.idhypercubed.org`` with ``http://<ip-address-from-above>``.
#. Save settings.py
#. Type ``touch /etc/uwsgi/apps-enabled/PerguntusUI.ini`` to restart PerguntusUI (we'll configure it now, but use it in another tutorial).
#. Create your Github public/private key with ``ssh-keygen``, and hit enter through all the prompts.
#. Finally, get your Github key with ``cat /home/oms/.ssh/id_rsa.pub``, then add the key at https://github.com/settings/ssh.

..
    9 out of the 13 steps can be automated.
    
    #. Type ``oms-dev-config``.  It should display your VM's IP address and a public key for Github.  Remember your IP address. You'll need it for other things.
    #. Copy and paste your public key as a new key at https://github.com/settings/ssh.

    oms-dev-config script automates many steps that required developers to edit files and run various shell commands before they could get started.  To summarize, it should:

    1. parse the IP from ifconfig
    2. Replace STREAM_URL key in /var/oms/python/private_registry/django_project/django_project/settings.py with the IP address
    3. Restart the Private Registry
    4. Create the public and private keys with ssh-keygen
    5. Echo:
    ``
    "IP: 192.xxxx"
    
    Public Key for copying and pasting into Github:
    (Display public key here)
    ``

    It should throw an error message if the IP does not start with 192.xxxx, indicating 'Incorrect VirtualBox Network Setting: Please close the VM, open its settings, go to "network", and select "bridged adapter".'


***************************
Configure Your Digital Self
***************************

**(Do devs need to do these?  Please remove this section if not.)**

:ref:`How to configure your Core Identity`

:ref:`How to configure your Personas`

In your browser, visit ``http://<your-ip-address-here>/private_registry/``.  **TODO: From here, I don't know what to do.  The instructions on the page are unclear.  After a minute or so, I get redirected to an error page without warning. (http://<ip-address>:9999/idoic/authorize?...)**


*******************************************************************************
Test your setup: Running the Example Applications (Trusted Application Bundles)
*******************************************************************************

:ref:`Starting, Running, and Stopping the Perguntus Demo TAB`

:ref:`Starting, Running, and Stopping the GPS Demo TAB, including FunF`

********************
Dev Environment FAQs
********************

**Can I use SSL?** The VM does not support SSL at this time.

**Can I use NAT for networking?** Not yet.  Though VirtualBox supports it, there are various files to change in the Demo Trusted Application Bundles.  If you need this, we can walk you through it.  Ping us on our IRC channel.


*****************************************
Links to Related Tutorials and Resources
*****************************************


**Tutorials**

:ref:`Editing dev environment files locally`

:ref:`Creating an OMS TAB from scratch`

:ref:`Creating an OMS TAB using Django`

:ref:`Converting an existing Django app to OMS`

:ref:`Recreating the Perguntus demo from scratch`

:ref:`Recreating the GPS Demo from scratch`

:ref:`Starting, Running, and Stopping OMS TABs`

**Design Guides**

:ref:`TAB directory and file organization`


.. The hackathon documentation that will take the developer through tutorials that will start them with a simple Python hello world, a django hello world, and finally converting that django hello world into an OMS app
   
.. The hackathon documentation that will take the developer on a tutorial through each of the major features of the demo and explains in detail how it works and what the developer had to do in order to create that functionality. The idea is that after the set of tutorials, the developer will understand everything that the demo does and be able to recreate the same functionality in a novel app by only using the reference documentation and the tutorials (no additional hand holding). Basically this set of tutorials should start with the OMS hello world app and add Perguntus functionality one step at a time, walking the developer through, possibly referencing inline code line by line. For instance, start with OMS hello world what would a developer typically do if they wanted to add a "sharing level slider" to a UI that changes the evaluation of a backend FACT API ruleset (this tutorial would include instructions on how create the API from scratch on the backend as well, or refer to a previous tutorial).