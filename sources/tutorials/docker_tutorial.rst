:title: OMS Docker Tutorial
:description: How to deploy OMS components in Docker containers
:keywords: oms, docker, development, help, deployment, system automation, build,
           qa,


.. _docker_tutorial:

OMS Docker Tutorial
===================

Install Docker
--------------

At present, OMS is only setup and documented to run on Ubuntu 12.04 LTS. The salt
states in the :github-repo:`oms-salt-tcf<oms-salt-tcf>` repository include a salt
state `.sls` to simplify installing docker. Alternatively, you may refer to the
`docker documentation`_.

.. _docker documentation: http://docs.docker.io/en/latest/installation/ubuntulinux/

.. note::

   This state wraps the docker install in the simplest way possible and is meant
   as a simple helper, not a complete salt state for managing docker on a host.


On an OMS Host running v0.8.5 or later, apply the `docker.install` state. If the
host needs the docker dependencies installed, salt will reboot the host, so be
sure to close any open files and save any work before applying this state. After
the host has rebooted, apply the state a second time to install docker.

.. code:: bash

   oms% salt-call --local state.sls docker.install


We can now use Docker to create and manage containers.


OMS in a Docker Container
-------------------------

As OMS is full of reusable components, the utilities available in the
:github-repo:`oms-kickstart<oms-kickstart>` repository will help us build
OMS components as we would with any other type of host.

Let's use oms-kickstart to kickstart a generic OMS Host - we will first build a
generic Ubuntu 12.04 container, `base`, then use this to build a new container
to run oms-kickstart in.

Create a directory for our containers and Dockerfiles:

.. code::

   root@qa85:~# mkdir /var/docker/
   root@qa85:~# cd /var/docker/


Copy the Dockerfiles from oms-kickstart to `/var/docker/`, as well as the
kickstart scripts and YAML configs:

.. code::

   root@qa85:/var/docker# cp -rp /var/oms/src/oms-kickstart/docker/Dockerfiles/* /var/docker/
   root@qa85:/var/docker# cp -rp /var/oms/src/oms-kickstart /var/docker/kickstart/
   root@qa85:/var/docker# ls -alh
   total 24K
   drwxr-xr-x  5 root root 4.0K Feb 24 07:40 .
   drwxr-xr-x 18 root root 4.0K Feb 24 06:26 ..
   drwxr-xr-x  3 root root 4.0K Feb 24 06:56 base
   drwxr-xr-x  2 root root 4.0K Feb 24 06:56 kickstart
   -rw-r--r--  1 root root  683 Feb 24 06:25 README.rst


We'll need an SSH key that has access to the GitHub repos, we can either create
a new keypair, or use the one from the host:

.. code::

   root@qa85:/var/docker/# cp -rp /root/.ssh/id_rsa* kickstart/oms-kickstart/config/keys/
   root@qa85:/var/docker/# ls -alh kickstart/oms-kickstart/config/keys/
   total 20K
   drwxr-xr-x 2 root root 4.0K Feb 24 06:32 .
   drwxr-xr-x 4 root root 4.0K Feb 24 06:25 ..
   -rw------- 1 root root 1.7K Feb  5 15:36 id_rsa
   -rw------- 1 root root  381 Feb  5 15:36 id_rsa.pub
   -rw-r--r-- 1 root root 1.8K Feb 24 06:21 README


Let's first build the base image, here is what we have to work with:
   
.. code::

   root@qa85:/var/docker# ls -alh base/
   total 16K
   drwxr-xr-x 3 root root 4.0K Feb 24 06:44 .
   drwxr-xr-x 3 root root 4.0K Feb 24 06:44 ..
   -rw-r--r-- 1 root root  416 Feb 24 06:44 Dockerfile
   drwxr-xr-x 3 root root 4.0K Feb 24 06:44 etc


Build the docker image! It will looks similar to this:

