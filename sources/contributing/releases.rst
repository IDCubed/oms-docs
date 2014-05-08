:title: OMS Release Process
:description: How to Build an OMS Release
:keywords: contributing, oms, documentation, release, help, guideline


.. _contribute_release:

OMS Release Process
===================

Here is the high-level process, to be run on each Git repo in the OMS release:

* The ``master`` branch is the latest stable release.
* During each sprint, developers hack on topic/feature branches based off of
  ``qa-develop``.
* At the end of each sprint, we cut a release candidate branch. This is then
  run through QA.
* When QA is complete, we merge the release candidate to ``master`` and create
  a new tag for the version released.
* If there were updates to the release candidate after branching off ``qa-develop``
  we merge these in to sync the development branch.


Repositories
------------

The following repositories are part of the release:

* oms-admin
* oms-core
* oms-deploy
* oms-docs
* oms-experimental
* oms-kickstart
* oms-oidc
* oms-salt-core
* oms-salt-tcf
* oms-ui
* python-oidc


Cut Release Candidate
---------------------

For each repository in the release, we run:

* Update the local copy to ensure we have the latest HEAD: ``git fetch --all -p``
* Delete local copy of ``qa-develop`` branch, checkout clean from remote: ``git
  branch -D qa-develop && git checkout qa-develop``
* Double-check that the version is correct in ``setup.py`` or module
  ``__init__.py``
* Create a new branch for the release candidate. For example: ``v0.X.Y-rc``: ``git
  checkout -b v0.X.Y-rc``
* Push that new branch out to GitHub: ``git push origin v0.X.Y-rc``


Generate a GPG key
------------------

We'll be using GPG to sign our (annotated) Git tags as well as the release file
itself. If you don't already have a GPG key, you can create one as follows:

.. code::

  # gpg --gen-key
  gpg (GnuPG) 1.4.11; Copyright (C) 2010 Free Software Foundation, Inc.
  This is free software: you are free to change and redistribute it.
  There is NO WARRANTY, to the extent permitted by law.

  gpg: directory `/root/.gnupg' created
  gpg: new configuration file `/root/.gnupg/gpg.conf' created
  gpg: WARNING: options in `/root/.gnupg/gpg.conf' are not yet active during this run
  gpg: keyring `/root/.gnupg/secring.gpg' created
  gpg: keyring `/root/.gnupg/pubring.gpg' created
  Please select what kind of key you want:
     (1) RSA and RSA (default)
     (2) DSA and Elgamal
     (3) DSA (sign only)
     (4) RSA (sign only)
  Your selection? 
  RSA keys may be between 1024 and 4096 bits long.
  What keysize do you want? (2048) 4096
  Requested keysize is 4096 bits
  Please specify how long the key should be valid.
           0 = key does not expire
        <n>  = key expires in n days
        <n>w = key expires in n weeks
        <n>m = key expires in n months
        <n>y = key expires in n years
  Key is valid for? (0) 
  Key does not expire at all
  Is this correct? (y/N) y

  You need a user ID to identify your key; the software constructs the user ID
  from the Real Name, Comment and Email Address in this form:
      "Heinrich Heine (Der Dichter) <heinrichh@duesseldorf.de>"

  Real name: John Doe
  Email address: john@example.com
  Comment: GitHub
  You selected this USER-ID:
      "John Doe (GitHub) <john@example.com>"

  Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
  You need a Passphrase to protect your secret key.

  We need to generate a lot of random bytes. It is a good idea to perform
  some other action (type on the keyboard, move the mouse, utilize the
  disks) during the prime generation; this gives the random number
  generator a better chance to gain enough entropy.

  Not enough random bytes available.  Please do some other work to give
  the OS a chance to collect more entropy! (Need 284 more bytes)
  .................+++++
  .........+++++
  We need to generate a lot of random bytes. It is a good idea to perform
  some other action (type on the keyboard, move the mouse, utilize the
  disks) during the prime generation; this gives the random number
  generator a better chance to gain enough entropy.
  ...............+++++

  Not enough random bytes available.  Please do some other work to give
  the OS a chance to collect more entropy! (Need 230 more bytes)
  ......+++++
  gpg: /root/.gnupg/trustdb.gpg: trustdb created
  gpg: key 278D47D8 marked as ultimately trusted
  public and secret key created and signed.

  gpg: checking the trustdb
  gpg: 3 marginal(s) needed, 1 complete(s) needed, PGP trust model
  gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
  pub   4096R/278D47D8 2014-04-29
        Key fingerprint = C19F 4DAE 07AB 5BE9 D21A  05C7 038D 89B1 278D 47D8
  uid                  John Doe (GitHub) <john@example.com>
  sub   4096R/EB2EB392 2014-04-29


.. note::

   To export a public key to share with others, use GPG's ``--armor``, and
   ``--export`` parameters. For example, ``gpg --export --armor``.


Cut Release
-----------

* Checkout and merge to ``master``: ``git checkout master && git merge v0.X.Y-rc``
* Update the commit message, because merge commits have terrible commit messages:
  ``git commit --amend`` - use the form: *Merge v0.X.Y to master*
* Create a tag: ``git tag -s -m "$repo v0.X.Y" v0.X.Y -u john@example.com``.
  Note that the email address specified tells Git which GPG key to use when
  signing the release.
* Update GitHub: ``git push origin master && git push --tags origin``


Build a Demo VM
---------------

Follow the :ref:`VM Builder's Guide <vm_builders_guide>` to create a VirtualBox
image with Packer. The config for OMS Kickstart is already pointed at
``master``, so it should build and there ought to be no problem.

