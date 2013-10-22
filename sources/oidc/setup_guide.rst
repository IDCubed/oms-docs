:title: System Setup
:description: How to Build, Set Up, Deploy And Run The ID3 OIDC Server 
:keywords: oms, oidc, setup


.. _setup_guide:

System Setup
============

This guide covers deployment of an ID3 OpenID Connect Server on a brand new Ubuntu 12.04 LTS Linux host. Installation on other flavours of Linux as well other versions of Ubuntu is not supported, though may be possible with modification to the steps below. Installation on existing Ubuntu 12.04 LTS hosts is also possible, though can be risky. Installation on operating systems other than Linux, such as MacOS or Windows, may also be possible, but will require an in-depth knowledge of the host operating system. It is up to the the reader to ensure the following steps are followed correctly and to make any alterations to them that may be needed for a pericular setup.

This guide has been tested on a newly-installed Kubuntu 12.04.2 LTS with only the default packages loaded.


Building ID3 OpenID Connect
---------------------------

This section is included in case the reader is building the software from source. In case there are pre-built WARs available for the ID3 OpenID Connect server, please skip ahead.

The following tools are needed to compile the ID3 OpenID Connect Server from source: GIT, Maven and Java. An active Internet connection at all time to build the software is required.

Build Environment Setup
~~~~~~~~~~~~~~~~~~~~~~~

It is assumed that you have a functional Ubuntu 12.04 installation and you have basic familiarity using it. Please, open a terminal window. The following installs the tools needed to install needed to build the software:

::

   sudo apt-get install git
   sudo apt-get install maven
   sudo apt-get install openjdk-6-jre-headless
   sudo apt-get install openjdk-6-jdk

When asked, enter a valid password, as well as confirm installation the potentially large number of dependencies the APT command deems necessary. The exact list will vary and will depend on the exact packages installed during installation of Ubuntu. If this is a fresh Ubuntu installation please type:

::

   sudo apt-get update
   
This will force APT to update its internal database of available packages and will ensure the latest stable versions are being installed.

Next, several environment variables need to be defined to help build the software:

Become root and open /etc/environment for editing using your favourite text editor. Add the following new variables:

::

   export JAVA_HOME=”/usr/lib/jvm/java-6-openjdk-amd64”
   export JRE_HOME=”/usr/lib/jvm/java-6-openjdk-amd64/jre”
   
Save the newly-edited file and load it into the system environment:

::

   source /etc/environment
   
At this point the following commands should return output very similar to the following:

::

   kangelov@shadow:~$ git --version
   git version 1.7.9.5
   kangelov@shadow:~$ mvn -version
   Apache Maven 3.0.4
   Maven home: /usr/share/maven
   Java version: 1.6.0_27, vendor: Sun Microsystems Inc.
   Java home: /usr/lib/jvm/java-6-openjdk-amd64/jre
   Default locale: en_US, platform encoding: UTF-8
   OS name: "linux", version: "3.2.0-43-generic", arch: "amd64", family: "unix"
   kangelov@shadow:~$ java -version
   java version "1.6.0_27"
   OpenJDK Runtime Environment (IcedTea6 1.12.5) (6b27-1.12.5-0ubuntu0.12.04.1)
   OpenJDK 64-Bit Server VM (build 20.0-b12, mixed mode)
   kangelov@shadow:~$ echo $JAVA_HOME
   /usr/lib/jvm/java-6-openjdk-amd64
   kangelov@shadow:~$ echo $JRE_HOME
   /usr/lib/jvm/java-6-openjdk-amd64/jre
   kangelov@shadow:~$ 
   
“Command not found” to any of the commands above, or any variables not defined as expected, indicate something is not quite right. Please go back and correct the problem.

Cloning the GIT Repository
~~~~~~~~~~~~~~~~~~~~~~~~~~

At this point you are ready to get a copy of the latest source code to build. At the time of writing the latest source code is located in the t520-idoic-rebase branch, and should be cloned from there.

::

   mkdir ~/project
   cd ~/project
   git clone -b qa-develop https://github.com/IDCubed/idoic.git
   
As of the time of writing idoic is a private repository and requires a valid username and password with access to the project. Upon providing valid credentials, the GIT command will copy the entire repository under ~/projects/idoic.

Building the ID3 OpenID Connect Server and Client
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Building the idoic repository is straightforward with Maven doing the bulk of the work for you. The idoic maven scripts provides two build profiles: prod and dev. Prod is the production profile with full integration to the User Registry. It is meant for production environments, or testing environments where full end-to-end integration is possible. The Dev is the development build profile, which substitutes a development stub for the User Registry. The development profile is best suited for unit-testing local changes.

