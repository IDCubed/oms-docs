:title: OIDC Developer's Guide
:description: How to Build, Set Up, Deploy And Run The ID3 OIDC Server
:keywords: oms, oidc, setup


.. _oidc_developers_guide:

OpenID Connect Developer's Guide
================================

This guide covers deployment of an ID3 OpenID Connect Server (OIDC) and the OMSChat applications for both
production and development environments. The guide is written to target developers
needing to deploy OIDC. Familiarity with the linux command line and development environments is assumed.

OIDC will be installed on a fresh install of Ubuntu 12.04 LTS Linux. Installation
on other flavours of Linux as well other versions of Ubuntu is not supported,
though may be possible with modification to the details of this guide.
Installation on existing Ubuntu 12.04 LTS hosts is also possible, though can be
risky and is not advised. Installation on operating systems other than Linux,
such as MacOS or Windows, may also be possible, but will require an in-depth
knowledge of the host operating system to ensure OIDC's needs are still met.

This guide has been tested on a newly-installed Ubuntu 12.04.2 LTS with only the
default packages loaded.


Building ID3 OpenID Connect
---------------------------

This section is included in case the reader is building the software from source.
In case there are pre-built WARs available for the ID3 OpenID Connect server,
please skip ahead.

The following tools are needed to compile the ID3 OpenID Connect Server from
source: GIT, Maven and Java. An active Internet connection at all times to build
the software is required.


Build Environment Setup
~~~~~~~~~~~~~~~~~~~~~~~

It is assumed that you have a functional Ubuntu 12.04 installation and you have
basic familiarity using it. Please, open a terminal window. The following
installs the tools needed to install needed to build the software:

.. code:: bash

   oms% sudo apt-get install git
   oms% sudo apt-get install maven
   oms% sudo apt-get install openjdk-7-jre-headless
   oms% sudo apt-get install openjdk-7-jdk


When asked, enter a valid password, as well as confirm installation the
potentially large number of dependencies the APT command deems necessary. The
exact list will vary and will depend on the exact packages installed during
installation of Ubuntu. If this is a fresh Ubuntu installation please type:

.. code:: bash

   oms% sudo apt-get update

   
This will force APT to update its internal database of available packages and
will ensure the latest stable versions are being installed. If you already have a different version of Java installed, please type:

.. code:: bash
   
   update-java-alternatives -s java-1.7.0-openjdk-amd64

to ensure a compatible version of Java is the default for your Ubuntu installation.

Next, several environment variables need to be defined to help build the software:

Become root and open /etc/environment for editing using your favourite text
editor. Add the following new variables:

.. code:: bash

   oms% export JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
   oms% export JRE_HOME=/usr/lib/jvm/java-7-openjdk-amd64/jre
   

Save the newly-edited file and load it into the system environment:

.. code:: bash

   oms% source /etc/environment
   

At this point the following commands should return output very similar to the following:

.. code:: bash

   oms% git --version
   git version 1.7.9.5
   oms% mvn -version
   Apache Maven 3.0.4
   Maven home: /usr/share/maven
   Java version: 1.6.0_27, vendor: Sun Microsystems Inc.
   Java home: /usr/lib/jvm/java-6-openjdk-amd64/jre
   Default locale: en_US, platform encoding: UTF-8
   OS name: "linux", version: "3.2.0-43-generic", arch: "amd64", family: "unix"
   oms% java -version
   java version "1.7.0_55"
   OpenJDK Runtime Environment (IcedTea 2.4.7) (7u55-2.4.7-1ubuntu1)
   OpenJDK 64-Bit Server VM (build 24.51-b03, mixed mode)
   oms% echo $JAVA_HOME
   /usr/lib/jvm/java-7-openjdk-amd64
   oms% echo $JRE_HOME
   /usr/lib/jvm/java-7-openjdk-amd64/jre
   oms% 

   
``Command not found`` to any of the commands above, or any variables not defined
as expected, indicate something is not quite right. Please go back and correct
the problem.


Cloning the GIT Repository
~~~~~~~~~~~~~~~~~~~~~~~~~~

At this point you are ready to get a copy of the latest source code to build. At
the time of writing the latest source code is located in the ``qa-develop``
branch, and should be cloned from there.

.. code:: bash

   oms% mkdir ~/project
   oms% cd ~/project
   oms% git clone -b qa-develop https://github.com/IDCubed/oms-oidc/
   

As of the time of writing OIDC is a private repository and requires a valid
username and password with access to the project. Upon providing valid
credentials, the GIT command will copy the entire repository under
``~/projects/oms-oidc``.


Building the ID3 OpenID Connect Server and Client
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Building the OIDC repository is straightforward with Maven doing the bulk of the
work for you. The OIDC maven scripts provides two build profiles: ``prod`` and
``dev``.  ``prod`` is the production profile with full integration to downstream components. 
It is meant for production environments, or testing environments where
full end-to-end integration is possible. The Dev is the development build profile,
which substitutes development stubs for downstream components and runs standalone. The development
profile is often best suited for unit-testing of local changes.

For a Production build profile type the following:

.. code:: bash

   oms% cd ~/project/oms-oidc
   oms% mvn -P prod clean install

   
For a Development build profile type the following:

.. code:: bash

   oms% cd ~/project/oms-oidc
   oms% mvn -P dev clean install

   
In both cases a very large number of dependencies being downloaded the first time
a full build runs, finishing with a BUILD SUCCESS message. In case the build fails
dependencies may have failed to download. In this case please check your Internet
connection and retry. The build script also runs a very comprehensive automatic
testing suite, which includes deploying the fully-assembled WAR on an embedded
servlet container, and running tests against it. If the integration test phase
fails, please check that ports 18080 and 18081 are not used by anything else as
the build script runs embedded servlet containers there. 

The build script produces two WAR files: 

* ``~/project/oms-oidc/oms-oidc-server/target/oidc.war`` is the ID3 OpenID Connect
  Server itself.
* ``~/project/oms-oidc/oms-oidc-demo/target/oidc-demo.war`` is a sample demo client used to
  drive the server. Please do not deploy it in a Production environment.


Some JAR artifacts are also produced:

* ``~/project/oms-oidc/oms-oidc-server/target/oidc-sources.jar`` is a JAR with the
  packaged sources, useful for code reviews.
* ``~/project/oms-oidc/oms-oidc-server/target/oidc-javadoc.jar`` is a JAR with the
  packaged Javadoc documentation.
* ``~/project/oms-oidc/oms-oidc-demo/target/oidc-demo-javadoc.jar`` is a JAR with the
  packaged Javadoc documentation of the sample client.


Finally, the output of all automated tests can be revewed at:

* ``~/project/oms-oidc/oms-oidc-server/target/surefire-reports`` is where Maven's
  SureFire plugin stores all its logs. A passed test will log very little
  information apart from the fact that it passed. A failed test logs detailed
  output and causes the entire build to fail.