Create an importable appliance after running OMS Kickstart, this is the development
environment for this release.

:ref:`Deploy a Private TCC <deploy_private_tcc>` and then :ref:`Deploy the GPS
Demo TAB <gps_demo>`, and finally :ref:`the Perguntus Demo <perguntus_demo>`.
Create another importable appliance, this is the Demo VM for the release.

The appliance name should follow the ``OMS-SDK-v0.X.Y-YYYYMMDD.ova`` format.
For example, ``OMS-SDK-v0.8.5-20140429.ova``.


Signed Releases
---------------

All Open Mustard Seed releases are signed and encrypted.

To sign the release with your key and encrypt it with a passphrase:

.. code::

  $ gpg --sign --symmetric --output OMS-SDK-v0.8.5-20140429.ova.gpg OMS-SDK-v0.8.5-20140429.ova


You will be prompted to enter a passphrase.


Importing the Release Signing Key
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To verify the authenticity of the OMS release and source code, we recommend
importing and reviewing the Release Signing Key into your GPG keyring.

For releases before v0.8.5, import the following public key:

.. code::

   % wget -O - https://docs.openmustardseed.org/_static/oms-rsk.gpg | gpg --import -


For releases starting with v0.8.5, import the following public key:

.. code::

   % wget -O - https://docs.openmustardseed.org/_static/oms-rsk-from-v0_8_5.gpg | gpg --import -


You should then be able to list the key, having imported it into your keyring.
For example:

.. code::

   % gpg --list-keys
   /home/oms/.gnupg/pubring.gpg
   ----------------------------
   
   pub   4096R/E6C622FB 2013-09-19 [expires: 2014-09-19]
   uid                  IDCubed (Release Signing Key) <patrick@idcubed.org>
   sub   4096R/03C510CB 2013-09-19 [expires: 2014-09-19]


Uploading the Release to the Rackspace CDN
------------------------------------------

The OMS release is hosted from Cloud Files, Rackspace's content delivery
network (CDN), which guarantees high availability and download speed for this
very large file.

For Windows and Mac users, Rackspace recommends using a client called Cyberduck
( http://cyberduck.io/ ) for working with Cloud Files.

To connect to Cloud Files with Cyberduck:

#. Click "Open Connection".
#. Select "Rackspace Cloud Files (US)" as the connection type in the dropdown.
#. Enter your username in the "Username" field and your API key in the
   "Password" field.  You can find your API key in in the "Login Details" section
   of the "Account Settings" page in Rackspace.
#. Click the "Connect" button.
#. After the connection is established, drag the release file icon into the
   "Releases" folder (Cloud Files container). A "Transfer" dialog will pop up to
   track the upload.