For a Production build profile type the following:

::

   cd ~/project/idoic
   mvn -P prod clean install
   
For a Development build profile type the following:

::

   cd ~/project/idoic
   mvn -P dev clean install
   
In both cases a very large number of dependencies being downloaded the first time a full build runs, finishing with a BUILD SUCCESS message. In case the build fails dependencies may have failed to download. In this case please check your Internet connection and retry. The build script also runs a very comprehensive automatic testing suite, which includes deploying the fully-assembled WAR on an embedded servlet container, and running tests against it. If the integration test phase fails, please check that ports 18080 and 18081 are not used by anything else as the build script runs embedded servlet containers there. 

The build script produces two WAR files: 

* ~/project/idoic/idoic-server/target/idoic.war is the ID3 OpenID Connect Server itself.
* ~/project/idoic-demo/target/idoic-demo.war is a sample demo client used to drive the server. Please do not deploy it in a Production environment.

Some JAR artifacts are also produced:

* ~/project/idoic/idoic-server/target/idoic-sources.jar is a JAR with the packaged sources.
* ~/project/idoic/idoic-server/target/idoic-javadoc.jar is a JAR with the packaged Javadoc documentation.
* ~/project/idoic/idoic-demo/target/idoic-demo-javadoc.jar is a JAR with the packaged Javadoc documentation of the sample client.

Finally, the output of all automated tests can be revewed at:

* ~/project/idoic/idoic-server/target/surefire-reports is where Maven's SureFire plugin stores all its logs. A passed test will log very little information apart from the fact that it passed. A failed test logs detailed output and causes the entire build to fail.

Please note that a lot of tests, particuarly those testing security-sensitive APIs, perform a lot of negative testing: exceptions and errors in the output are a normal and expected behaviour. The build script is set to look for any expected errors and will fail whenever an unexpected error is detected, or if any of the expected errors does not occur.

Deployment of ID3 OpenID Connect
--------------------------------

This section covers installation and set up needed to your Ubuntu 12.04 LTS host in order to run the ID3 OpenID Connect software, both client and server. It is assumed an idoic.war file and, optionally, an idoic-demo.war are available: either built from source, or made available as pre-built binaries.

Installation of Software
~~~~~~~~~~~~~~~~~~~~~~~~

ID3 OpenID Connect requires a servlet container such as Tomcat, as well as a database. Both have to be installed and configured appropriately before the idoic.war and the idoic-demo.war files would deploy.

The following packages need to be installed for a supported configuration:

::

   sudo apt-get install tomcat7
   sudo apt-get install postgresql
   sudo apt-get install libpostgresql-jdbc-java

Apart from PostgreSQL, at the time of writing the IDOIC server has been known to work with MySQL, HyperSQL and Derby. Neither of these alternative configurations is supported for production use, is maintained, or receives any attention in testing.

PostgreSQL Setup
~~~~~~~~~~~~~~~~

The PostgreSQL setup needed is straightforward:

Starting as a root user, type:

::

   su - postgres
   createdb oicserver
   createuser oic

Please answer "no" to all questions asked regarding the oic user. Now set up the new database for use:

::

   psql oicserver
   \password oic
   
Enter password of "oic" and confirm it. Now type the following to extend all access on the oicserver database to the oic user.

::

   grant all privileges on database oicserver to oic;
   
Now press CTRL+D to exit. A brand new database and user for the ID3 OpenID Connect Server is now defined. The rest of the PostgreSQL setup can be handled with scripts:

*WARNING* the following scripts run as the oic user on the oicserver database!

::

   cd ~/project/idoic/env/database/postgresql
   psql -h localhost -U oic oicserver < create-oicserver-database.sql
   psql -h localhost -U oic oicserver < insert-system-scopes.sql
   psql -h localhost -U oic oicserver < insert-idoic-demo-client.sql
   
Please enter a password of "oic" every time. This concludes the database setup.

Tomcat Setup
~~~~~~~~~~~~

Tomcat requires a few environment variables of its own. Open /etc/environment for editing as root using your favourite text editor and add the following:

::

   export CATALINA_HOME=”/usr/share/tomcat7”
   export CATALINA_BASE=”/var/lib/tomcat7”
   
Now source the file into the currently-active environment:

::

   source /etc/environment
   
Tomcat is started immediately upon installation: open a web browser on your host machine (feel free to install the lynx or links packages if X is not available) and go to “http://localhost:8080”. The “It works !” message should appear. Upon confirming it was installed correctly and it runs, Tomcat needs to be shut down for further configuration:

::

   sudo /etc/init.d/tomcat7 stop
   