Please note that a lot of tests, particuarly those testing security-sensitive
APIs, perform a lot of negative testing: exceptions and errors on your console output are
a normal and expected behaviour. The build script is set to look for any expected
errors and will fail whenever an unexpected error is detected, or if any of the
expected errors do not occur.


Deployment of ID3 OpenID Connect
--------------------------------

This section covers installation and set up needed to your Ubuntu 12.04 LTS host
in order to run the ID3 OpenID Connect software, both client and server. It is
assumed an oidc.war file and, optionally, an oidc-demo.war are available: either
built from source, or made available as pre-built binaries.


Installation of Software
~~~~~~~~~~~~~~~~~~~~~~~~

ID3 OpenID Connect requires a servlet container such as Tomcat, as well as a
database. Both have to be installed and configured appropriately before the
``oidc.war`` and the ``oidc-demo.war`` files would deploy.

The following packages need to be installed for a supported configuration:

.. code:: bash

   oms% sudo apt-get install tomcat7
   oms% sudo apt-get install postgresql
   oms% sudo apt-get install postgresql-contrib
   oms% sudo apt-get install libpostgresql-jdbc-java


Apart from PostgreSQL, at the time of writing the IDOIC server has been known to
work with MySQL, HyperSQL and Derby. Neither of these alternative configurations
is supported for production use, is maintained, or receives any attention in
testing.

A key requirement for running Java on a virtual machine is the availability of swap space. The following is one way to do it and is preferred for Rackspace Virtual Machines. Other virtual machines
may come with swap space already enabled, or even have dedicated swap partitions enabled by default.

To find out if you have swap enabled, type the following:

.. code:: bash

   oms% swapon -s

An empty list means no swap space is available. Creating a swap file is performed as follows:

.. code:: bash

   oms% sudo dd if=/dev/zero of=/swapfile bs=1024 count=1024m
   oms% sudo chmod 600 /swapfile
   oms% sudo mkswap /swapfile
   oms% sudo swapon /swapfile

This creates 1 GB file and sets it up as swap space available for your Linux machine. You would want to set any swap file created as described within your /etc/fstab file as follows:

.. code::

   /swapfile1	none		swap	sw		0	0 


PostgreSQL Setup
~~~~~~~~~~~~~~~~

The PostgreSQL setup needed is straightforward. Starting as a root user, type:

.. code:: bash

   oms% su - postgres
   oms% createdb oicserver
   oms% createuser oic


Please answer ``no`` to all questions asked regarding the oic user. Now set up the
new database for use:

.. code:: bash

   oms% psql oicserver
   oicserver=# \password oic

   
Enter password of ``oic`` and confirm it. Now type the following to extend all
access on the oicserver database to the oic user.

.. code::

   oicserver=# grant all privileges on database oicserver to oic;
   GRANT
   
Now press CTRL+D to exit. A brand new database and user for the ID3 OpenID
Connect Server is now defined. The rest of the PostgreSQL setup can be handled
with scripts:


.. note::

   The following scripts run as the oic user on the oicserver database!

.. code:: bash

   oms% cd ~/project/oms-oidc/env/database/postgresql
   oms% psql -h localhost -U oic oicserver < create-oicserver-database.sql
   oms% psql -h localhost -U oic oicserver < insert-system-scopes.sql
   oms% psql -h localhost -U oic oicserver < insert-oidc-service-client.sql
   oms% psql -h localhost -U oic oicserver < insert-rids-client.sql

Please enter a password of ``oic`` every time. If you intend to run the OIDC-Demo WAR, run the following script as well:

.. code:: bash

   oms% psql -h localhost -U oic oicserver < insert-oidc-demo-client.sql

When running SQL scripts, please disregard any errors such as the following:

.. code:: bash

   ERROR:  syntax error at or near ":"
   LINE 1: SET ROLE :role;
                    ^
The SQL scripts above are also used by Salt for automated installations, which require the SET ROLE statement to appear at a key location within the file in order to ensure proper execution as the
correct user. This error is harmless for manual installations such as the ones you are performing. 

This concludes the database setup.

Tomcat Setup
~~~~~~~~~~~~

Tomcat requires a few environment variables of its own. Open /etc/environment for
editing as root using your favourite text editor and add the following:

.. code:: bash

   oms% export CATALINA_HOME=/usr/share/tomcat7
   oms% export CATALINA_BASE=/var/lib/tomcat7

   
Now source the file into the currently-active environment:

.. code:: bash

   oms% source /etc/environment


Tomcat is started immediately upon installation: open a web browser on your host
machine (feel free to install the lynx or links packages if X is not available)
and go to http://localhost:8080. The ``It works!`` message should appear. Upon
confirming it was installed correctly and it runs, Tomcat needs to be shut down
for further configuration:

.. code:: bash

   oms% sudo /etc/init.d/tomcat7 stop


Next, unless you are running Tomcat behind a reverse proxy such as Apache or Nginx,
the Tomcat server needs to be modified to run on a port lower than 1024. On all 
Unix-based platforms except MacOS, ports lower than 1024 can only be
opened as root, so Tomcat needs to be told to drop root after opening the server
socket for itself. Open /etc/default/tomcat7 for editing, and locate the
``AUTHBIND`` line at the very end, which is commented out by default. Uncomment
it and change it to ``yes``.

.. code::

   AUTHBIND=yes

Within the same file, change the following as well:

.. code::

   JAVA_HOME=/usr/lib/jvm/java-7-openjdk-amd64
   JAVA_OPTS="-Djava.awt.headless=true -Xmx512m -XX:+UseConcMarkSweepGC -XX:MaxPermSize=256m"

Running Tomcat with less memory is possible, though this setup is the current recommended one.
   
Ubuntu's firewall needs to have a few ports open to allow Tomcat traffic in. This
is critical for Production installations. For Development installations you may
choose to skip this.

.. code:: bash

   oms% sudo ufw allow 443

The Tomcat server needs to be configured with a data source to PostgreSQL just
defined above, but first it needs to be told where to find the JDBC driver for it:

.. code:: bash

   oms% cd /var/lib/tomcat7/common
   oms% sudo ln -s /usr/share/java/postgresql.jar postgresql.jar 


Every JAR in the common directory is being loaded as the Tomcat server starts up.
This driver will be present as Tomcat parses its configuration, or loads any WAR
files. This is useful to export a database as JNDI resource and thus remove direct
dependency of the WARs being deployed on a particular database configuration.

Once ID3 OpenID Connect is deployed, it will need to be told where and how to do
its logging. Logging is another aspect of the running system that is highly environment-dependent, 
which is why the server's configuration is not being packaged within the WAR, but rather introduced into the
server's classpath by Tomcat. If this step is skipped or not working correctly,
you will see OIDC logging into the general Tomcat log, which is not recommended, or even to fail to deploy altogether.

