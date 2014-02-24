:title: Reskinning OIDC
:description: A Brief Guide How To Skin OMS OIDC
:keywords: oms, oidc, skin, reskin

.. _reskin_oidc:

Reskinning OMS OpenID Connect
=============================


OIDC is a Java application created and maintained by MITRE and built with 
Maven. In order to allow it to be customized, MITRE has written their software 
so that parts of it can be easily replaced using a feature of the Maven WAR 
plugin called Overlays, which allows one to take the fully-built OIDC WAR from 
MITRE, open it up and add or replace files within. For more information on 
Overlays, please consult `the official documentation for the Maven WAR plugin 
<http://maven.apache.org/plugins/maven-war-plugin/overlays.html>`_. Being able 
to replace any file within a WAR is useful and extremely powerful, though it is 
up to the overlay developer to make sure they are respecting the architecture 
of the system being modified in this way. It is also up to the developer to 
make ensure their overlays continue to function as intended with later versions 
of the original WAR. In general, the use of overlays should be limited to 
replacing UI elements, logic identified by the original software developers as 
replaceable in this fashion, and adding additional logic.

OMS OIDC is a customized version of MITRE's OIDC, implemented as a Maven 
overlay on top of the original software. This allows two different teams within 
two different organizations two work on the same piece of code. OMS OIDC 
replaces both UI and pieces of Java logic within the softwawre, which have been 
identifed by MITRE as replaceable in this fashion. OMS OIDC also implements 
additional features, including additional UIs, not found within the original 
software, integrating it with the OMS system. 

How to Skin OMS OIDC
--------------------

MITRE's OIDC employs a UI built around the Bootstrap framework, which allows a 
Javascript to utilize REST APIs. The entire Administration UI lives entirely 
within the user's browser and renders itself based on the output of one REST 
API or another coming back from the OIDC application. Furthermore the OIDC UI 
is further divided into tiles, which are being inserted into different views. 
This makes it very easy to replace pieces or all of the OIDC UI, which in turn 
allows seemless intergation between OIDC and almost any system it is being 
integrated into.

The easiest was to skin OMS OIDC is to use the very trick OMS OIDC itself uses 
to alter MITRE's OIDC: create a Maven overlay. In this case, however, no Java 
logic is being overlaid as no additional logic is needed, merely UI elements. 
This mechanism has been used in several situations to great success and has 
resulted in a very consistent user experience.

How to Overlay the UI
---------------------

Preparing the Overlays
~~~~~~~~~~~~~~~~~~~~~~

MITRE's OIDC is a Spring MVC application, which means there is a separation 
between logic (controller) and interface (view), with objects (models) being 
the vehicles to move data back and forth between the two. In OIDC the views 
responsible for the UI are all located at:

https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server/tree/mitrei
d-connect-1.0.9/openid-connect-server/src/main/webapp/WEB-INF/views

with the OMS overlays located at:

https://github.com/IDCubed/oms-oidc/tree/master/oms-oidc-server/src/main/webapp/
views

Everything from those two directories gets packaged into the final WAR at 
``WEB-INF/views``. The list of views is as follows:

+-------------------+-------------------------------------------------------------+
|about.jsp          | The About page, accessible from the main menu at the top.   |
+-------------------+-------------------------------------------------------------+
|approve.jsp        | The Scope approval page, accessible during a user token     |
|                   | approval on behalf of a client.                             |
+-------------------+-------------------------------------------------------------+
|approve-persona.jsp| The Persona approval page: very similar to the scope        |
|                   | approval page, but deals with approving personas, and       |
|                   | is accessible during the same flow.                         |
+-------------------+-------------------------------------------------------------+
|contact.jsp        | The contact page, accessible from the main menu at the top. |
+-------------------+-------------------------------------------------------------+
|home.jsp           | The home page.                                              |
+-------------------+-------------------------------------------------------------+
|login.jsp          | The login page, responsible for authenticating a user.      |
+-------------------+-------------------------------------------------------------+
|manage.jsp         | The management console for OIDC, accessible through the     |
|                   | navigation menu on the right-hand side of the               |
|                   | screen for a logged-in user.                                |
+-------------------+-------------------------------------------------------------+
|stats.jsp          | The statistics page, accessible from the main menu at the   |
|                   | top.                                                        |
+-------------------+-------------------------------------------------------------+

