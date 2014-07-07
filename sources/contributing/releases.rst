:title: OMS Release Process
:description: How to Build an OMS Release
:keywords: contributing, oms, documentation, release, help, guideline


.. _contribute_release:

OMS Release Process
===================

This document details the process OMS developers work through when making a new
release. This is generally completed after a sprint, but the process also
applies to any security or other types of critical updates. The goal of this
document is to provide all of the information required to understand and follow
the process in order to create a new release. In some cases we will link to
other documents where additional information may be found.


Overview
--------

Here is an overview of the process we run through:

#. Ensure you have met each of the prerequisites.
#. Review and decide on the repositories to be included in the release.
#. Create a temporary working directory to clone (fresh) copies of the repos to
   process (optional).
#. Create an RC branch for each repository in the release.
#. Some repositories have specific updates to be made, such as bumping versions.
#. Build and review the updated documentation.
#. Run through QA on each repository, individually.
#. Run through QA on the TCF/TCC/TAB system as a whole.
#. Use oms-kickstart to test building a VM image with VirtualBox.
#. Once QA is confirmed complete, merge the release to the *master* branch, for
   each repository in the release.
#. Create and sign a tag, with the release version, using an accepted GPG key.
#. With the repositories updated, build and upload all artifacts (VM Images, Java
   WARs, packages, etc), including the updated documentation.
#. Clean up Redmine (update status, resolve, shuffle tickets around, etc), and
   Git repositories (remove RC branch, etc).


Prerequisites
-------------

To complete the entire release process, ensure you have met the following
prerequisites. Here is a high-level review, with more details in sections
below:

#. Write access to the OMS repositories.
#. A system capable of building and running VirtualBox VMs.
#. Write access to OMS Rackspace Cloud Files.
#. A GPG key approved for use in signing OMS releases and build artifacts.
#. Review/confirm the repositories to apply the release process to.
#. Set up release manifest for automated formula (optional).

If you do not have sufficient access to the resources needed to complete the
release, please seek the assistance of the OMS management team.


1) Access to the Repositories
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When running through the OMS release process on a set of repositories, the
manipulations can be applied by an operator (completely manual) or with the aid
of an automated process. If using the automated tooling, you will need an SSH
key in */root/.ssh/id_rsa*, and ensure it has access to the Git repositories the
process is applied to. It is possible to apply the updates without the aid of
this release formula, and in this case you should ensure the SSH key for the
user running the Git manipulations has sufficient access to the Git
repositories.

.. todo:: reference a tutorial on creating and managing SSH keys.


2) Able to Build VM
~~~~~~~~~~~~~~~~~~~

Most reasonably powered laptops and desktops have the resources to build VMs.
Consult the :ref:`Intro to VirtualBox <install_virtualbox>` to get started
with this subsystem. It is important to ensure the system used to build VM
has **virtualization support enabled in the BIOS**.

You will need to use oms-kickstart_ to build the VM, but we've got the details
bundled up in an easy-to-follow tutorial that details the :ref:`VM build process
<vm_builders_guide>`.

.. _oms-kickstart: https://github.com/IDCubed/oms-kickstart/tree/master/README.rst


3) Write Access to Rackspace CDN
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Using either Cyberduck, a swift client, or cURL, OMS hosts build artifacts on
the Rackspace CDN. You will need to push files to one or more containers on the
CDN, and flag the files for public consumption. Ensure you have the access
needed to do this.


4) Access to the OMS GPG Key
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

All artifacts built for the release, such as Java WAR files, and importable VM
images, are signed with the OMS Developer GPG key. Ensure you have access to a
GPG key approved for use in signing official OMS releases. Please see
:ref:`Signing Release Artifacts with GPG <gpg-signing>` for more details.

Reviewing what to include in the release process (5) and creating a manifest for
the automated release formula (6) are detailed in the following sections.


Review the List of Repositories
-------------------------------

Before you can run through the release process, you first need to review and
decide on the repositories to be included in the release - not all OMS source
code under development is to be included in the release, and not all
repositories get a version bump with each new release.

See below for a list of repositories currently included in the OMS release, as
well as the criteria we use to evaluate whether a repository needs to be run
through the RC process. All repositories included in the OMS release are tested
with each release, not all repositories will need a version bump or an RC branch.