.. code:: bash

   oms% cd /var/lib/tomcat7/shared/classes
   oms% sudo cp ~/projects/oms-oidc/env/var/lib/tomcat7/shared/classes/log4j.xml .
   oms% sudo cp ~/projects/oms-oidc/env/var/lib/tomcat7/shared/classes/log4j-oidc.xml .

If you intend to run the OIDC-Demo project, run the following as well:

.. code:: bash

   oms% sudo cp ~/projects/oms-oidc/env/var/lib/tomcat7/shared/classes/log4j-oidc-demo.xml .

The default configuration will do basic high-level logging to application.log and application-error.log, as well as to syslog.
In addition to that, you will be getting a separate log and error log for every WAR deployed. Feel free to examine the file and 
adjust according to your needs. For example, for a development setup, you might want to change minimum log levels to DEBUG.
Also, should you decide to log to syslog, make sure UDP port 514 has your log
daemon listening, otherwise please delete the following line near the bottom of log4j.xml:

.. code::
   
   <appender-ref ref="appender.syslog.application" />

At this time the server configuration also needs to be created. The server
supports two different configuration mechanisms: one uses a property file and the
other uses a database table. The property file option will be discussed here and
is the preferred as the server will not require its database to be up and running
so that the Tomcat server would start correctly.

The ID3 OpenID Connect Server looks for a property file called
``oidc_config.properties`` at ``/var/lib/tomcat7/shared/classes``, containing
the following properties. 

Every property should be prefixed by ``production``. for a production-profile
server and ``development`` for a development-profile server. 

+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Property                              | Description                                                                                                                                                      |
+=======================================+==================================================================================================================================================================+
| configBean.issuer                     | The URL your server responds to. This is the URL your clients call and will be validated by the server. In a reverse-proxy environment, this will be the location|
|                                       | of the reverse proxy.                                                                                                                                            |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| configBean.logoImageUrl               | Path to the logo displayed on all OIDC web pages.                                                                                                                |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| configBean.topbarTitle                | Title displayed next to the logo on all OIDC web pages.                                                                                                          |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| personaProvider.serverUrl             | The URL to a Persona Provider, such as OMSChat-PersonaManager. This property is not used by a server built with the development profile, but a value for it is   |
|                                       | still required.                                                                                                                                                  |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| personaProvider.userInfoEndPoint      | User Information endpoint relative to the serverURL entered above.                                                                                               |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| personaProvider.allPersonasEndPoint   | Persona endpoint relative to the serverURL entered above.                                                                                                        |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| personaProvider.serviceClientId       | The OIDC client used by OIDC itself to issue any tokens required for integration with the Persona Provider. By default this is the oidc-service-client you       |
|                                       | defined with an SQL script above.                                                                                                                                |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| personaProvider.serviceClientScope    | The scope list used by OIDC issue any tokens required for integration with the Persona Provider.                                                                 |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| policyManager.decisionEngineEndPoint  | The URL to a Policy Manager, such as OMSChat-PolicyManager. This property is not used by a server built with the development profile, but a value for it is still|
|                                       | required.                                                                                                                                                        |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| policyManager.serviceClientId         | The OIDC client used by OIDC itself to issue any tokens required for integration with the Policy Manager. By default this is the oidc-service-client you defined |
|                                       | with an SQL script above.                                                                                                                                        |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| policyManager.serviceClientScope      | The scope list used by OIDC issue any tokens required for integration with the Policy Manager.                                                                   |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| rids.ridsEndPoint                     | The endpoint used by OIDC to integrate with the Root Identity System.                                                                                            |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| rids.serviceClientId                  | This is the client OIDC uses when user is trying to authenticate at the OIDC's own administration console. This must be a valid client whose information would be|
|                                       | displayed by the Root Identity System when authenticating.                                                                                                       |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| metrics.useJMXReporter                | Whether or not to make OIDC performance metrics accessible through JMX. This property requires the corresponding Tomcat configuration to work. See Tomcat's      |
|                                       | documentation for details.                                                                                                                                       |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| metrics.useGraphiteReporter           | Whether or not to post OIDC performance metrics to a Graphite server. This property requires a properly-configured Graphite server somewhere on your network.    |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| metrics.graphiteAddress               | The hostname or IP address of a Graphite server to post OIDC performance metrics to. This property is ignored if metrics.useGraphiteReporter is set to ``false``.|
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| metrics.graphitePort                  | The port where to post OIDC performance metrics to Graphite. This property is ignored if metrics.useGraphiteReporter is set to ``false``.                        |
+---------------------------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------+

This is a sample configuration for a production-profile server:

.. code::

   production.configBean.issuer=https://localhost/oidc/
   production.configBean.logoImageUrl=resources/images/mustardseed-composite_3_small.png
   production.configBean.topbarTitle=ID3 OpenID Connect Server
   production.personaProvider.serverUrl=https://localhost/oms-chat-persona-manager
   production.personaProvider.userInfoEndPoint=/api/v1/personas/useridentity/%userIdentity%/userinfo
   production.personaProvider.allPersonasEndPoint=/api/v1/personas/useridentity/%userIdentity%
   production.personaProvider.serviceClientId=oidc-service-client
   production.personaProvider.serviceClientScope=managed-persona
   production.policyManager.decisionEngineEndPoint=https://localhost/oms-chat-policy-manager/policy
   production.metrics.usePerformanceLogging=true
   production.rids.serviceClientId=oidc-service-client
   production.rids.ridsEndPoint=https://localhost/oms-chat-rids-mock/authenticate
   
This is a sample configuration for a development-profile server:
Please note that a development-profile server ignores all userRegistry properties as the server is set to run against a development mock of the User Registry and does not integrate with a live User Registry. 

.. code::

   development.configBean.issuer=https://localhost/oidc/
   development.configBean.logoImageUrl=resources/images/mustardseed-composite_3_small.png
   development.configBean.topbarTitle=ID3 OpenID Connect Server *DEV*
   development.personaProvider.serverUrl=https://localhost/oms-chat-persona-manager
   development.personaProvider.userInfoEndPoint=/api/v1/personas/useridentity/%userIdentity%/userinfo
   development.personaProvider.allPersonasEndPoint=/api/v1/personas/useridentity/%userIdentity%
   development.personaProvider.serviceClientId=oidc-service-client
   development.personaProvider.serviceClientScope=managed-persona
   development.policyManager.decisionEngineEndPoint=https://localhost/oms-chat-policy-manager/policy
   development.metrics.usePerformanceLogging=true
   development.rids.serviceClientId=oidc-service-client
   development.rids.ridsEndPoint=https://localhost/oms-chat-rids-mock/authenticate
   development.metrics.useJMXReporter=true
   development.metrics.useGraphiteReporter=true
   development.metrics.graphiteAddress=127.0.0.1
   development.metrics.graphitePort=2003

It is highly recommended that ID3 OpenID Connect server as well as all downstream dependencies, runs within an SSL layer.
If this part of the setup is neglected, all credentials and tokens being
exchanged will be visible to all, as well as the final system as a whole would be
vulnerable to man-in-the-middle attacks.