.. code::

   root@qa85:/var/docker# cd base/
   root@qa85:/var/docker/base# docker build -t=oms/base .
   
   Uploading context 4.608 kB
   Uploading context 
   Step 0 : FROM ubuntu:12.04
    ---> 9cd978db300e
   Step 1 : MAINTAINER info@idcubed.org
    ---> Running in 801e920a7b7e
    ---> 84ce7c72dca5
   Step 2 : ADD etc/apt/sources.list /etc/apt/sources.list
    ---> fa7a3a7d11b7
   Step 3 : RUN apt-get update
    ---> Running in 5d4ce7e14dcb
   Hit http://archive.ubuntu.com precise Release.gpg
   Hit http://archive.ubuntu.com precise Release
   Hit http://archive.ubuntu.com precise/main amd64 Packages
   Hit http://archive.ubuntu.com precise/universe amd64 Packages
   Hit http://archive.ubuntu.com precise/main i386 Packages
   Hit http://archive.ubuntu.com precise/universe i386 Packages
   
    ---> e512f4e01467
   Step 4 : RUN apt-get install -y -q python2.7
    ---> Running in 8846fc66e5a1
   
   
   python2.7 is already the newest version.
   0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
    ---> 9c405ebe519b
   Step 5 : RUN apt-get install -y -q python-yaml
    ---> Running in 0c13a3217fa2
   
   
   The following extra packages will be installed:
     libyaml-0-2
   The following NEW packages will be installed:
     libyaml-0-2 python-yaml
   0 upgraded, 2 newly installed, 0 to remove and 0 not upgraded.
   Need to get 179 kB of archives.
   After this operation, 658 kB of additional disk space will be used.
   Get:1 http://archive.ubuntu.com/ubuntu/ precise/main libyaml-0-2 amd64 0.1.4-2 [56.9 kB]
   Get:2 http://archive.ubuntu.com/ubuntu/ precise/main python-yaml amd64 3.10-2 [122 kB]
   debconf: unable to initialize frontend: Dialog
   debconf: (TERM is not set, so the dialog frontend is not usable.)
   debconf: falling back to frontend: Readline
   debconf: unable to initialize frontend: Readline
   debconf: (Can't locate Term/ReadLine.pm in @INC (@INC contains: /etc/perl /usr/local/lib/perl/5.14.2 /usr/local/share/perl/5.14.2 /usr/lib/perl5 /usr/share/perl5 /usr/lib/perl/5.14 /usr/share/perl/5.14 /usr/local/lib/site_perl .) at /usr/share/perl5/Debconf/FrontEnd/Readline.pm line 7, <> line 2.)
   debconf: falling back to frontend: Teletype
   dpkg-preconfigure: unable to re-open stdin: 
   Fetched 179 kB in 0s (481 kB/s)
   Selecting previously unselected package libyaml-0-2.
   9737 files and directories currently installed.)
   Unpacking libyaml-0-2 (from .../libyaml-0-2_0.1.4-2_amd64.deb) ...
   Selecting previously unselected package python-yaml.
   Unpacking python-yaml (from .../python-yaml_3.10-2_amd64.deb) ...
   Setting up libyaml-0-2 (0.1.4-2) ...
   Setting up python-yaml (3.10-2) ...
   Processing triggers for libc-bin ...
   ldconfig deferred processing now taking place
    ---> 4fa0ea121507
   Step 6 : RUN apt-get install -y -q lsb-release
    ---> Running in 96ca08306674
   
   lsb-release is already the newest version.
   0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
    ---> 9729f1878f40
   Step 7 : RUN apt-get install -y -q tmux
    ---> Running in 4622a461281a
   
   The following extra packages will be installed:
     libevent-2.0-5
   The following NEW packages will be installed:
     libevent-2.0-5 tmux
   0 upgraded, 2 newly installed, 0 to remove and 0 not upgraded.
   Need to get 351 kB of archives.
   After this operation, 849 kB of additional disk space will be used.
   Get:1 http://archive.ubuntu.com/ubuntu/ precise/main libevent-2.0-5 amd64 2.0.16-stable-1 [127 kB]
   Get:2 http://archive.ubuntu.com/ubuntu/ precise/main tmux amd64 1.6-1ubuntu1 [224 kB]
   debconf: unable to initialize frontend: Dialog
   debconf: (TERM is not set, so the dialog frontend is not usable.)
   debconf: falling back to frontend: Readline
   debconf: unable to initialize frontend: Readline
   debconf: (Can't locate Term/ReadLine.pm in @INC (@INC contains: /etc/perl /usr/local/lib/perl/5.14.2 /usr/local/share/perl/5.14.2 /usr/lib/perl5 /usr/share/perl5 /usr/lib/perl/5.14 /usr/share/perl/5.14 /usr/local/lib/site_perl .) at /usr/share/perl5/Debconf/FrontEnd/Readline.pm line 7, <> line 2.)
   debconf: falling back to frontend: Teletype
   dpkg-preconfigure: unable to re-open stdin: 
   Fetched 351 kB in 0s (713 kB/s)
   Selecting previously unselected package libevent-2.0-5.
   9796 files and directories currently installed.)
   Unpacking libevent-2.0-5 (from .../libevent-2.0-5_2.0.16-stable-1_amd64.deb) ...
   Selecting previously unselected package tmux.
   Unpacking tmux (from .../tmux_1.6-1ubuntu1_amd64.deb) ...
   Setting up libevent-2.0-5 (2.0.16-stable-1) ...
   Setting up tmux (1.6-1ubuntu1) ...
   Processing triggers for libc-bin ...
   ldconfig deferred processing now taking place
    ---> c90acf9871f2
   Successfully built c90acf9871f2
   