It is also important to review active development to determine if a new
repository is ready to be flagged for inclusion in the official release. If you
believe a repository should be included, consult with OMS development advisors
to have the repository (and its GitHub permissions) reviewed.

Adding a new repository may require updates to the default configuration included
in the :github-repo:`oms-salt-core <oms-salt-core>` source code. If the list of
repositories with Sphinx documentation projects changes, the list can be found
`here`_, in oms-docs. See :ref:`this section <update_doc_builder>` for more
details on this list.

.. _here: https://github.com/IDCubed/oms-docs/blob/master/conf/config-gen.py


What Source Code is included in OMS?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Please see the :ref:`OMS Source Code Map <oms_source_code_map>` for details
about the list of repositories currently included in the official Open Mustard
Seed release. Note that additional repositories may be added in future releases.


When to run a Repo through RC
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Each of these repositories should be evaluated with each new release
going through the QA/RC process, does the repository need a version bump?

In short, a repository needs to be run through the RC process if there were
commits/updates merged to the *qa-develop* branch.

.. note::

   Is this evaluation correct (and sufficient)?


Configure Release Formula
-------------------------

The instructions included throughout this document detail the set of commands
needed to complete the manipulations of the Git repositories. While generally
pretty simple to execute, it is a tedious process to run through manually,
especially when there are a dozen or more repositories to apply the process to.

To make this easier and faster, OMS includes a set of system automation formula
that focuses on each of the manipulations made to the Git repositories during a
release. Using this formula is optional, as it is still possible to run through
the release process executing the steps manually.

If you would like to use the formula, this section will ensure the system is
set up to help process the release.

.. note::

   The release formula included in OMS is best run on a host set up and running
   the OMS VRC. The OMS basic Root VRC (development base) is all that is needed.


.. todo::

   Update the note above to reference a document in oms-salt-core that describes
   the what and how about this development base noted above.


oms-release.yml
~~~~~~~~~~~~~~~

Open up ``/etc/salt/states/classes/oms-release.yml``. You will want a manifest
similar to the following. We will use the v0.8.5.2 release manifest as an
example:

.. code-block:: yaml

   parameters:
     release:
       # the tag to use for the release, should be in the form: 'vX.Y.Z'
       tag: v0.8.5.2
       # the message to use with the Git commit when merging the release
       commit_message: t2568: merge v0.8.5.2 to master
       # the user/email id of the GPG User to use for signing the release
       gpg_user: oms-dev@idcubed.org
       # the base URL (for Git) to use when building the RC branch URL list
       # (using the formula's doc helpers)
       base_git_url: https://github.com/IDCubed
       # the name of the RC branch to create for the release
       rc_branch: v0.8.5.2-rc
       # the branch to base the RC branch off of
       base_branch: qa-develop
       # the branch to merge the RC branch to for the release
       merge_to: master
       # the Git remote to push the release (merge and tags) to
       remote: origin
       # the path to the directory to store all Git repos in while creating the release
       # omit any trailing slash -  when used, it is assumed not present.
       work_dir: /var/oms/release
       # the list of repositories to operate on and manage
       repos:
         oms-oidc: 'git@github.com:IDCubed/oms-oidc.git'
         oms-admin: 'git@github.com:IDCubed/oms-admin.git'
         oms-core: 'git@github.com:IDCubed/oms-core.git'
         oms-deploy: 'git@github.com:IDCubed/oms-deploy.git'
         oms-docs: 'git@github.com:IDCubed/oms-docs.git'
         oms-experimental: 'git@github.com:IDCubed/oms-experimental.git'
         oms-kickstart: 'git@github.com:IDCubed/oms-kickstart.git'
         oms-salt-core: 'git@github.com:IDCubed/oms-salt-core.git'
         oms-salt-tcf: 'git@github.com:IDCubed/oms-salt-tcf.git'
         oms-ui: 'git@github.com:IDCubed/oms-ui.git'
         Python-oidc: 'git@github.com:IDCubed/python-oidc.git'


.. note::

   Update the list of Git repositories defined in the release manifest - this is
   the list of repositories the automated release formula will be applied to, and
   should match the results from the source code review.


Update the Root VRC
~~~~~~~~~~~~~~~~~~~

The ``oms-release.yml`` reclass manifest has been updated with the specific
details of the release you are working to process - we now need to ensure it is
included in the Root VRC's node definition for this host.

Open ``/etc/salt/pillar/bootstrap.sls`` for editing, you will see something
similar to the following (your list of classes will likely differ):