For a production setup where Tomcat maintains its own SSL layer, you will
require an SSL certificate signed by a well-known and accepted Certificate
Authority, such as GoDaddy and Verisign. For a development setup you only require
a certificate acceptable to your local machine, and the cost of obtaining a valid
SSL certificate is not justified. The two setups are discussed separately below:


**Production SSL Setup For Tomcat**


This is how Open Musard Seed creates the SSL certificates for Tomcat with GoDaddy. First,
a new keystore is created with a new key:

.. code:: bash

   oms% cd /etc/tomcat7
   oms% sudo keytool -keysize 2048 -genkey -alias tomcat -keyalg RSA -keystore oidc.keystore

   Enter keystore password: oickeys
   Re-enter new password: oickeys
   What is your first and last name?
      [Unknown]:  *.openmustardseed.org
   What is the name of your organizational unit?
      [Unknown]:
   What is the name of your organization?
      [Unknown]: Open Mustard Seed 
   What is the name of your City or Locality?
      [Unknown]:  Cambridge
   What is the name of your State or Province?
      [Unknown]:  Massachusetts
   What is the two-letter country code for this unit?
      [Unknown]:  US
   Is CN=*.openmustardseed.org, OU=Unknown, O=Open Mustard Seed, L=Cambridge, ST=Massachusetts, C=US correct?
      [no]:  Yes

   Enter key password for <tomcat>
      (RETURN if same as keystore password):  [return]


Next, next the CSR from the keystore is exported and sent to GoDaddy to sign:

.. code:: bash

   oms% sudo keytool -certreq -keyalg RSA -alias tomcat -file openmustardseed.org.csr -keystore oidc.keystore


The signed CSR comes back as ``openmustardseed.org.crt``, and should be saved at ``/etc/tomcat7``.

A few more certificates are needed. Browse to `https://certs.godaddy.com/anonymous/repository.seam?cid=352580 <https://certs.godaddy.com/anonymous/repository.seam?cid=352580>`_ and download the following files:

* valicert_class2_root.crt
* gd_cross_intermediate.crt
* gd_intermediate.crt


All 3 files should be saved at /etc/tomcat7 as well. All 4 files should be
imported into Tomcat's keystore as follows:

.. code:: bash

   oms% sudo keytool -import -alias root -keystore oidc.keystore -trustcacerts -file valicert_class2_root.crt

   oms% sudo keytool -import -alias cross -keystore oidc.keystore -trustcacerts -file gd_cross_intermediate.crt

   oms% sudo keytool -import -alias intermed -keystore oidc.keystore -trustcacerts -file gd_intermediate.crt
   
   oms% sudo keytool -import -alias tomcat -keystore oidc.keystore -file openmustardseed.org.crt


With this, your production SSL keystore is ready for Tomcat.

Finally, the JVM running Tomcat needs to be told to trust Tomcat's SSL certificate
as well, or the server will fail to integrate with its User Registry:

.. code:: bash

   oms% sudo keytool -import -alias tomcat -keystore /etc/ssl/certs/java/cacerts -file openmustardseed.org.crt


**Development SSL Setup For Tomcat:**

This setup is intended for development purposes only. If used in a Production
machine, clients will fail talking to the server with a *no trusted SSL
certificate found* error.

First create a new keystore with a new certificate , putting the word ``localhost``
or your development machine's fully-qualified domain name for first and last name.
This is important as clients will be checking if the certificate name corresponds
to the name of the machine being called. 

.. code:: bash

   oms% cd /etc/tomcat7
   oms% sudo keytool -keysize 2048 -genkey -alias tomcat -keyalg RSA -keystore oidc.keystore

   Enter keystore password: oickeys
   Re-enter new password: oickeys
   What is your first and last name?
      [Unknown]:  localhost
   What is the name of your organizational unit?
      [Unknown]:
   What is the name of your organization?
      [Unknown]:  Open Mustard Seed
   What is the name of your City or Locality?
      [Unknown]:  Cambridge
   What is the name of your State or Province?
      [Unknown]:  Massachusetts
   What is the two-letter country code for this unit?
      [Unknown]:  US
   Is CN=localhost, OU=Unknown, O=Open Mustard Seed, L=Cambridge, ST=Massachusetts, C=US correct?
      [no]:  Yes

   Enter key password for <tomcat>
      (RETURN if same as keystore password):  [return]


Next, export the key just generated:

.. code:: bash

   oms% sudo keytool -exportcert -alias tomcat -keystore oidc.keystore -file localhost.crt


``localhost.crt`` is your public key, and every client about to call your
development server needs to be told to trust it. If you are running the
``oidc-demo.war``, this includes Tomcat itself: Java maintains a separate
keystore of trusted certificates and idoic-demo will not trust your OIDC server,
even if it happens to be running on the same Tomcat instance, unless this key is
also found within the Java trusted keystore. This is how you can import it:

.. code:: bash

   oms% sudo keytool -import -file ./localhost.crt -keystore /etc/ssl/certs/java/cacerts -alias localhost


If clients talking to a development server are located on other machines, they
will need to be configured to trust this certificate as well. This concludes the
development SSL keystore for Tomcat.


**Tomcat Configuration**

Next, Tomcat needs to be configured. Two configuration files need to be updated:
``server.xml`` and ``context.xml``.

Open ``server.xml`` for editing  as root using any text editor and make the
following changes:

Find the ``<GlobalNamingResources>`` tag, which contains only a UserDatabase
resource by default. Add your database within the <GlobalNamingResources> tag,
as follows:

.. code::

   <Resource name="jdbc/oicserver" auth="Container" type="javax.sql.DataSource"
      username="oic" password="oic"
      url="jdbc:postgresql://localhost:5432/oicserver"
      driverClassName="org.postgresql.Driver"
      initialSize="5" maxWait="5000"
      maxActive="120" maxIdle="5"
      validationQuery="select now()"
      poolPreparedStatements="true"
      testOnBorrow="true"
      testOnReturn="true" />


If (and only if) your setup manages your SSL layer at Tomcat, find the
``<Connector port="80">`` entry and comment it out. Then, uncomment the
``SSL HTTP/1.1 Connector`` entry and change it to:

.. code::

   <Connector port="443" protocol="HTTP/1.1" SSLEnabled="true"
      maxThreads="150" scheme="https" secure="true"
      keystoreFile="/etc/tomcat7/oidc.keystore" keystorePass="oickeys"
      keystoreType="JKS"
      clientAuth="false" sslProtocol="TLS" />


This is to block non-SSL traffic. At this point, save the file and exit. Now open
``context.xml`` for editing as root as well and make the following change:

Find the ``<Context>`` tag, which should be the only one there, and add the
following within:

.. code::

   <ResourceLink name="jdbc/oicserver" global="jdbc/oicserver" type="javax.sql.DataSource"/>


Save the file and exit. This concludes the Tomcat configuration needed.

**Use Of Reverse Proxies**