Next, the Tomcat server needs to be modified to run on a port lower than 1024. On all Unix-based platforms except MacOS, ports lower than 1024 can only be opened as root, so Tomcat needs to be told to drop root after opening the server socket for itself. Open /etc/default/tomcat7 for editing, and locate the AUTHBIND line at the very end, which is commented out by default. Uncomment it and change it to “yes”.

::

   AUTHBIND=yes
   
Ubuntu's firewall needs to have a few ports open to allow Tomcat traffic in. This is critical for Production installations. For Development installations you may choose to skip this.

::

   sudo ufw allow 443
   
The Tomcat server needs to be configured with a data source to PostgreSQL just defined above, but first it needs to be told where to find the JDBC driver for it:

::

   cd /var/lib/tomcat7/server
   sudo ln -s /usr/share/java/postgresql.jar postgresql.jar 
   
Every JAR in the server directory is being loaded as the Tomcat server starts up. This driver will be present as Tomcat parses its configuration, but will not be made available to any application deployed within. This is deliberate as the database data source is only expected to be available as a JNDI resource. 

Once ID3 OpenID Connect is deployed, it will need to be told where and how to do its logging. Logging is highly environment-dependent, which is why the server's configuration is not being packaged within the WAR, but rather introduced into the server's classpath by Tomcat. If this step is skipped or not working correctly, you will see IDOIC logging into the general Tomcat log, which is not recommended.

::

   cd /var/lib/tomcat7/shared/classes
   sudo cp ~/projects/idoic/env/var/lib/tomcat7/shared/classes/log4j.xml .
   
Feel free to examine the file and adjust according to your needs. For example, for a development setup, you might want to change minimum log levels to DEBUG.

At this time the server configuration also needs to be created. The server supports two different configuration mechanisms: one uses a property file and the other uses a database table. The propert file option will be discussed here and is the preferred as the server will not require its database to be up and running to initialize on Tomcat.

The ID3 OpenID Connect Server looks for a property file called idoic_config.properties at /var/lib/tomcat7/shared/classes, containing the following properties. 

Every property should be prefixed by "production." for a production-profile server and "development." for a development-profile server. 

+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Property                              | Description                                                                                                                                                                                |
+=======================================+============================================================================================================================================================================================+
| configBean.issuer                     | The URL your server responds to. This is the URL your clients call and will be validated by the server. In a reverse-proxy environment, this will be the location of the reverse proxy.    |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| configBean.logoImageUrl               | Path to the logo displayed on all IDOIC web pages.                                                                                                                                         |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| configBean.topbarTitle                | Title displayed next to the logo on all IDOIC web pages.                                                                                                                                   |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| userRegistry.serverURL                | The URL to the User Registry. This property is not used by a server built with the development profile, but a value for it is still required.                                              |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| userRegistry.authUsername             | Username your IDOIC server uses to authenticate against the User Registry. This property is not used by a server built with the development profile, but a value for it is still required. |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| userRegistry.authPassword             | Password your IDOIC server uses to authenticate against the User Registry. This property is not used by a server built with the development profile, but a value for it is still required. |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| userRegistry.userInfoEndPoint         | User Information endpoint relative to the serverURL entered above.                                                                                                                         |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| userRegistry.allPersonasEndPoint      | Persona endpoint relative to the serverURL entered above.                                                                                                                                  |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| userRegistry.selectedPersonasEndPoint | Persona search endpoint relative to the serverURL entered above. This is usually a variation of the general persona endpoint above.                                                        |
+---------------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

This is a sample configuration for a production-profile server:

::

   production.configBean.issuer=https://localhost/idoic/
   production.configBean.logoImageUrl=resources/images/mustardseed-composite_3_small.png
   production.configBean.topbarTitle=ID3 OpenID Connect Server
   production.userRegistry.serverUrl=https://localhost/
   production.userRegistry.authUsername=ignored
   production.userRegistry.authPassword=ignored
   production.userRegistry.loginEndPoint=/private_registry/api/v1/coreIDs/%username%/
   production.userRegistry.userInfoEndPoint=/private_registry/api/v1/personas/userInfo/
   production.userRegistry.allPersonasEndPoint=/private_registry/api/v1/personas/?limit=0
   production.userRegistry.selectedPersonasEndPoint=/private_registry/api/v1/personas/set/%personaList%/?limit=0   
   
This is a sample configuration for a development-profile server:
Please note that a development-profile server ignores all userRegistry properties as the server is set to run against a development mock of the User Registry and does not integrate with a live User Registry. 