A lot of these views merely assemble different tiles to render themselves. 
MITRE has located their tiles at:

https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server/tree/mitreid-connect-1.0.9/openid-connect-server/src/main/webapp/WEB-INF/tags

with the OMS overlays located at:

https://github.com/IDCubed/oms-oidc/tree/master/oms-oidc-server/src/main/webapp/tags

The tiles similarly get packaged into the final WAR at ``WEB-INF/tags``. The 
list of tiles is as follows:

+----------------------+--------------------------------------------------------+
| aboutContent.tag     | The content tile of the About page.                    |
+----------------------+--------------------------------------------------------+
| actionmenu.tag       | The right-hand-side menu, visible to authenticated     |
|                      | user, allowing the OIDC server to be managed by users. |
+----------------------+--------------------------------------------------------+
| breadcrumbs.tag      | A tile to be used to integrate OIDC with any software  |
|                      | to track usage, such as Google Analytics.              |
+----------------------+--------------------------------------------------------+
| contactContent.tag   | The content tile for the Contacts page.                |
+----------------------+--------------------------------------------------------+
| copyright.tag        | The copyright tile, displayed at the footer of the     |
|                      | application.                                           |
+----------------------+--------------------------------------------------------+
| footer.tag           | The footer content tile itself, used to hold any logic |
|                      | added at the very end of all pages. It currently       |
|                      | is used to import Javascripts to be used throughout    |
|                      | the application, such as the Bootstrap framework       |
|                      | itself.                                                |
+----------------------+--------------------------------------------------------+
| header.tag           | The header content tile, used to hold any logic added  |
|                      | at the very beginning of all pages such as import      |
|                      | or define in place any CSS needed, set title of the    |
|                      | page etc.                                              |
+----------------------+--------------------------------------------------------+
| landingPageAbout.tag | The about tile of the home page.                       |
+----------------------+--------------------------------------------------------+
|landingPageContact.tag| The contact content tile of the home page.             |
+----------------------+--------------------------------------------------------+
| landingPageStats.tag | The stats tile of the home page.                       |
+----------------------+--------------------------------------------------------+
|landingPageWelcome.tag| The welcome tile of the home page.                     |
+----------------------+--------------------------------------------------------+
| sidebar.tag          | The sidebar, which is used to display a login button   |
|                      | for unauthenticated users, or the action menu for      |
|                      | authenticated users.                                   | 
+----------------------+--------------------------------------------------------+
| statsContent.tag     | The content tile for the Statistics page.              |
+----------------------+--------------------------------------------------------+
| topbar.tag           | Used to display and manage the drop-down in the        |
|                      | upper-left corner for a logged-in user.                |
+----------------------+--------------------------------------------------------+

In addition, MITRE has located all their static resources, including the 
Bootstrap framework itself at:

https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server/tree/mitreid-connect-1.0.9/openid-connect-server/src/main/webapp/resources

OMS OIDC has a similar directory structure at:

https://github.com/IDCubed/oms-oidc/tree/master/oms-oidc-server/src/main/webapp/resources

Everything you see in this directory gets packaged at ``/resources`` into the 
final WAR.

Reskinning OIDC is a matter of identifying what needs to change to accomplish 
the desired look & feel. In many situations, reskinning is simply a matter of 
changing the color theme of the OIDC. For the purpose, header.tag is the only 
file to overlay, as it contains the stylesheet used throughout the application. 
In some cases it might be necessary to make more changes, such as swapping out 
a page: in this situations it is needed to make sure forms are still submitting 
correctly and that the model maps correctly into the new view. 