It is possible to use a reverse proxy such as Nginx or an Apache HTTP Server to
maintain Tomcat's SSL layer. If this is the case, ensure Tomcat is only reachable
through the loopback interface (or AJP). The exact setup needed is highly-dependent
on your target environment.

Configuring Tomcat for a reverse proxy requires the proxyName and proxyPort
parameters into your <Connector> tag. Here is an example where Tomcat runs on a
firewalled port 8080 over HTTP, but is configured for a reverse proxy listening
on port 443 with HTTPS on its behalf. Note that the SSL setup is entirely on the
reverse proxy, but the JVM running Tomcat still needs to be told to trust the
reverse proxy's SSL certificate.

.. code::

    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               URIEncoding="UTF-8"
               redirectPort="8443"
               proxyName="oms.domain.tld" <!-- Location Tomcat is reachable on from WAN. This affects the context URL reported by the server for itself. -->
               proxyPort="443"
               scheme="https" />


Please note that when integrating Java applications with a reverse proxy, it is
important to force all resources under the Java application's context to forward
to Tomcat. A Java WAR file is self-contained, enclosing all its static resources
to properly render the application within. Unless the WAR is written to externalize
static resources, redirecting them away from Tomcat based on path or MIME type has
the potential to break things. If Tomcat performance becomes an issue, consider
using a caching proxy or a load-balancer instead.

The following location file forces an Nginx server to forward all requests for the
ID3 OpenID Connect server context to Tomcat:

.. code::

   location ^~ /oidc {
        expires off;
        proxy_pass              http://127.0.0.1:8080/oidc;
   }


Deploying ID3 OpenID Connect
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ID3 OpenID Connect defines two WARs: ``oidc.war``, which is the server, and
``oidc-demo.war``, which is a sample client used to demo server functionality.
You can deploy the former only, or both.

The two WARs were either made available as binaries, or were built from source
using the instructions above. First stop the Tomcat server, if not stopped
already, clean up its deploy directory, then copy the two WARs into the Tomcat
deploy directory, ``/var/lib/tomcat7/webapps``. Finally, restart the server:

.. code:: bash

   oms% sudo /etc/init.d/tomcat7 stop
   oms% cd /var/lib/tomcat7/webapps
   oms% sudo rm -fr oidc*
   oms% sudo cp ~/project/oms-oidc/oms-oidc-server/target/oidc.war .
   oms% sudo cp ~/project/oms-oidc/oms-oidc-demo/target/oidc-demo.war .
   oms% sudo /etc/init.d/tomcat7 start


All logs are located at ``/var/lib/tomcat7/logs``, which is a symlink to
``/var/logs/tomcat7``. For a successful deployment, both the application-error and the oidc-server-errors logs
should be created but empty, and catalina.out should not contain any exceptions.

OMSChat Installation
--------------------

The OMSChat project consists of 7 WAR files, each performing a specific task. Together the files serve as a proof of concept for a Group formation as well as resource discovery.
This part of the guide deals with installation of the OMSChat WARs. There is an assumption made that you have OIDC compiled, deployed and running in *Production* mode, as integration
with downstream components is required.

The steps followed are very similar to those followed to install OIDC itself.

Build OMSChat
~~~~~~~~~~~~~

Building OMSChat is just as simple as building OIDC:

.. code:: bash

   oms% cd ~/project
   oms% git clone -b qa-develop https://github.com/IDCubed/oms-chat
   oms% cd oms-chat
   oms% mvn -Pprod clean install

In the end you should be greeted with "BUILD SUCCESSFUL" message.

Database Setup
~~~~~~~~~~~~~~

OMSChat requires certain OIDC setup. While it is possible and relatively simple to set all of this through the OIDC administrator page, it is considerably easier (and less error-prone) 
to do so with a database script.

The following is required at the OICServer database for all OMSChat installations:

.. code:: bash

   oms% psql -h localhost -U oic oicserver < insert-omschat-persona-manager.sql
   oms% psql -h localhost -U oic oicserver < insert-omschat-policy-manager.sql

The following is required for Private TCC OMSChat installations:

.. code:: bash

   oms% psql -h localhost -U oic oicserver < insert-omschat-provision.sql
   oms% psql -h localhost -U oic oicserver < insert-omschat-client.sql

The following is required for Group TCC OMSChat installations:

.. code:: bash

   oms% psql -h localhost -U oic oicserver < insert-omschat-provision.sql
   oms% psql -h localhost -U oic oicserver < insert-omschat-manager.sql

The following is required for Portal OMSChat installations:

   oms% psql -h localhost -U oic oicserver < insert-omschat-portal.sql

It is possible, though not recommended, to combine multiple different TCCs into one.

OMSChat also makes use of a database of its own called OMSChat. Setting it up is much easier as the OMSChat applications are written to set it up themselves:

   oms% su - postgres
   oms% createdb omschat
   oms% createuser omschat

Please answer ``no`` to all questions asked regarding the omschat user. Now set up the
new database for use:

.. code:: bash

   oms% psql omschat
   omschat=# \password omschat
   omschat=# CREATE EXTENSION "uuid-ossp";

Please note the last command: it loads a PostgreSQL extension from the contrib package, allowing it to generate UUIDs as needed.

This concludes the database setup needed.

Tomcat Setup
~~~~~~~~~~~~

Yet again, the two Tomcat configuration files need to be updated: ``server.xml`` and ``context.xml``.

Open ``server.xml`` for editing  as root using any text editor and make the
following changes:

Find the ``<GlobalNamingResources>`` tag and add the following tag within:

.. code::

   <Resource name="jdbc/omschat" auth="Container" type="javax.sql.DataSource"
      username="omschat" password="omschat"
      url="jdbc:postgresql://localhost:5432/omschat"
      driverClassName="org.postgresql.Driver"
      initialSize="5" maxWait="5000"
      maxActive="120" maxIdle="5"
      validationQuery="select now()"
      poolPreparedStatements="true"
      testOnBorrow="true"
      testOnReturn="true" />

Next, open ``context.xml``, find the ``<Context>`` tag and add the following within:

.. code::

   <ResourceLink name="jdbc/omschat" global="jdbc/omschat" type="javax.sql.DataSource"/>

This concludes the Tomcat setup needed.

Deploying OMSChat
~~~~~~~~~~~~~~~~~

OMSChat requires separate log4j configuration for every WAR deployed. Please pick and choose the log4j files for the WARs you will be deploying:

.. code:: bash

   oms% cd /var/lib/tomcat7/shared/classes
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-client.xml .
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-manager.xml .
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-persona-manager.xml .
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-policy-manager.xml .
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-portal.xml .
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-provision.xml .
   oms% sudo cp ~/projects/oms-chat/env/var/lib/tomcat7/shared/classes/log4j-oms-chat-rids-mock.xml .

Additionally, OMSChat requires a single property file containing TCC environment configuration:

.. code:: bash

   oms% sudo cp ~/projects/oms-oidc/env/var/lib/tomcat7/shared/classes/omschat_config.properties .