::

   development.configBean.issuer=https://localhost/idoic/
   development.configBean.logoImageUrl=resources/images/mustardseed-composite_3_small.png
   development.configBean.topbarTitle=ID3 OpenID Connect Server *DEV*
   development.userRegistry.serverUrl=ignored
   development.userRegistry.authUsername=ignored
   development.userRegistry.authPassword=ignored
   development.userRegistry.loginEndPoint=ignored
   development.userRegistry.userInfoEndPoint=ignored
   development.userRegistry.allPersonasEndPoint=ignored
   development.userRegistry.selectedPersonasEndPoint=ignored

In both cases, every option set to "ignored" is required to be present, but its value is ignored. Feel free to set the these values as desired, at the very minimum you will need to update the configBean.issuer and userRegistry.serverUrl properties for your setup.

It is highly recommended that ID3 OpenID Connect server runs within an SSL layer. If this part of the setup is neglected, all credentials and tokens being exchanged will be visible to all, as well as the final system as a whole would be vulnerable to man-in-the-middle attacks.

For a production setup where Tomcat maintains its own SSL layer, you will require an SSL certificate signed by a well-known and accepted Certificate Authority, such as GoDaddy and Verisign. For a development setup you only require a certificate acceptable to your local machine, and the cost of obtaining a valid SSL certificate is not justified. The two setups are discussed separately below:

*Production SSL Setup For Tomcat*

This is how IDCubed creates the SSL certificates for Tomcat with GoDaddy. First, a new keystore is created with a new key:

::

   cd /etc/tomcat7
   sudo keytool -keysize 2048 -genkey -alias tomcat -keyalg RSA -keystore idoic.keystore

   Enter keystore password: oickeys
   Re-enter new password: oickeys
   What is your first and last name?
      [Unknown]:  *.idcubed.org
   What is the name of your organizational unit?
      [Unknown]:
   What is the name of your organization?
      [Unknown]:  IDCubed
   What is the name of your City or Locality?
      [Unknown]:  Cambridge
   What is the name of your State or Province?
      [Unknown]:  Massachusetts
   What is the two-letter country code for this unit?
      [Unknown]:  US
   Is CN=*.idcubed.org, OU=Unknown, O=IDCubed, L=Cambridge, ST=Massachusetts, C=US correct?
      [no]:  Yes

   Enter key password for <tomcat>
      (RETURN if same as keystore password):  [return]
      
Next, next the CSR from the keystore is exported and sent to GoDaddy to sign:

::

   sudo keytool -certreq -keyalg RSA -alias tomcat -file idcubed.org.csr -keystore idoic.keystore
   
The signed CSR comes back as idcubed.org.crt, and should be saved at /etc/tomcat7.

A few more certificates are needed. Browse to `https://certs.godaddy.com/anonymous/repository.seam?cid=352580 <https://certs.godaddy.com/anonymous/repository.seam?cid=352580>`_ and download the following files:

* valicert_class2_root.crt
* gd_cross_intermediate.crt
* gd_intermediate.crt

All 3 files should be saved at /etc/tomcat7 as well. All 4 files should be imported into Tomcat's keystore as follows:

::

   sudo keytool -import -alias root -keystore idoic.keystore -trustcacerts -file valicert_class2_root.crt

   sudo keytool -import -alias cross -keystore idoic.keystore -trustcacerts -file gd_cross_intermediate.crt

   sudo keytool -import -alias intermed -keystore idoic.keystore -trustcacerts -file gd_intermediate.crt
   
   sudo keytool -import -alias tomcat -keystore idoic.keystore -file idcubed.org.crt

With this, your production SSL keystore is ready for Tomcat.

Finally, the JVM running Tomcat needs to be told to trust Tomcat's SSL certificate as well, or the server will fail to integrate with its User Registry:

::

   sudo keytool -import -alias tomcat -keystore /etc/ssl/certs/java/cacerts -file idcubed.org.crt
   
*Development SSL Setup For Tomcat:*

This setup is intended for development purposes only. If used in a Production machine, clients will fail talking to the server with a “no trusted SSL certificate found” error.

First create a new keystore with a new certificate , putting the word “localhost” or your development machine's fully-qualified domain name for “first and last name”. This is important as clients will be checking if the certificate name corresponds to the name of the machine being called. 

::

   cd /etc/tomcat7
   sudo keytool -keysize 2048 -genkey -alias tomcat -keyalg RSA -keystore idoic.keystore

   Enter keystore password: oickeys
   Re-enter new password: oickeys
   What is your first and last name?
      [Unknown]:  localhost
   What is the name of your organizational unit?
      [Unknown]:
   What is the name of your organization?
      [Unknown]:  IDCubed
   What is the name of your City or Locality?
      [Unknown]:  Cambridge
   What is the name of your State or Province?
      [Unknown]:  Massachusetts
   What is the two-letter country code for this unit?
      [Unknown]:  US
   Is CN=localhost, OU=Unknown, O=IDCubed, L=Cambridge, ST=Massachusetts, C=US correct?
      [no]:  Yes

   Enter key password for <tomcat>
      (RETURN if same as keystore password):  [return]
      