With a base image, we can now more easily build new images to kickstart OMS in
different ways. This is a great tool for development!


.. code::

   root@qa85:/var/docker/kickstart# docker build -t=oms/kick .                                                                                                                                   
   Uploading context   236 kB
   Uploading context 
   Step 0 : FROM oms/base:latest
    ---> c90acf9871f2
   Step 1 : MAINTAINER info@idcubed.org
    ---> Using cache
    ---> 695d0bf4262b
   Step 2 : ENV HOME /root
    ---> Running in 91309b2357f3
    ---> b0d72140534f
   Step 3 : RUN mkdir /root/.ssh
    ---> Running in 35de4165020a
    ---> e11e56cf4d18
   Step 4 : ADD oms-kickstart/config/keys/id_rsa /root/.ssh/
    ---> 761903f0b94f
   Step 5 : ADD oms-kickstart/config/keys/id_rsa.pub /root/.ssh/
    ---> 7ca30d03125c
   Step 6 : RUN chmod -R o-wrx /root/.ssh
    ---> Running in 4e1cb596dc0a
    ---> 4bdd2cb5679f
   Step 7 : RUN chmod -R g-wrx /root/.ssh
    ---> Running in c7ae82f2cfff
    ---> 76e71023f023
   Step 8 : RUN mkdir /root/kickstart
    ---> Running in 75280ec1e8a3
    ---> d1da9fe99b5e
   Step 9 : ADD oms-kickstart/config /root/kickstart/
    ---> 63bce24a912a
   Step 10 : ADD oms-kickstart/kickstart-oms.py /root/kickstart/
    ---> 1adb1ba34e60
   Step 11 : ADD oms-kickstart/run-kickstart.sh /root/kickstart/
    ---> 6819187d1a1f
   Step 12 : RUN /bin/bash -c /root/kickstart/run-kickstart.sh
    ---> Running in f80907c8d7cc
   2014-02-24 07:59:02,873 [7] Script args: Namespace(configs=['config/qa-develop.yaml', 'config/pillar/qa-develop.yaml'], debug=True, highstate=True, logfile='kickstart-oms.py.log', test=False)
   2014-02-24 07:59:03,029 [7] OS Distro: precise
   2014-02-24 07:59:03,029 [7] Update apt before we install anything
   2014-02-24 07:59:03,030 [7] update apt with: ('apt-get', 'update')

   ...

   Package: binutils
   Provides: elf-binutils
   2014-02-24 08:12:14,824 [7] No changes made for base-pkg
    ---> bcd293920845
   Successfully built bcd293920845


That will eventually complete, and you'll have a new image with an OMS Host
deployed in docker and available to create new containers based on.

.. code::

   root@qa85:/var/docker/kickstart# docker images
   REPOSITORY          TAG                 IMAGE ID            CREATED              VIRTUAL SIZE
   oms/kick            latest              bcd293920845        About a minute ago   730.8 MB
   oms/base            latest              c90acf9871f2        17 minutes ago       207.6 MB
   ubuntu              13.10               9f676bd305a4        2 weeks ago          182.1 MB
   ubuntu              saucy               9f676bd305a4        2 weeks ago          182.1 MB
   ubuntu              13.04               eb601b8965b8        2 weeks ago          170.2 MB
   ubuntu              raring              eb601b8965b8        2 weeks ago          170.2 MB
   ubuntu              12.10               5ac751e8d623        2 weeks ago          161.4 MB
   ubuntu              quantal             5ac751e8d623        2 weeks ago          161.4 MB
   ubuntu              10.04               9cc9ea5ea540        2 weeks ago          183 MB
   ubuntu              lucid               9cc9ea5ea540        2 weeks ago          183 MB
   ubuntu              12.04               9cd978db300e        2 weeks ago          204.7 MB
   ubuntu              latest              9cd978db300e        2 weeks ago          204.7 MB
   ubuntu              precise             9cd978db300e        2 weeks ago          204.7 MB


Let's run an interactive bash shell in a container based on the `oms/kick` image
to confirm it works as we expect:

.. code::

   root@qa85:/var/docker/kickstart# docker run -i -t oms/kick /bin/bash
   root@37938dba9a36:/# 
   root@37938dba9a36:/# salt-call --local --version
   salt-call 0.17.5


OMS may not be fully functional within a docker container - there has not been
extensive testing of OMS with docker, and the OMS TCF is actually quite likely
not functional, but that should not deter you from using the method described
here to run the kickstart process in a docker container.

The generic deployment framework (oms-kickstart) will run and provide an image
to base additional development and tests on, and this is very useful.