The following properties are defined within the property file:

+----------------------------------+---------------------------------------------------------------------------------------------------------+
| Property                         | Description                                                                                             |
+==================================+=========================================================================================================+
| production.oidc_url              | Location of the local OIDC for the TCC                                                                  |
+----------------------------------+---------------------------------------------------------------------------------------------------------+
| production.policy_manager_url    | Location of the local Policy Manager for the TCC                                                        |
+----------------------------------+---------------------------------------------------------------------------------------------------------+
| production.persona_manager_url   | Location of the local Persona manager for the TCC                                                       |
+----------------------------------+---------------------------------------------------------------------------------------------------------+
| production.portal_url            | Location of the Portal trusted by the local TCC                                                         |
+----------------------------------+---------------------------------------------------------------------------------------------------------+
| production.endpoint_discovery_url| Location where the local TCC's endpoint discovery service to be posted to Portal for remote TCCs.       |
+----------------------------------+---------------------------------------------------------------------------------------------------------+
| production.tab_deploy_server_url | Location of the container to accept installed TABs                                                      |
+----------------------------------+---------------------------------------------------------------------------------------------------------+

The following is a sample omschat_config.properties configuration:

.. code::

   production.oidc_url=https://localhost/oidc
   production.policy_manager_url=https://localhost/oms-chat-policy-manager
   production.provision_url=https://localhost/oms-chat-provision
   production.persona_manager_url=https://localhost/oms-chat-persona-manager
   production.portal_url=https://localhost/oms-chat-portal
   production.endpoint_discovery_url=https://localhost/oms-chat-provision/discovery
   production.tab_deploy_server_url=https://localhost

Please adjust the endpoints as needed. In particular, replace localhost with the canonical name of the machine you are installing OMSChat on.

Next, stop Tomcat and deploy the WARs you wish to install according to your target configuration:

.. code::

   oms% sudo service tomcat7 stop
   oms% cd /var/lib/tomcat7/webapps

The following WARs should be installed for all OMSChat installations:

.. code::

   oms% sudo cp ~/projects/oms-chat/oms-chat-persona-manager/target/oms-chat-persona-manager.war .
   oms% sudo cp ~/projects/oms-chat/oms-chat-policy-manager/target/oms-chat-policy-manager.war .
   oms% sudo cp ~/projects/oms-chat/oms-chat-provision/target/oms-chat-provision.war .
   oms% sudo cp ~/projects/oms-chat/oms-chat-rids-mock/target/oms-chat-rids-mock.war .

The following WAR should be installed for a Private TCC OMSChat installation:

.. code::

   oms% sudo cp ~/projects/oms-chat/oms-chat-client/target/oms-chat-client.war .

The following WAR should be installed for a Group TCC OMSChat installation:

.. code::

   oms% sudo cp ~/projects/oms-chat/oms-chat-manager/target/oms-chat-manager.war .

The following WAR should be installed for a Portal TCC OMSChat installation:

.. code::

   oms% sudo cp ~/projects/oms-chat/oms-chat-portal/target/oms-chat-portal.war .

Now start Tomcat and wait for Tomcat to deploy all WAR files copied into its webapps directory:

.. code::

   oms% sudo service tomcat7 start

The /var/lib/tomcat7/logs should contain a pair of log files for every WAR being installed, with the error one always being empty. 
There should not be any exceptions in evidence in application-error.log or catalina.out.

Please watch out for "OutOfMemoryException" and "PermGen Space" errors as those indicate either lack of swap space or too-conservative memory settings in /etc/defaults/tomcat7 set up above.

Testing Your Setup
------------------

You can test out your work by browsing to https://localhost/oidc. For a
development set up, you will see a warning that the SSL certificate used is not
trusted. This is normal. For a production setup, this would be unacceptable and
indicates problem with the SSL certificate.

The ID3 OpenID Connect Server admin page should appear. If, instead, a 404 error
page appears, the deployment of the oidc.war has failed. Open the log and
troubleshoot. If this is a development build, your server name will contain the
string *DEV*, indicating it is running against a development mock of the User
Registry. If you do not see this, or you see it for a production build, you are
running an incorrect profile for your setup.

Click Log In, then enter valid user credentials. If you used a development build, 
the RIDS Mock is stubbed and at least an administrator is defined for you to use: admin.

You are now logged in. You should see a menu on the lefthand side of your screen. 
Choose *Manage Clients*. You should see the ID3 oic-demo-client, which you imported 
by running the ``insert-oidc-demo-client.sql`` script above. Your database 
connectivity is working. Should you get an error instead, go back and rerun the SQL 
scripts above.

Next, choose the *System Scopes* menu. You should see a list of scopes defined:
offline_access, profile, openid, phone, email and address. These were imported
by the insert-system-scopes.sql script. If nothing shows, go back and rerun that
script as these scopes are required for normal operation of the server.

It is important to find out if the server is properly responding to clients
seeking to perform different operations with it. To test this, deploy the
``oidc-demo.war``. Browse to `https://localhost/oidc-demo <https://localhost/oidc-demo>`_ 
and confirm a page titled *A Simple Demo of OIC Workflows* appears. If a 404 page 
appears instead, the oidc-demo.war is not deployed, or its deployment has failed.

Choose *Start*, and you will be redirected to an authorization page of the ID3
OpenID Connect server (or a login page if not logged in from above, or have
logged out). Click Authorize. Confirm that a page with the words *Success!* at
the top appears. At this point, both the server and the client are working.

To exercise the other features of the demo client, click on ``Back`` to go back to
the main page of the OIDC-Demo client, and now the token just retrieved will be
pre-populated everywhere for you. Feel free to experiment.

This concludes testing of the ID3 OpenID Connect Server with the sample client
provided.

Development Environment Setup
-----------------------------

This section describes how to set up a development environment to code and test
changes to the ID3 OpenID Connect Server. It assumes you have familiarity with tools
used for Java development, such as Eclipse and Maven. It also assumes you have
completed this guide up to this point in full. 


Installation of Tools
~~~~~~~~~~~~~~~~~~~~~

As of the time of writing Ubuntu's Eclipse package is outdated and, while still
may be useful, is somewhat buggy.

A very quick way to get started is to simply go and download the 64-bit Linux
Spring Tools Suite (STS) from `http://www.springsource.org/eclipse-downloads <http://www.springsource.org/eclipse-downloads>`_. 
This is an environment built on top of Eclipse with Spring and other extensions. 
Right out of the box it gives a database browser, GIT integration, Spring integration, 
Maven integration and even an embedded server to test on: everything you need.


Workspace Setup
~~~~~~~~~~~~~~~

There isn't a single way to set up an Eclipse workspace, and many aspects are a
matter of personal preference. This guide will describe one way to get a fairly
functional development environment and you are encouraged to alter it to taste.


**Importing the OIDC Repository**