Next, export the key just generated:

::

   sudo keytool -exportcert -alias tomcat -keystore idoic.keystore -file localhost.crt
   
Localhost.crt is your public key, and every client about to call your development server needs to be told to trust it. If you are running the idoic-demo.war, this includes Tomcat itself: Java maintains a separate keystore of trusted certificates and idoic-demo will not trust your IDOIC server, even if it happens to be running on the same Tomcat instance, unless this key is also found within the Java trusted keystore. This is how you can import it:

::

   sudo keytool -import -file ./localhost.crt -keystore /etc/ssl/certs/java/cacerts -alias localhost
   
If clients talking to a development server are located on other machines, they will need to be configured to trust this certificate as well. This concludes the development SSL keystore for Tomcat.

*Tomcat Configuration*

Next, Tomcat needs to be configured. Two configuration files need to be updated: server.xml and context.xml.

Open server.xml for editing  as root using any text editor and make the following changes:

Find the <GlobalNamingResources> tag, which contains only a UserDatabase resource by default. Add your database within the <GlobalNamingResources> tag, as follows:

::

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
   
If (and only if) your setup manages your SSL layer at Tomcat, find the <Connector port=”80”> entry and comment it out. Then, uncomment the “SSL HTTP/1.1 Connector” entry and change it to:

::

   <Connector port="443" protocol="HTTP/1.1" SSLEnabled="true"
      maxThreads="150" scheme="https" secure="true"
      keystoreFile="/etc/tomcat7/idoic.keystore" keystorePass="oickeys"
      keystoreType="JKS"
      clientAuth="false" sslProtocol="TLS" />
   
This is to block non-SSL traffic. 

At this point, save the file and exit.

Now open context.xml for editing as root as well and make the following change:

Find the <Context> tag, which should be the only one there, and add the following within:

::

   <ResourceLink name="jdbc/oicserver" global="jdbc/oicserver" type="javax.sql.DataSource"/>
   
Save the file and exit. This concludes the Tomcat configuration needed.

*Use Of Reverse Proxies*

It is possible to use a reverse proxy such as Nginx or an Apache HTTP Server to maintain Tomcat's SSL layer. If this is the case, ensure Tomcat is only reachable through the loopback interface (or AJP). The exact setup needed is highly-dependent on your target environment.

Configuring Tomcat for a reverse proxy requires the proxyName and proxyPort parameters into your <Connector> tag. Here is an example where Tomcat runs on a firewalled port 8080 over HTTP, but is configured for a reverse proxy listening on port 443 with HTTPS on its behalf. Note that the SSL setup is entirely on the reverse proxy, but the JVM running Tomcat still needs to be told to trust the reverse proxy's SSL certificate.

::

    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               URIEncoding="UTF-8"
               redirectPort="8443"
               proxyName="two.idhypercubed.org" <!-- Location Tomcat is reachable on from WAN. This affects the context URL reported by the server for itself. -->
               proxyPort="443"
               scheme="https" />

Please note that when integrating Java applications with a reverse proxy, it is important to force all resources under the Java application's context to forward to Tomcat. A Java WAR file is self-contained, enclosing all its static resources to properly render the application within. Unless the WAR is written to externalize static resources, redirecting them away from Tomcat based on path or MIME type has the potential to break things. If Tomcat performance becomes an issue, consider using a caching proxy or a load-balancer instead.

The following location file forces an Nginx server to forward all requests for the ID3 OpenID Connect server context to Tomcat:

::

   location ^~ /idoic {
        expires off;
        proxy_pass              http://127.0.0.1:8080/idoic;
   }
 
Deploying ID3 OpenID Connect
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ID3 OpenID Connect defines two WARs: idoic.war, which is the server, and idoic-demo.war, which is a sample client used to demo server functionality. You can deploy the former only, or both.

The two WARs were either made available as binaries, or were built from source using the instructions above. First stop the Tomcat server, if not stopped already, clean up its deploy directory, then copy the two WARs into the Tomcat deploy directory, /var/lib/tomcat7/webapps. Finally, restart the server:

::

   /etc/init.d/tomcat7 stop
   cd /var/lib/tomcat7/webapps
   rm -fr idoic*
   cp ~/project/idoic/idoic-server/target/idoic.war .
   cp ~/project/idoic/idoic-demo/target/idoic-demo.war .
   /etc/init.d/tomcat7 start
   