.. code-block:: yaml

   base_packages: [build-essential, tmux, vim, git, htop, wget, curl, Python-setuptools]
   reclass:
     localhost:
       classes: [oms-admin]
       parameters:
         oms:
           deploy_defaults: {hostname: oms-dev}
           version: v0.8.5.1


Update the list of classes specified to include the ``oms-release.yml`` reclass
manifest we just created/updated:

.. code-block:: yaml

   base_packages: [build-essential, tmux, vim, git, htop, wget, curl, Python-setuptools]
   reclass:
     localhost:
       classes: [oms-admin, oms-release]
       parameters:
         oms:
           deploy_defaults: {hostname: oms-dev}
           version: v0.8.5.1


Finally, ask the VRC to update its node and tops definitions for the host:

.. code::

   # salt-call --local state.sls reclass.update_tops test=True


This will ask Salt to review and tell us about the updates to be made, but will
not make any changes. You ought to see Salt wanting to add the ``oms-release``
class to the node definition for this host, eg:

.. code::

   ----------
       State: - file
       Name:      /etc/salt/states/nodes/oms-dev.yml
       Function:  managed
           Result:    None
           Comment:   The following values are set to be changed:
   diff: ---
   +++
   @@ -1,8 +1,6 @@
    classes:
      - base
      - oms-admin
   +  - oms-release
    parameters:
      oms: {'deploy_defaults': {'hostname': 'oms-dev'}, 'version': 'v0.8.5.1'}


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


Great! Let's apply these updates by re-running the last command (dropping the
``test=True``):

.. code::

   # salt-call --local state.sls reclass.update_tops

The output should confirm the details of the update. With this update in place,
any changes you make to the *oms-release.yml* reclass definition (manifest) will
be immediately available to any formula applied with SaltStack - you do not need
to re-apply the process above after updating the *oms-release* manifest.


Cut the Release Candidate
-------------------------

With our prerequisites met, the list of repositories to process confirmed, and
(optionally) the VRC updated to help us apply the release process on the source
code, we can now start manipulating Git!

.. note::

   We will first detail the manual process, skip ahead for the details on how to
   use the automated formula.


Clone Fresh
~~~~~~~~~~~

While not required, it's often easier to run the release process on a clean
working directory, completely separate from any active development you may be
involved in.

Create a working directory and clone each repository:

.. code::

   # mkdir /var/oms/release
   # git clone git@github.com:IDCubed/<repo>/

