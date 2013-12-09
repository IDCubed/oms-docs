:title: OMS Release Process
:description: How to Build an OMS Release
:keywords: contributing, oms, documentation, release, help, guideline


.. _contribute_release:

OMS Release Process
===================

Here is the high-level process, to be run on each git repo in the OMS release:

* The ``master`` branch is the latest stable release.
* During each sprint, developers hack on topic/feature branches based off of
  ``qa-develop``.
* At the end of each sprint, we cut a Release Candidate branch. This is then
  run through QA.
* when QA is complete, we merge the Release Candidate to ``master`` and create
  a new tag for the version released. Tags are signed with the IDCubed release
  signing key.
* If there were updates to the Release Candidate after branching off ``qa-develop``
  we merge these in to sync the development branch.


Cut Release Candidate
---------------------

For each repository in the release, we run:

* update the local copy to ensure we have the latest HEAD: ``git fetch --all -p``
* delete local copy of ``qa-develop`` branch, checkout clean from remote: ``git
  branch -D qa-develop && git checkout qa-develop``
* double check that the version is correct in setup.py or module init
* create a new branch for the release candidate. example: ``v0.8.3-rc``: ``git
  checkout -b v0.8.3-rc``
* push that new branch out to github: ``git push origin v0.8.3-rc``


Cut Release
-----------

* Checkout and merge to master: ``git checkout master && git merge v0.X.Y-RC``
* Update the commit message, because merge commits have terrible commit messages:
  ``git commit --amend`` - use the form: *merge v0.8.3 to master*
* Create a tag: ``git tag -s -m "$repo v0.8.3" v0.8.3 -u releases@idcubed.org``.
  Note that the email address specified tells git which gpg key to use when
  signing the release.
* Update github: ``git push origin master && git push --tags origin``


Build a Demo VM
---------------

Follow the :ref:`VM Builder's Guide <vm_builders_guide>` to create a VirtualBox
image with packer. The config for OMS Kickstart is already pointed at master, so
it should build and there ought to be no problem.

Create an importable appliance after running OMS Kickstart, this is the development
environment for this release.

:ref:`Deploy a Private TCC <deploy_private_tcc>` and then :ref:`Deploy the GPS
Demo TAB <gps_demo>`, and finally :ref:`the Perguntus Demo <perguntus_demo>`.
Create another importable applicance, this is the Demo VM for the release.