All logs are located at /var/lib/tomcat7/logs, which is a symlink to /var/logs/tomcat7. For a successful deployment, the idoic-server-errors log should be created, but empty.

Testing Your Setup
~~~~~~~~~~~~~~~~~~

You can test out your work by browsing to `https://localhost/idoic <https://localhost/idoic>`_. For a development set up, you will see a warning that the SSL certificate used is not trusted. This is normal. For a production setup, this would be unacceptable and indicates problem with the SSL certificate.

The ID3 OpenID Connect Server admin page should appear. If, instead, a 404 error page appears, the deployment of the idoic.war has failed. Open the log and troubleshoot. If this is a development build, your server name will contain the string *DEV*, indicating it is running against a development mock of the User Registry. If you do not see this, or you see it for a production build, you are running an incorrect profile for your setup.

Click About, then Log In, then enter valid user credentials. If you used a development build, the User Registry is stubbed and two users were defined for you to use: admin and user. Both users will accept an arbitrary password.

You are now logged in. Click on About again, and you should see a menu on the lefthand side of your screen. Choose “Manage Clients”. You should see the id3-oic-demo-client, which you imported by running the insert-idoic-demo-client.sql script above. Your database connectivity is working. Should you get an error instead, go back and rerun the SQL scripts above.

Next, choose the “System Scopes” menu. You should see a list of scopes defined: offline_access, profile, openid, phone, email and address. These were imported by the insert-system-scopes.sql script. If nothing shows, go back and rerun that script as these scopes are required for normal operation of the server.

It is important to find out if the server is properly responding to clients seeking to perform different operations with it. To test this, deploy the idoic-demo.war. Browse to `https://localhost/idoic-demo <https://localhost/idoic-demo>`_ and confirm a page titled “A Simple Demo of OIC Workflows” appears. If a 404 page appears instead, the idoic-demo.war is not deployed, or its deployment has failed.

Choose “Start”, and you will be redirected to an authorization page of the ID3 OpenID Connect server (or a login page if not logged in from above, or have logged out). Click Authorize. Confirm that a page with the words “Success!” at the top appears. At this point, both the server and the client are working.

To exercise the other features of the demo client, click on "Back" to go back to the main page of the IDOIC-Demo client, and now the token just retrieved will be pre-populated everywhere for you. Feel free to experiment.

This concludes testing of the ID3 OpenID Connect Server with the sample client provided.

Development Environment Setup
-----------------------------

This section describes how to set up a development environment to code and test changes to the ID3 OpenID Connect Server. It assumes you have familiarity with tools used for Java development, such as Eclipse and Maven. It also assumes you have completed this guide up to this point in full. 

Installation of Tools
~~~~~~~~~~~~~~~~~~~~~

As of the time of writing Ubuntu's Eclipse package is outdated and, while still may be useful, is somewhat buggy.

A very quick way to get started is to simply go and download the 64-bit Linux Spring Tools Suite (STS) from `http://www.springsource.org/eclipse-downloads <http://www.springsource.org/eclipse-downloads>`_. This is an environment built on top of Eclipse with Spring and other extensions. Right out of the box it gives a database browser, GIT integration, Spring integration, Maven integration and even an embedded server to test on: everything you need.

Workspace Setup
~~~~~~~~~~~~~~~

There isn't a single way to set up an Eclipse workspace, and many aspects are a matter of personal preference. This guide will describe one way to get a fairly functional development environment and you are encouraged to alter it to taste.

*Importing the IDOIC Repository*

First, create an empty workspace at a convenient location. In Package Explorer, right click and select Import. Expand the Maven branch and from there choose “Existing Maven Projects”. In the dialogue that follows, choose Browse next to the “Root Directory” textbox and browse to ~/project/idoic, which is the location where you cloned the IDOIC repository in the very beginning of this document. Next, expand “Advanced” and type “Eclipse” in the “Profiles” textbox. Click Finish.
 
Eclipse will go away, detect that this is a GIT repository, and import it as such. You should see 3 projects imported: id3-openid-connect, the aggregator project, idoic, which is the Server project, and idoic-demo, which is the sample client. There might be errors, but they should gradually go away gradually as Eclipse works. In the end you will be left with a few JSP errors for missing tag libraries: these are safe to ignore as the idoic project is a Maven overlay. If this does not happen, choosing Project > Clean helps.

*Set up the Database Explorer*

Choose Window > Open Perspective > Database Development. In Data Source Explorer on the left, right click on “Database Connections” and select “New...”. From the list of databases, choose PostgreSQL. In the “Name” textbox write “oicserver”. Choose Next. In the dialogue that follows, click the “+” button right next to the “Drivers” dropdown and from the dropdown that follows, choose “PostgreSQL JDBC Driver”. 