Preparing the File Structure
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The goal is to build a Maven project which overlays files within an existing 
WAR. There are many ways this can be accomplished, though OMS OIDC is already 
readily available and can be easily emulated. What is discussed here is merely 
a suggestion that has been found to be useful in the past.

The example shown below aims to provide an overlay project able to accomodate 
both code and UI overlays on top of both development and release version of OMS 
OIDC. It also provides a simple way to launch a Jetty container right from 
Maven against test stubs normally used for automated testing of OIDC, so that 
any changes made can be easily tested.

The directory structure needed is as follows:

.. code:: 


   ROOT
    |
    \ pom.xml
    \ reskinned-oidc-server
     |
     \ pom.xml
     \ src
       |
       \ test
       \ main
          |
          \ java
          \ resources
          \ filters
          \ webapp
            |
            \ resources
            | |
            | \ css
            | \ images
            | \ js
            \ tags
            \ views         

All tiles and views go into the tags and views directories under 
``ROOT/reskinned-oidc/src/main/webapp/tags`` and 
``ROOT/reskinned-oidc/src/main/webapp/views`` respectively. All static 
resources go under ``ROOT/reskinned-oidc/src/main/webapp/resources`` under 
their corresponding directory.

The ROOT pom serves to provide a root for the new overlay project, allowing you 
to make sure the versions of plugins and software used match those of OMS OIDC, 
and also to grow the overlay to include additional logic, additional projects, 
and also point to development versions of OIDC if required. Full listing of the 
root pom.xml can be found :ref:`here <reskin_oidc_root_pom>`.

The overlay pom serves to apply all the relevant overlays on top of the OIDC 
WAR. This POM also configures three build profiles for you:

+-------------------+-----------------------------------------------------------+
| dev               | Development Profile - a build, which runs against         |
|                   | development stubs instead of interacting with external    |
|                   | pieces. Suitable for development.                         |
+-------------------+-----------------------------------------------------------+
| prod              | Production Profile - a build suitable for a production    |
|                   | deployment, which integrates with the rest of the OMS     |
|                   | system.                                                   |
+-------------------+-----------------------------------------------------------+
|reskinnedoidc-debug| Debug profile - like ``dev``, but automatically deploys   |
|                   | the finished WAR within an embedded Jetty server for a    |
|                   | developer to connect to. Suitable for rapid testing during|
|                   | development.                                              |
+-------------------+-----------------------------------------------------------+

The overlay pom can be found :ref:`here <reskin_oidc_overlay_pom>`.

The filters directory is used to hold the relevant configuration for the three 
build profiles defined above. The dev.properties file is used to configure 
Spring to use development mocks instead of integrating with the OMS system. The 
development mocks serve some static data from property files packaged within 
the WAR. The dev.properties file can be found :ref:`here 
<reskin_oidc_dev_properties>`. The prod.properties file is used to configure 
Spring to integrate OIDC with the OMS system. The prod.properties file can be 
found :ref:`here <reskin_oidc_prod_properties>`.

File Listings For Overlay Project Example
-----------------------------------------

Root pom.xml
~~~~~~~~~~~~

.. _reskin_oidc_root_pom:

This file is located under ``ROOT``.