First, create an empty workspace at a convenient location. In Package Explorer,
right click and select Import. Expand the Maven branch and from there choose
*Existing Maven Projects*. In the dialogue that follows, choose Browse next to
the *Root Directory* textbox and browse to ``~/project/oms-oidc``, which is the
location where you cloned the OIDC repository in the very beginning of this
document. Next, expand *Advanced* and type *Eclipse* in the *Profiles* textbox.
Click Finish.
 
Eclipse will go away, detect that this is a GIT repository, and import it as such.
You should see 3 projects imported: id3-openid-connect, the aggregator project,
oms-oidc-server, which is the Server project, and oms-oidc-demo, which is the sample 
client. There might be errors, but they should gradually go away gradually as Eclipse
works. In the end you will be left with a few JSP errors for missing tag
libraries: these are safe to ignore as the oms-oidc-server project is a Maven overlay. If
this does not happen, choosing *Project* > *Clean* sometimes helps.


**Set up the Database Explorer**

Choose *Window* > *Open Perspective* > *Database Development*. In Data Source
Explorer on the left, right click on *Database Connections* and select *New...*.
From the list of databases, choose PostgreSQL. In the *Name* textbox write
*oicserver*. Choose Next. In the dialogue that follows, click the *+* button rght 
next to the *Drivers* dropdown and from the dropdown that follows, choose
*PostgreSQL JDBC Driver*. 

At this point Eclipse will be complaining that it can't find the JDBC driver.
Go to the JAR List tab. There is a JAR file already listed there, though it
doesn't exist: Eclipse simply incorrectly assumed it is somewhere within the STS
tree. Choose it and select *Remove JAR/Zip*. 

The PostgreSQL JDBC driver came with the libpostgresql-jdbc-java Ubuntu package,
not STS, and Eclipse needs to be pointed to it. Next choose *Add JAR/Zip...* and 
browse to ``/usr/share/java/postgresql.jar``. Choose the *Properties* tab. Populate 
the table you see as follows:

.. code::

   Connection URL: jdbc:postgresql://localhost:5432/oicserver 
   Database Name: oicserver
   Password: oic
   User ID: oic


Choose OK, closing the dialogue. From the previous dialogue, check off the *Save
password* checkbox and click on *Test Connection*. Confirm a message *Ping
succeeded!*. If this did not happen, either your credentials were wrong (you set
different credentials when creating the OIC user above), or the JDBC driver
failed to load. Now choose *Finish*. You should be back into the main Eclipse window 
and there should now be a single *oicserver* connection under *Database Connections* 
on the left.

In the File menu, choose *Open File...*. Then browse to ``~/projects/oms-oidc/env/database/postgresql/insert-eclipse-configuration.sql``.
Please confirm you see the database script open in a window. In the *Name*
dropdown select *oicserver* and in the *Database* dropdown select *oicserver*.
Right click anywhere in the window and choose *Execute All*. You should see all
insert statements get executed, creating the Eclipse configuration profile for
the OIDC Server to use. This is how to execute scripts from within Eclipse and
also browse the database from within the *Database Explorer*. Feel free to look
around. Please note that it is possible to create a property file as above prefixed
with ``eclipse`` and put it in Eclipse's Tomcat server classpath. OIDC supports 
configuration by either means.

This concludes the database setup. Feel free to close the database script without
saving changes.


**Setting up a Maven build**

Go to Window > Open Perspective > Other > Spring. Confirm that you are back to
the perspective when you first started Eclipse. Right click on the
*id3-openid-connect* project, choose *Run As* and choose *2 Maven build...*

Confirm that you are looking at a dialogue with a lot of things to set. In the
*Name* textbox write *ID3 OpenID Connect – Eclipse profile*. For *Goals* write 
*clean package* For *Profiles* write *Eclipse*. Please note that building with
*clean package* bypasses most of the automated testing performed with a full build.

Choose *Refresh* tab and check off *Refresh resources upon completion.*, then
select *The entire workspace*. Click on *Apply*, then click on *Run*. You will
now see your Console with the Maven output building your workspace. When it is
done, you should see *BUILD SUCCESS*.

A word of warning: what you have set up is an *Eclipse* build profile. This
profile is meant for a the STS's own Tomcat server only, as it works with SSL
completely disabled. Please do not use this profile for anything else.


**Setting Up Eclipse's Tomcat Server**

The OMS OIDC project compiles as a standalone project, but it will not deploy as one.
The OMS OIDC server is merely a set of Maven overlays on top of MITRE's OIC server
and Eclipse doesn't understand that. Eclipse will want to just copy your entire
workspace into the Tomcat hotdeply directory, and then Tomcat will complain that
half its files are missing. The setup needed is different: your Tomcat server
will need to use Maven's target directory for generating the final WAR as its
deployment directory, so that every time you generate a Maven build, Tomcat
deploys your latest code automatically. It will also need to set up that JNDI
data source all over again. Please note that if you run a Maven build while
Tomcat is running, there will be a race condition between Tomcat trying to redeploy
and Maven trying to repopulate its build target directory: for this reason and
others it is important to stop Tomcat before executing a Maven build.

In Package Explorer, expand *Servers*. You will see a server pre-defined for you
called *Vmware vFabric Server Developer Edition*. Expand it: this is just a regular
Tomcat instance, which Vmware has rebranded.

Open the embedded Tomcat ``server.xml`` for editing. Find the
``<GlobalNamingResources>`` tag and add the following within it:


.. code::

   <Resource name="jdbc/oicserver" auth="Container" type="javax.sql.DataSource"
      username="oic" password="oic"
      url="jdbc:postgresql://localhost:5432/oicserver"
      driverClassName="org.postgresql.Driver"
      initialSize="5" maxWait="5000"
      maxActive="120" maxIdle="5"
      validationQuery="select now()"
      poolPreparedStatements="true"
      testOnBorrow="true"
      testOnReturn="true" />


Save the file and close it. Now open the embedded Tomcat's context.xml for editing,
find the <Context> tag and put the following within it:

.. code::

   <ResourceLink name="jdbc/oicserver" global="jdbc/oicserver" type="javax.sql.DataSource"/>


Save the file again and close it.

Now put the PostgreSQL JDBC driver in Tomcat's path: in the Servers tab in the
lower-left corner, double-click the *Vmware vFabric tc Server Developer Edition*
entry. Find the *Open launch configuration* hyperlink and click on it. Click the
*Classpath* tab, then click on User Entries and then click on the *Add External
JARs* button. Browse to /usr/share/java/postgresql.jar and click *OK*. Then click
*Apply* and OK. 

Back in the Eclipse main window, click on the *Modules* subtab. Click *Add
External Web Module...*. Click on the *Browse* button next to *Document base:*
and browse to ~/projects/oms-oidc/oms-oidc-server/target/oidc. For *Path* type /oidc.
Make sure *Auto reload* is checked off and click OK. Again, click on *Add External
Web Module...*. Again, click on *Browse* and this time browse to
~/projects/oms-oidc/oms-oidc-demo/target/oidc-demo. Again, make sure *Auto reload* is
checked off and click OK. Choose File > Save.