Repeat the Git clone for each repository in the release, replacing *<repo>* with
the name of the OMS repository (or completely replacing the Git URL). If the
*/var/oms/release/* directory already exists, either rename or remove it.


Use Existing Repositories
~~~~~~~~~~~~~~~~~~~~~~~~~

Alternatively, if you would prefer to use a set of existing repositories, you
can iterate over going into the root of each repository and fetching the latest
HEAD with: ``git fetch --all -p``.


Create the Release Candidate Branch
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To create the Release Candidate (RC) branch, we run the following commands on
each repository in the release:

* Delete local copy of *qa-develop* branch, checkout clean from remote: ``git
  branch -D qa-develop && git checkout qa-develop``
* Double-check that the version is correct in ``setup.py`` or module
  ``__init__.py``
* Create a new branch for the release candidate. For example: ``v0.X.Y-rc``: ``git
  checkout -b v0.X.Y-rc``
* Push that new branch out to GitHub: ``git push origin v0.X.Y-rc``

The above is the manual process to create the RC branch.


Automate Creating the RC Branch
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With the release manifest configured and in place, and the VRC updated, we can
use the VRC to

* clone new copies,
* checkout clean *qa-develop*,
* create the RC branch,
* and push the new branch out to GitHub.

Yes, everything from above, in one fell swoop. Let's confirm the updates before
we actually apply them:

.. code::

   # salt-call --local state.sls oms.release.create_rc test=True

   local:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-salt-tcf.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-salt-tcf.git is about to be cloned to /var/oms/release/oms-salt-tcf/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-core.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-core.git is about to be cloned to /var/oms/release/oms-core/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-kickstart.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-kickstart.git is about to be cloned to /var/oms/release/oms-kickstart/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-experimental.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-experimental.git is about to be cloned to /var/oms/release/oms-experimental/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-deploy.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-deploy.git is about to be cloned to /var/oms/release/oms-deploy/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-ui.git


       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-ui.git is about to be cloned to /var/oms/release/oms-ui/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-oidc.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-oidc.git is about to be cloned to /var/oms/release/oms-oidc/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-admin.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-admin.git is about to be cloned to /var/oms/release/oms-admin/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-docs.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-docs.git is about to be cloned to /var/oms/release/oms-docs/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/Python-oidc.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/Python-oidc.git is about to be cloned to /var/oms/release/python-oidc/
           Changes:
   ----------
       State: - git
       Name:      git@github.com:IDCubed/oms-salt-core.git
       Function:  latest
           Result:    None
           Comment:   Repository git@github.com:IDCubed/oms-salt-core.git is about to be cloned to /var/oms/release/oms-salt-core/
           Changes:
   ----------
       State: - module
       Name:      git.checkout
       Function:  run
           Result:    None
           Comment:   Module function git.checkout is set to execute
           Changes:
   ----------
       State: - module
       Name:      git.checkout
       Function:  run
           Result:    None
           Comment:   Module function git.checkout is set to execute
           Changes:

   ....

   Summary
   -------------
   Succeeded:  0
   Failed:     0
   Not Run:   35
   -------------
   Total:     35


If something fails, such as this:

.. code::

   ...
   ----------
       State: - module
       Name:      git.push
       Function:  run
           Result:    False
           Comment:   Module function git.push threw an exception
           Changes:

   Summary
   -------------
   Succeeded: 21
   Failed:    14
   -------------
   Total:     35


... ensure that root's SSH key setup/created with GitHub, and has *write access*
to the repositories listed in the release manifest. You can also scroll further
up in the output from ``salt-call`` to locate the more specific error message
from Git, if you need a better confirmation of what went wrong.

Drop the *test=True* to actually apply the *oms.release.create_rc* formula.

.. todo::

   When referencing a formula like this, we should link to the doc for that
   formula - ingenius!


Documentation Helpers
---------------------

After creating the RC branch, we new have a handful of details (a few for each
repository) we might need to communicate, share, or document in some form. To
address this need, the release formula includes a few documentation helpers:

.. code::

   # salt-call --local state.sls oms.release.doc_helper


Applying the *oms.release.doc_helper* formula will create a few text files in
the release's working directory. By default, this is */var/oms/release/*, let's
look there:

.. code::

   # ls -alh /var/oms/release/repo*
   /var/oms/release/repo-compare-url.list
   /var/oms/release/repo.list
   /var/oms/release/repo-rc_branch.list

Each of these text files will include a list of auto-generated URLs associated
with the release. The lists of URLs are compiled using various details provided
to the formula through the release manifest (the base URL, RC branch, etc). It
is best to include these lists in the Redmine ticket associated with the release.


Per-Repository/Release Updates
------------------------------

If a repository is included in a release, there may be additional updates to be
made to the repository. It is best to complete these updates before running
through the QA process.

.. note::

   Skip on down to the end of this section for a list of helpful tips aimed at
   simplifing the work in updating the version strings embedded in OMS source
   code.


The following repositories have specific needs to be met.


oms-docs
~~~~~~~~

* Update the release notes (we need to document how to do this).
* Version bump in */package.json* and */sources/conf.py*. Note that the Node
  Package Manager (npm) is picky about version strings, *0.8.5* is valid where
  *0.8.5.1* is not - do be aware of this when updating */package.json*.

.. todo::

   updating the release notes should be documented in this repo..


oms-experimental
~~~~~~~~~~~~~~~~

* Version bump in */setup.py* and in the *__init__.py* found in each module.
* Update auto-generated documentation if any Python packages, modules,
  functions, or classes were added/removed - re-run ``sphinx-autogen`` and use
  Git to compare the output. Updates may be needed.


oms-core
~~~~~~~~

* Version bump in */setup.py* and in the *__init__.py* found in each module.
* Update auto-generated documentation if any Python packages, modules,
  functions, or classes were added/removed - re-run ``sphinx-autogen`` and use
  Git to compare the output. Updates may be needed.


oms-ui
~~~~~~

* Version bump in */docs/conf.py*.


oms-kickstart
~~~~~~~~~~~~~

* Version bump in */config/packer.yaml*, */config/pillar/release.yaml*, and
  */docs/conf.py*.


oms-salt-core
~~~~~~~~~~~~~