.. code:: xml


   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">

      <modelVersion>4.0.0</modelVersion>
            <groupId>org.oms.reskinned-openid-connect</groupId>
      <artifactId>reskinned-openid-connect</artifactId>
      <packaging>pom</packaging>
      <version>1.0-SNAPSHOT</version>
      <name>Reskinned Open Mustard Seed OpenID Connect</name>

      <modules>
         <module>oms-oidc</module>
         <module>reskinned-oidc-server</module>
      </modules>

      <properties>
         <version.java>1.6</version.java>
         <version.springframework>3.1.3.RELEASE</version.springframework>
         <version.spring.security>3.1.0.RELEASE</version.spring.security>
         <version.slf4j>1.5.10</version.slf4j>
      </properties>

      <dependencies>
         <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.1</version>
         </dependency>
         <dependency>
            <groupId>commons-codec</groupId>
            <artifactId>commons-codec</artifactId>
            <version>1.6</version>
         </dependency>

         <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${version.springframework}</version>
            <exclusions>
               <exclusion>
                  <groupId>commons-logging</groupId>
                  <artifactId>commons-logging</artifactId>
               </exclusion>
            </exclusions>
         </dependency>
         <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>${version.springframework}</version>
         </dependency>
         <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>${version.slf4j}</version>
         </dependency>
         <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>jcl-over-slf4j</artifactId>
            <version>${version.slf4j}</version>
            <scope>runtime</scope>
         </dependency>
         <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
            <version>${version.slf4j}</version>
            <scope>runtime</scope>
         </dependency>
         <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.15</version>
            <exclusions>
               <exclusion>
                  <groupId>javax.mail</groupId>
                  <artifactId>mail</artifactId>
               </exclusion>
               <exclusion>
                  <groupId>javax.jms</groupId>
                  <artifactId>jms</artifactId>
               </exclusion>
               <exclusion>
                  <groupId>com.sun.jdmk</groupId>
                  <artifactId>jmxtools</artifactId>
               </exclusion>
               <exclusion>
                  <groupId>com.sun.jmx</groupId>
                  <artifactId>jmxri</artifactId>
               </exclusion>
            </exclusions>
            <scope>runtime</scope>
         </dependency>
         <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
            <version>2.5</version>
            <scope>provided</scope>
         </dependency>
         <dependency>
            <groupId>javax.servlet.jsp</groupId>
            <artifactId>jsp-api</artifactId>
            <version>2.1</version>
            <scope>provided</scope>
         </dependency>
         <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
            <version>1.2</version>
         </dependency>
      </dependencies>

      <build>
         <pluginManagement>
            <plugins>
               <plugin>
                  <artifactId>maven-clean-plugin</artifactId>
                  <version>2.5</version>
                  <groupId>org.apache.maven.plugins</groupId>
               </plugin>
               <plugin>
                  <artifactId>maven-compiler-plugin</artifactId>
                  <groupId>org.apache.maven.plugins</groupId>
                  <version>2.5.1</version>
               </plugin>
               <plugin>
                  <artifactId>maven-resources-plugin</artifactId>
                  <groupId>org.apache.maven.plugins</groupId>
                  <version>2.6</version>
               </plugin>
               <plugin>
                  <artifactId>maven-source-plugin</artifactId>
                  <version>2.1.2</version>
                  <groupId>org.apache.maven.plugins</groupId>
               </plugin>
               <plugin>
                  <artifactId>maven-war-plugin</artifactId>
                  <groupId>org.apache.maven.plugins</groupId>
                  <version>2.2</version>
               </plugin>
               <plugin>
                  <groupId>org.apache.maven.plugins</groupId>
                  <artifactId>maven-javadoc-plugin</artifactId>
                  <version>2.9</version>
               </plugin>
               <plugin>
                  <groupId>org.apache.maven.plugins</groupId>
                  <artifactId>maven-surefire-plugin</artifactId>
                  <version>2.15</version>
               </plugin>
               <plugin>
                  <groupId>org.mortbay.jetty</groupId>
                  <artifactId>maven-jetty-plugin</artifactId>
                  <version>6.1.26</version>
               </plugin>
            </plugins>
         </pluginManagement>
         <plugins>
            <plugin>
               <artifactId>maven-compiler-plugin</artifactId>
               <groupId>org.apache.maven.plugins</groupId>
               <configuration>
                  <source>${version.java}</source>
                  <target>${version.java}</target>
               </configuration>
            </plugin>
            <plugin>
               <artifactId>maven-resources-plugin</artifactId>
               <groupId>org.apache.maven.plugins</groupId>
               <configuration>
                  <encoding>UTF-8</encoding>
               </configuration>
            </plugin>
         </plugins>
      </build>
   </project>

Overlay pom.xml
~~~~~~~~~~~~~~~

.. _reskin_oidc_overlay_pom:

This file is located at ``ROOT/reskinned-oidc-server``.