The Eclipse-embedded Tomcat is configured. Go back to the Server view in the
lower-left corner, right click on the *Vmware vFabric tc Server Developer Edition*
and choose *Start*. You will see Tomcat starting up. You should not see any errors,
though you will see Tomcat complaining that log4j is not initialized. This is
normal, feel free to configure Tomcat's log4j if you prefer, though the default already 
logs DEBUG output to the console so that Eclipse will show them. There is no need to create
a oidc_config.properties file, the database script ran above configures the
server via its database.

In the toolbar at the top click on the globe icon (Open Web Browser). You will
see a very simple web browser window opening within Eclipse.

From here you can go to `http://localhost:8080/oidc/ <http://localhost:8080/oidc/>`_ 
for the OIDC server and `http://localhost:8080/oidc-demo/ <http://localhost:8080/oidc-demo/>`_ 
for the sample client. Note that there is no HTTPS on either link: this is not a server 
you would want to do anything other than local testing on.
 
Feel free to execute the *Testing Your Setup* tests above to validate that
everything is working as it should. In order to redeploy, simply stop the server,
start a Maven build using the profile created above, and restart Tomcat: it will
pick up its external web module changing and reload the directory. In order to
debug, simply right-click on the server and choose *Debug* instead of *Start* and
Eclipse will take care of the rest.


**Remote-Debugging Tomcat With Eclipse**

Go back to the Terminal and open the /etc/default/tomcat7 file for editing. Then
uncomment the following lines:

.. code::

   JAVA_OPTS="${JAVA_OPTS} -Xdebug -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n"


Tomcat's remote debug port is 8000. Now restart Tomcat:

.. code:: bash

   oms% sudo /etc/init.d/tomcat7 restart

Now, go back to Eclipse to tell Eclipse to create a Remote Debug configuration:
Find the ``Debug`` button and click on the drop-down arrow on its right. Choose
``Debug Configurations...`` from the menu. Find ``Remote Java Application`` on the
list of options to the left of the dialog. Right click on it and select ``New``.
A new remote debug configuration appears. Make sure the remote debug host and
remote debug port are set correctly. Make sure the project is set to ``oms-oidc-server``.
Call this debug configuration something meaningful and click on ``Apply``.

By clicking Debug, Eclipse will connect to your Tomcat's port 8000 and start
debugging the ID3 OpenID Connect application remotely. At this point feel free
to set breakpoints and interact with the Tomcat server. Upon hitting a breakpoint,
Eclipse will prompt you to change to the Debug perspective and allow you to debug
the server normally.

.. note::

   Remote debugging, like any other debugging, requires the project to be compiled
   with line numbers embedded. Maven compiles the project with debug information
   by default, but if this is changed your breakpoints will not trigger. Also, it
   is up to you to ensure your source code aligns with the code running on Tomcat
   as breakpoints trip based on line numbers within the source.

**Performance Monitoring With JMX**

JMX allows tools such as Oracle's own JConsole to connect and report on monitors set 
within the code. This gives you a real-time insight into how the server operates and
how healthy it is. OIDC implements a large number of monitors, mostly meant for
performance monitoring, and this is on top of what Tomcat and the JVM monitor already.
OIDC's performance monitoring is entirely implemented in a single class: AccessMetricsAspect, 
an aspect designed to intercept most calls to Spring MVC and Framework request handlers, 
and measure some useful statistics about them. The underlying library doing all the data 
gathering and analysis can also log to Graphite, but JMX also allows you to monitor Tomcat 
and JVM as well as OIDC.

This is how to enable JMX monitoring:

First and foremost, open oidc_config.properties for editing and ensure the 
*metrics.useJMXReporting* property is set to *true*. Having the *useGraphiteReporting* property
also set to *true* is not a problem, the two are not mutually-exclusive.

Second, tell the JVM running Tomcat to enable JMX monitoring: open */etc/defaults/tomcat7*
for editing and add the following lines at the very end. This is an example of how this
file should look:

.. code::

   TOMCAT7_USER=tomcat7
   TOMCAT7_GROUP=tomcat7
   JAVA_OPTS="-Djava.awt.headless=true -Xmx128m -XX:+UseConcMarkSweepGC"
   JAVA_OPTS="${JAVA_OPTS} -Xdebug -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n"

   JMX_PORT=12121
   JAVA_OPTS="${JAVA_OPTS} -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=${JMX_PORT} -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=false"

This will open port 12121 for tools such as JConsole to connect on localhost only. If
you wish to monitor Tomcat remotely, you would want to enable authentication as well as SSL.
Please note that JConsole can do a lot more than just monitor health, so failing to secure the
JMX port on a production server can result in your server being compromised. Please consult 
Tomcat's own documentation regarding how to do this.

Third, restart Tomcat.

Fourth and final, open a terminal and type ``jconsole``. When prompted, choose the 
*Remote Process* radio-button and type *localhost:12121* in the text field below. 
Then click *Connect* and confirm the attempt to connect to an unsecured JMX port.

You should be looking at a window with four graphs representing the JVM's monitor and
resource usage. Feel free to look around. The OIDC metrics should be visible on the ``MBeans`` 
tab under ``metric``. These are the same metrics being reported to Graphite as well.

**Optional Setup**

It is sometimes useful to have the MITRE OIC Source right along the ID3 OpenID
Connect one. In addition to letting you reverse engineer MITRE's implementation,
it also allows you to step thrugh MITRE's piece of the logic whenever things don't
work as expected.

From Window > Open Perspective > Other choose the *GIT Repository Exploring*
perspective. There will be a single repository loaded there already, the IDOIC one,
the one imported above. Creating a second one:

Choose the forth icon from the left on the *Git Repositories* view: *Clone a Git
Repository and add the clone to this view*. Choose URI from the list on the dialog
and click Next. Enter the following URI in the URI textbox: `https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server.git <https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server.git>`_. Leave everything else blank. Click Next. 

Uncheck everything except the latest release branch: release-1.0.9 is the one to
show up at the time of writing this. Choose Finish. At this time there will see
the second repository being cloned, and once this completes, your *Git Repositories*
view will have two repositories listed. Note that all the source was loaded at ~/git.

Go back to the Spring perspective (Window > Open Perspective > Other > Spring),
right click in the Package explorer and choose *Import*. Under the Maven branch,
choose *Existing Maven projects* and then *Next*. For Root directory, choose Browse
and browse to the location the new GIT repository get cloned into: ~/git/OpenID-Connect-Java-Spring-Server. Click OK and Finish.

There will now be 4 more projects imported. There may be errors briefly, but they
should clear by the time Spring is done loading the projects. As you debug, you
may encounter a dialog where Eclipse asks you to attach source. Click on *Attach
Source* and browse to the openid-connect-common or openid-connect-client projects
to attach the source and you will be able to step through the source code.

This concludes this guide.