* Version bump in */manifests/oms-release.yml*,
*/manifests/oms-repos-extra.yml*, */manifests/oms.yml*, */docs/conf.py*, and
*/oms/release/PILLAR.sls*.


oms-salt-tcf
~~~~~~~~~~~~

* Version bump in */docs/conf.py*.


oms-deploy
~~~~~~~~~~

* Version bump in */setup.py*, and */doc/source/conf.py*.
* Update auto-generated documentation if any Python packages, modules,
  functions, or classes were added/removed - re-run *sphinx-autogen* and use
  Git to compare the output. Updates may be needed.


oms-admin
~~~~~~~~~

* Version bump in */oms_admin/__init__.py*
* Update auto-generated documentation if any Python packages, modules,
  functions, or classes were added/removed - re-run *sphinx-autogen* and use
  Git to compare the output. Updates may be needed.


oms-oidc
~~~~~~~~

Create a new WAR (build artifact), follow :ref:`this guide <oidc_developers_guide>`
to build/create the WAR. Alternatively, there is automated formula available with
``salt-call --local state.sls oidc.build``. Here, we will assume you have already
built OpenID Connect with Maven.

Collect all WARs/JARs into one place:

.. code::

   # copy build for server package
   oms % for war in oidc-Javadoc.jar oidc.war
   do
   cp oms-oidc-server/target/$war upload
   done

   # the list in uploads
   oidc-Javadoc.jar
   oidc.war

   # copy build for demo client package
   oms % for war in oidc-demo-Javadoc.jar oidc-demo.war
   do
   cp oms-oidc-demo/target/$war upload/
   done

   # the list in uploads
   oidc-demo-Javadoc.jar
   oidc-demo.war
   oidc-Javadoc.jar
   oidc.war

   # copy build for test package
   oms % for war in oms-oidc-test-jar-with-dependencies.jar oms-oidc-test-Javadoc.jar
   do
   cp oms-oidc-test/target/$war upload/
   done

   # the list
   oidc-demo-Javadoc.jar
   oidc-demo.war
   oidc-Javadoc.jar
   oidc.war
   oms-oidc-test-jar-with-dependencies.jar
   oms-oidc-test-Javadoc.jar

Rename the WAR to include the version string. Here is a method using zsh,
different from bash:

.. code::

   oms % export version=v0_8_5_1
   oms % cd upload
   # this may not work with bash
   oms % zmv '(*).(*)' $1-$version.$2

   # the list now
   oidc-demo-Javadoc-v0_8_5_1.jar
   oidc-demo-v0_8_5_1.war
   oidc-Javadoc-v0_8_5_1.jar
   oidc-v0_8_5_1.war
   oms-oidc-test-jar-with-dependencies-v0_8_5_1.jar
   oms-oidc-test-Javadoc-v0_8_5_1.jar


Use *sha512sum* to generate a SHA-512 checksum for the WARs:

.. code::

   oms % for $build in `ls .`
   do
   sha512sum $build
   done


Upload the WAR to the Rackspace CDN:

.. code::

   # enable environment variables for OpenStack and cURL
   # ensure you use 1.0 of the Rackspace Auth URL
   oms % source ~/.novarc
   # retrieve an auth token
   oms % curl -i -H "X-Auth-User: $OS_USERNAME" -H "X-Auth-Key: $OS_PASSWORD" $OS_AUTH_URL
   oms % export OS_TOKEN=biglonghexadecimalstring
   oms % export OS_STORAGE_URL=https://storage.url/v1/
   oms % for file in `ls .`
   curl -i -H "X-Auth-User: $OS_USERNAME" -H "X-Auth-Token: $OS_TOKEN" $OS_STORAGE_URL/OMS-OIDC-WARs/ -T $file

Create the *oms-oidc-wars-vx_y_z.yml* (reclass) manifest with the new URL and
checksum, found in the :github-repo:`oms-salt-tcf
<oms-salt-tcf/tree/master/classes/>` GitHub repo. If the WAR is rebuilt, rebase
the RC branch to correct this commit with the final URL/checksum.


python-oidc
~~~~~~~~~~~

* Version bump in */setup.py* and */docs/conf.py*.
* Update auto-generated documentation if any Python packages, modules,
  functions, or classes were added/removed - re-run *sphinx-autogen* and use
  Git to compare the output.


Version Bumps
~~~~~~~~~~~~~