At this point Eclipse will be complaining that it can't find the JDBC driver. Go to the JAR List tab. There is a JAR file already listed there, though it doesn't exist: Eclipse simply incorrectly assumed it is somewhere within the STS tree. Choose it and select “Remove JAR/Zip”. 

The PostgreSQL JDBC driver came with the libpostgresql-jdbc-java Ubuntu package, not STS and Eclipse needs to be pointed Eclipse to it. Next choose “Add JAR/Zip...” and browse to /usr/share/java/postgresql.jar. Choose the “Properties” tab. Populate the table you see as follows:

::

   Connection URL: jdbc:postgresql://localhost:5432/oicserver 
   Database Name: oicserver
   Password: oic
   User ID: oic

Choose OK, closing the dialogue. From the previous dialogue, check off the “Save password” checkbox and click on “Test Connection”. Confirm a message “Ping succeeded!”. If this did not happen, either your credentials were wrong (you set different credentials when creating the OIC user above), or the JDBC driver failed to load. Now choose “Finish”. You should be back into the main Eclipse window and there should now be a single “oicserver” connection under “Database Connections” on the left.

In the File menu, choose “Open File...”. Then browse to ~/projects/idoic/env/database/postgresql/insert-eclipse-configuration.sql. Please confirm you see the database script open in a window. In the “Name” dropdown select “oicserver” and in the “Database” dropdown select “oicserver”. Right click anywhere in the window and choose “Execute All”. You should see all insert statements get executed, creating the Eclipse configuration profile for the IDOIC Server to use. This is how to execute scripts from within Eclipse and also browse the database from within the “Database Explorer”. Feel free to look around.

This concludes the database setup. Feel free to close the database script without saving changes.

*Setting up a Maven build*

Go to Window > Open Perspective > Other > Spring. Confirm that you are back to the perspective when you first started Eclipse. Right click on the “id3-openid-connect” project, choose “Run As” and choose “2 Maven build...”

Confirm that you are looking at a dialogue with a lot of things to set. In the “Name” textbox write “ID3 OpenID Connect – Eclipse profile”. For “Goals” write “clean package” For “Profiles” write “Eclipse”.

Choose “Refresh” tab and check off “Refresh resources upon completion.”, then select “The entire workspace”. Click on “Apply”, then click on “Run”. You will now see your Console with the Maven output building your workspace. When it is done, you should see “BUILD SUCCESS”.

A word of warning: what you have set up is an “Eclipse” build profile. This profile is meant for a the STS's own Tomcat server only, as it works with SSL completely disabled. Please do not use this profile for anything else.

*Setting Up Eclipse's Tomcat Server*

The IDOIC project compiles as a standalone project, but it will not deploy as one. The IDOIC server is merely a set of Maven overlays on top of the MITRE OIC server and Eclipse doesn't understand that. Eclipse will want to just copy your entire workspace into the Tomcat hotdeply directory, and then Tomcat will complain that half its files are missing. The setup needed is different: your Tomcat server will need to use Maven's staging directory for generating the final WAR as its deployment directory, so that every time you generate a Maven build, Tomcat deploys your latest code automatically. It will also need to set up that JNDI data source all over again. Please note that if you run a Maven build while Tomcat is running, there will be a race condition between Tomcat trying to redeploy and Maven trying to repopulate its build target directory: for this reason and others it is important to stop Tomcat before executing a Maven build.

In Package Explorer, expand “Servers”. You will see a server pre-defined for you called “Vmware vFabric Server Developer Edition”. Expand it.

Open the embedded Tomcat server.xml for editing. Find the <GlobalNamingResources> tag and add the following within it:

::

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

Save the file and close it. Now open the embedded Tomcat's context.xml for editing, find the <Context> tag and put the following within it:

::

   <ResourceLink name="jdbc/oicserver" global="jdbc/oicserver" type="javax.sql.DataSource"/>
   
Save the file again and close it.

Now put the PostgreSQL JDBC driver in Tomcat's path: in the Servers tab in the lower-left corner, double-click the “Vmware vFabric tc Server Developer Edition” entry. Find the “Open launch configuration” hyperlink and click on it. Click the “Classpath” tab, then click on User Entries and then click on the “Add External JARs” button. Browse to /usr/share/java/postgresql.jar and click “OK”. Then click “Apply” and OK. 