.. code:: xml


   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
      <name>Reskinned Open Mustard Seed OpenID Connect Server</name>

      <modelVersion>4.0.0</modelVersion>
      
      <parent>
         <groupId>org.oms.reskinned-openid-connect</groupId>
         <artifactId>reskinned-openid-connect</artifactId>
         <version>1.0-SNAPSHOT</version>
         <relativePath>..</relativePath>
      </parent>
      
      <artifactId>oidc</artifactId>
      <packaging>war</packaging>

      <dependencies>
         <dependency>
            <groupId>org.idcubed</groupId>
            <artifactId>oidc</artifactId>
            <type>war</type>
            <version>1.1-SNAPSHOT</version>
         </dependency>
         <dependency>
            <groupId>commons-dbcp</groupId>
            <artifactId>commons-dbcp</artifactId>
            <version>1.4</version>
         </dependency>
         <dependency>
            <groupId>org.hsqldb</groupId>
            <artifactId>hsqldb</artifactId>
            <version>2.2.9</version>
         </dependency>
      </dependencies>

      <properties>
         <my.defaultGoal>war</my.defaultGoal>
         <my.outputDirectory>target/oidc/WEB-INF/classes</my.outputDirectory>
      </properties>

      <profiles>
         <profile>
            <id>dev</id>
            <activation>
               <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
               <my.filterFile>dev.properties</my.filterFile>
            </properties>
         </profile>
         <profile>
            <id>prod</id>
            <properties>
               <my.filterFile>prod.properties</my.filterFile>
            </properties>
         </profile>
         <profile>
            <id>reskinnedoidc-debug</id>
            <properties>
               <my.filterFile>dev.properties</my.filterFile>
            </properties>
            <build>
               <plugins>
                  <plugin>
                     <groupId>org.mortbay.jetty</groupId>
                     <artifactId>maven-jetty-plugin</artifactId>
                     <executions>
                        <execution>
                           <phase>package</phase>
                           <goals>
                              <goal>run-exploded</goal>
                           </goals>
                        </execution>
                     </executions>
                     <configuration>
                        <systemProperties>
                           <systemProperty>
                              <name>spring.profiles.active</name>
                              <value>WebIntegrationTest</value>
                           </systemProperty>
                        </systemProperties>
                        <connectors>
                           <connector implementation="org.mortbay.jetty.nio.SelectChannelConnector">
                              <port>18080</port>
                              <maxIdleTime>60000</maxIdleTime>
                           </connector>
                        </connectors>
                        <scanIntervalSeconds>0</scanIntervalSeconds>
                        <webApp>${basedir}/target/oidc/</webApp>
                        <webAppConfig>
                           <extraClasspath>${basedir}/target/test-classes;${basedir}/src/test/resources</extraClasspath>
                        </webAppConfig>
                        <stopKey>jetty-stop</stopKey>
                        <stopPort>9999</stopPort>
                     </configuration>
                  </plugin>
               </plugins>
            </build>
         </profile>
      </profiles>


      <build>
         <finalName>oidc</finalName>

         <outputDirectory>${my.outputDirectory}</outputDirectory>
         <defaultGoal>${my.defaultGoal}</defaultGoal>

         <filters>
            <filter>src/main/filters/${my.filterFile}</filter>
         </filters>

         <testOutputDirectory>target/test-classes</testOutputDirectory>
         <resources>
            <resource>
               <directory>src/main/resources</directory>
               <includes>
                  <include>**/*.xml</include>
                  <include>**/*.properties</include>
                  <include>**/*.sql</include>
               </includes>
               <filtering>true</filtering>
            </resource>
            <resource>
               <directory>src/main/webapp/views</directory>
               <targetPath>../views</targetPath> <!-- path is relative to WEB-INF/classes -->
               <includes>
                  <include>**/*</include>
               </includes>
               <filtering>false</filtering>
            </resource>
            <resource>
            <directory>src/main/webapp/tags</directory>
               <targetPath>../tags</targetPath> <!-- path is relative to WEB-INF/classes -->
               <includes>
                  <include>**/*</include>
               </includes>
               <filtering>false</filtering>
            </resource>
            <resource>
               <directory>src/main/webapp/resources</directory>
               <targetPath>../../resources</targetPath> <!-- path is relative to WEB-INF/classes -->
               <includes>
                  <include>**/*</include>
               </includes>
               <filtering>false</filtering>
            </resource>
         </resources>

         <plugins>
            <plugin>
               <artifactId>maven-clean-plugin</artifactId>
               <groupId>org.apache.maven.plugins</groupId>
               <configuration>
                  <filesets>
                     <fileset>
                        <directory>src/main/webapp/META-INF</directory>
                        <followSymlinks>false</followSymlinks>
                     </fileset>
                     <fileset>
                        <directory>src/main/webapp/WEB-INF</directory>
                        <includes>
                           <include>**/*</include>
                        </includes>
                        <followSymlinks>false</followSymlinks>
                     </fileset>
                  </filesets>
               </configuration>
            </plugin>
            <plugin>
               <artifactId>maven-resources-plugin</artifactId>
               <groupId>org.apache.maven.plugins</groupId>
               <configuration>
                  <overwrite>true</overwrite>
               </configuration>
            </plugin>
            <plugin>
               <artifactId>maven-source-plugin</artifactId>
               <groupId>org.apache.maven.plugins</groupId>
               <executions>
                  <execution>
                     <id>attach-sources</id>
                     <goals>
                        <goal>jar-no-fork</goal>
                     </goals>
                  </execution>
               </executions>
            </plugin>
            <plugin>
               <artifactId>maven-war-plugin</artifactId>
               <groupId>org.apache.maven.plugins</groupId>
               <configuration>
                  <warName>oidc</warName>
                  <useCache>false</useCache>
                  <overlays>
                     <overlay>
                        <groupId>org.idcubed</groupId>
                        <artifactId>oidc</artifactId>
                        <excludes>
                           <!-- Exclude all overlayed files, these are just samples -->
                           <exclude>WEB-INF/views/login.jsp</exclude>
                           <exclude>WEB-INF/tags/header.tag</exclude>
                        </excludes>
                     </overlay>
                  </overlays>
               </configuration>
            </plugin>
         </plugins>
      </build>
   </project>


dev.properties
~~~~~~~~~~~~~~

.. _reskin_oidc_dev_properties:

This file is located at ``ROOT/reskinned-oidc-server/src/main/filters``.

.. code:: 


   #
   # Development Stubs
   #

   # implementation class of the user registry service
   userRegistryServiceClass=org.idcubed.openidconnect.registry.UserRegistryServiceImpl
   # the User Registry communication bean mocked up with fake data, as configured in user-context.xml
   userRegistryServiceCommunicationRef=userRegistryCommunicationMock

   # implementation class for the user info service. Note that this is added for completeness, you only need the UserRegistryService dev stub
   # to accomplish any and all testing you most likely need.
   userInfoServiceClass=org.idcubed.openidconnect.server.UserInfoServiceImpl

   #
   # Configuration Profiles
   #

   userRegistryRoot=development
   configBeanRoot=development
   metricsBeanRoot=development

prod.properties
~~~~~~~~~~~~~~~

.. _reskin_oidc_prod_properties:

This file is located at ``ROOT/reskinned-oidc-server/src/main/filters``.

.. code::


   # implementation class of the user registry service
   userRegistryServiceClass=org.idcubed.openidconnect.registry.UserRegistryServiceImpl
   # the User Registry communication bean mocked up with fake data, as configured in user-context.xml
   userRegistryServiceCommunicationRef=userRegistryCommunicationImpl

   # implementation class for the user info service. Note that this is added for completeness, you only need the UserRegistryService dev stub
   # to accomplish any and all testing you most likely need.
   userInfoServiceClass=org.idcubed.openidconnect.server.UserInfoServiceImpl

   #
   # Configuration Profiles
   #

   userRegistryRoot=production
   configBeanRoot=production
   metricsBeanRoot=production