Here are a few tricks that simplify the tedium in making the version bumps on
each repository:

* A simple *grep* for the string '*version*' will output a wall of text, so we
  need to be a little more graceful: ``find . -name \*.py | xargs grep version``.
  Use this on each repo, to examine if there are version strings to update, and
  iterate over different file types (though most all version strings have been
  defined in OMS Python source, some are in *.json*, *.yml*, and *.yaml*).
* The modules in :github-repo:`oms-core <oms-core>` and
  :github-repo:`oms-experimental <oms-experimental>` have version strings in the
  form: *(x, y, z)*. These can be updated, enmass, with the *sed* command line
  utility: ``find . -name \*.py | xargs sed -i 's/0, 8, 5, 1/0, 8, 5, 2/'``.


Build and Review Documentation
------------------------------

Every repository includes extensive documentation in the form of a ReStructured
Text (*.rst*), Sphinx doc project (or equivalent, such as Javadoc for oms-oidc).
All of these documentation projects are (at least in part) auto-generated based
on the details of the source code (and the build being run/executed), and need
to be updated with each release.

Building a WAR for oms-oidc, as referenced in the per-repository updates listed
above, will also build the Javadoc.

For the others, we can rely on oms-docs. Here is the short version of the
process, more details can be :ref:`found here <>`:

* cd to ``/var/oms/releases/oms-docs``
* build the Sphinx projects in all repos with make: ``make clean all``
* review the output from each project to confirm the results of each build
* run the dev server to review the rendered results: ``make serve-all``


QA each repository, individually
--------------------------------

.. note::

   This process needs to be documented in detail.


QA the TCF/TCC/TAB system as a whole
------------------------------------

Starting with a clean/fresh VM, run a kickstart build to set up the default TCC
and TAB demos. The process is :ref:`documented here <deploy_private_tcc>`,
though do take note of the following points.

You may run kickstart on the new host directly (local build), or a build can be
triggered remotely (such as from a host you generally write your code on).
Remote builds are initiated using the *kickstart-kickstart.sh* script included
in the oms-kickstart suite of utilities. Update any configs to be updated,
before running the remote build.

Either way, before running the kickstart build, update *config/release.yaml* in
the oms-kickstart repository to point the build at the RC branch we've created.

.. note::

   This update is not committed to Git - it is only necessary to make this update
   locally, for the build.


For example, with the *v0.8.5.2* release, *config/release.yaml* was updated with
the following (editing the *rev* key in each formula repo under the *states*
key):

.. code::

   repos:
     # dictionary of git repos to checkout and rsync to salt's file_roots
     states:
       # starting with v0.8.5, core salt states are in oms-salt-core
       oms-salt-core:
         url: git@github.com:IDCubed/oms-salt-core.git
         # use this branch until the current deployment refactor is complete
         rev: v0.8.5.2-rc
         # specifies the directory within the repo (where to find states)
         #copy_path: salt/states
       # list multiple repos and they will be rsync'd to the salt files_root
       oms-salt-tcf:
         url: git@github.com:IDCubed/oms-salt-tcf.git
         rev: v0.8.5.2-rc


If all is well, the default kickstart build will leave you with a host that has
the primary OMS TCC with a demonstration of the OMS OpenID Connect, CoreID, and
Persona reference implementation. You ought to be able to follow :ref:`this
guide <CoreID_TCC_Demo>` to register a CoreID and set up an initial persona.
The build process is complex, and as such, the specifics of debugging problems
the build runs into will depend on the specifics of the subsystem(s) involved.


Build a VM Image for QA
-----------------------

Follow the :ref:`VM Builder's Guide <vm_builders_guide>` to create a VirtualBox
image with Packer. The config for OMS Kickstart is pointed at *master* - you
will need to update *config/packer.yaml* (as we did above with *release.yaml*),
to reference the RC branch for this release.

Review the output of the process in detail, to confirm the results. Import and
boot up the appliance VM built and use your browser to QA the TCC as deployed
through the Packer build process.

.. todo::

   we should point them to where they can read about this in oms-kickstart docs.


Cut Release
-----------

Manual
~~~~~~

* Checkout and merge to *master*: ``git checkout master && git merge v0.X.Y-rc``
* Update the commit message, because merge commits have terrible commit messages:
  ``git commit --amend`` - use the form: *tXXXX: Merge v0.X.Y to master* - where
  *tXXXX* is the id as a reference to the Redmine ticket associated with the
  release.