Back in the Eclipse main window, click on the “Modules” subtab. Click “Add External Web Module...”. Click on the “Browse” button next to “Document base:” and browse to ~/projects/idoic/idoic-server/target/idoic. For “Path” type /idoic. Make sure “Auto reload” is checked off and click OK. Again, click on “Add External Web Module...”. Again, click on “Browse” and this time browse to ~/projects/idoic/idoic-demo/target/idoic-demo. Again, make sure “Auto reload” is checked off and click OK. Choose File > Save.

The Eclipse-embedded Tomcat is configured. Go back to the Server view in the lower-left corner, right click on the “Vmware vFabric tc Server Developer Edition” and choose “Start”. You will see Tomcat starting up. You should not see any errors, though you will see Tomcat complaining that log4j is not initialized. This is normal, feel free to configure Tomcat's log4j, but the default already logs DEBUG output to the console so that Eclipse will show them. There is no need to create a idoic_config.properties file, the database script ran above configures the server via its database.

In the toolbar at the top click on the globe icon (Open Web Browser). You will see a very simple web browser window opening within eclipse.

From here you can go to `http://localhost:8080/idoic/ <http://localhost:8080/idoic/>`_ for the IDOIC server and `http://localhost:8080/idoic-demo/ <http://localhost:8080/idoic-demo/>`_ for the sample client. Note that there is no HTTPS on either link: this is not a server you would want to do anything other than local testing on.
 
Feel free to execute the “Testing Your Setup” tests above to validate that everything is working as it should. In order to redeploy, simply stop the server, start a Maven build using the profile created above, and restart Tomcat: it will pick up its external web module changing and reload the directory. In order to debug, simply right-click on the server and choose “Debug” instead of “Start” and Eclipse will take care of the rest.

*Remote Debugging Tomcat With Eclipse*

Go back to the Terminal and open the /etc/default/tomcat7 file for editing. Then uncomment the following lines:

::

   JAVA_OPTS="${JAVA_OPTS} -Xdebug -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n"

Tomcat's remote debug port is 8000. Now restart Tomcat:

::

   /etc/init.d/tomcat7 stop && /etc/init.d/tomcat7 start
   
Now, go back to Eclipse to tell Eclipse to create a Remote Debug configuration: Find the "Debug" button and click on the drop-down arrow on its right. Choose "Debug Configurations..." from the menu. Find "Remote Java Application" on the list of options to the left of the dialog. Right click on it and select "New". A new remote debug configuration appears. Make sure the remote debug host and remote debug port are set correctly. Make sure the project is set to "idoic". Call this debug configuration something meaningful and click on "Apply".

By clicking Debug, Eclipse will connect to your Tomcat's port 8000 and start debugging the ID3 OpenID Connect application remotely. At this point feel free to set breakpoints and interact with the Tomcat server. Upon hitting a breakpoint, Eclipse will prompt you to change to the Debug perspective and allow you to debug the server normally.

*Warning* Remote debugging, like any other debugging, requires the project to be compiled with line numbers embedded. Maven compiles the project with debug information by default, but if this is changed your breakpoints will not trigger. Also, it is up to you to ensure your source code aligns with the code running on Tomcat as breakpoints trip based on line numbers within the source.

*Optional Setup*

It is sometimes useful to have the MITRE OIC Source right along the ID3 OpenID Connect one. In addition to letting you reverse engineer MITRE's implementation, it also allows you to step thrugh MITRE's piece of the logic whenever things don't work as expected.

From Window > Open Perspective > Other choose the “GIT Repository Exploring” perspective. There will be a single repository loaded there already, the IDOIC one, the one imported above. Creating a second one:

Choose the forth icon from the left on the “Git Repositories” view: “Clone a Git Repository and add the clone to this view”. Choose URI from the list on the dialog and click Next. Enter the following URI in the URI textbox: `https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server.git <https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server.git>`_. Leave everything else blank. Click Next. 

Uncheck everything except the latest release branch: release-1.0.9 is the one to show up at the time of writing this. Choose Finish. At this time there will see the second repository being cloned, and once this completes, your “Git Repositories” view will have two repositories listed. Note that all the source was loaded at ~/git.

Go back to the Spring perspective (Window > Open Perspective > Other > Spring), right click in the Package explorer and choose “Import”. Under the Maven branch, choose “Existing Maven projects” and then “Next”. For Root directory, choose Browse and browse to the location the new GIT repository get cloned into: ~/git/OpenID-Connect-Java-Spring-Server. Click OK and Finish.

There will now be 4 more projects imported. There may be errors briefly, but they should clear by the time Spring is done loading the projects. As you debug, you may encounter a dialog where Eclipse asks you to attach source. Click on “Attach Source” and browse to the openid-connect-common or openid-connect-client projects to attach the source and you will be able to step through the source code.

This concludes this guide.