Automated
~~~~~~~~~

* Run: ``salt-call --local state.sls oms.release.merge test=True``
* Review the results, then run the command again while dropping the *test=True*.


Create and sign a tag
---------------------

Referencing the release version and using an accepted GPG key:

* Create a tag: ``git tag -s -m "$repo v0.X.Y" v0.X.Y -u john@example.com``.
  Note that the email address specified tells Git which GPG key to use when
  signing the release.
* Push the tag to GitHub: ``git push origin master && git push --tags origin``


Build a Demo VM
---------------

Follow the :ref:`VM Builder's Guide <vm_builders_guide>` to create a VirtualBox
image with Packer. The config for OMS Kickstart is already pointed at
*master*, so it should build, and there ought to be no problem.

The appliance name should follow the ``OMS-SDK-v0.X.Y-YYYYMMDD.ova`` format.
For example, ``OMS-SDK-v0.8.5-20140429.ova``.


Build and Upload all Release Artifacts
--------------------------------------

With the repositories updated, build and upload all artifacts:

* Importable VM Images
* Java WARs
* the updated documentation


Signing Artifacts
~~~~~~~~~~~~~~~~~

All Open Mustard Seed release VM are signed and encrypted.

To sign the release VM with your key and encrypt it with a passphrase:

.. code::

  $ gpg --sign --symmetric --output OMS-SDK-v0.X.Y-YYYYMMDD.ova.gpg OMS-SDK-v0.X.Y-YYYYMMDD.ova


You will be prompted to enter a passphrase. Use a random password generator
with significant entropy collection, to create a random passphrase of 13 or
more characters. The VM image passphrase will be included in the record we
create in the Downloadable Images webapp (see next section below).


Uploading Release Artifacts to the Rackspace CDN
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The OMS release is hosted from Cloud Files, Rackspace's content delivery
network (CDN), which guarantees high availability and download speed for this
very large file.

**Using Cyberduck**:

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


**From an OMS Host**:

We will use cURL, to upload the *.ova* to the Rackspace CDN:

.. note::

   The instructions here assume you have setup *~/.novarc* with correct config
   for Rackspace/Openstack.


.. code::

   # enable environment variables for OpenStack and cURL
   # ensure you use 1.0 of the Rackspace Auth URL
   oms % source ~/.novarc
   # retrieve an auth token
   oms % curl -i -H "X-Auth-User: $OS_USERNAME" -H "X-Auth-Key: $OS_PASSWORD" $OS_AUTH_URL
   # set these using the values you see in the response from the auth request
   oms % export OS_TOKEN=biglonghexadecimalstring
   oms % export OS_STORAGE_URL=https://storage.url/v1/.../
   # upload the files
   oms % for file in `ls .`
   curl -i -H "X-Auth-User: $OS_USERNAME" -H "X-Auth-Token: $OS_TOKEN" $OS_STORAGE_URL/OMS_SDK/ -T $file


Update Documentation
~~~~~~~~~~~~~~~~~~~~

After all updates are complete on all OMS repositories included in the release,
the changelog and overview sections of the :ref:`Release Notes <release_notes>`
need to be updated for this new release.

When this is complete, we are ready to update the documentation build. Run
``make clean all`` in the *oms-docs* repository to build the Sphinx projects
embedded in the OMS repositories. Ensure the build includes all repositories
included in the release by reviewing the output in *_build/html/*, there should
be a directory for each repository included in the build. This list is configured

Sync the updated doc build (using rsync) with the live documentation, hosted at
*docs.openmustardseed.org*.

Additional information about the documentation build can be :ref:`found here
<contribute_docs>`.


Update the Downloadable Images Webapp
-------------------------------------

With the importable VM images created, encrypted, and uploaded to the CDN, we
can now update the webapp that tracks these images:

* Create a new VM object using `this form`_.
* Include a meaningful description of the VM image you are adding.
* Ensure the passphrase for decrypting the image is correct.
* Ensure the URL to the image hosted on the Rackspace CDN is correct.

.. _this form: https://alpha.openmustardseed.org/downloads/admin/vm_images/


Clean up Redmine
----------------

* Update status, resolve, shuffle tickets around, ensure the taskboard is
  acceptable, etc.
* Purge RC branches from Git repositories.


