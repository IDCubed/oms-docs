:title: SSL configuration
:description: How to configure SSL to be used in OMS
:keywords: SSL, self signed, https,


.. _configure_SSL:

SSL Configuration
=================

To enable secure connections on Open Mustard Seed, SSL certificate should be configured on the system.
There are two ways getting SSL certificate:

- Self signed SSL
- SSL validated by some authority (like godaddy.com)


Self signed SSL certificate configuration
---------------
Procedure for self signed SSL certificate generated for ip adress 

.. note::
 {IP} - replace with actual ip here
   

1. Generate self signed certificate

.. code:: bash

 oms% cd /root/
 oms% openssl genrsa -out mycert.key 2048
 oms% openssl req -new -x509 -key mycert.key -out mycert.crt -days 3650 -subj /CN={IP}
   

2. Copy certificate and key to nginx ssl location

.. code:: bash

 oms% cp /root/mycert.key /etc/nginx/ssl/
 oms% cp /root/mycert.crt /etc/nginx/ssl/

3. Change nginx configuration to enable certificate and key

Edit ``/etc/nginx/sites-available/default`` and change :

.. code:: bash

 ssl_certificate      /etc/nginx/ssl/mycert.crt;
 ssl_certificate_key  /etc/nginx/ssl/mycert.key;

4. Restart nginx

.. code:: bash

 oms% service nginx restart

5. Check if nginx configuration is ok :

.. code:: bash
 
 oms% nginx -t

The output should look like this:

.. code:: bash

 nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
 nginx: configuration file /etc/nginx/nginx.conf test is successful

6. Enable certificate in openssl:

.. code:: bash

 oms% cp /etc/nginx/ssl/mycert.crt /etc/ssl/certs/mycert.pem
 oms% cd /etc/ssl/certs/
 oms% ln -s /etc/ssl/certs/mycert.pem `openssl x509 -hash -noout -in /etc/ssl/certs/mycert.pem`.0

7. Check if successfuly enabled certifacate in openssl

.. code:: bash

 oms% openssl verify /etc/ssl/certs/mycert.pem

Output should look like this:

.. code:: bash

 oms% /etc/ssl/certs/worzecho.com.pem: OK

8. Enable certificate in keytool - inform java of certificate taht you are using
.. code:: bash

   oms% sudo keytool -import -alias tomcat -keystore /etc/ssl/certs/java/cacerts -file /etc/ssl/certs/mycert.pem

9. Enable certificate in tomcat

Edit ``/var/lib/tomcat7/shared/classes/idoic_config.properties``

Change lines:

.. code:: bash

 production.configBean.issuer=https://{IP}/idoic/
 production.userRegistry.serverUrl=https://{IP}/

10. Restart tomcat

.. code:: bash

 oms% /etc/init.d/tomcat7 restart

9. Edit /var/oms/etc/deploy.conf and change:

.. code:: bash

 ssl_setup: True
 vhost_base_url: http://{IP}
 oidc_base_url: https://{IP}/idoic

10. Enable ssl in applications.
After app is deployed, run:

.. code:: bash

 oms% cat /etc/ssl/certs/mycert.pem >> /var/oms/python/{app name}/lib/python2.7/site-packages/requests/cacert.pem
 oms% cat /etc/ssl/certs/mycert.pem >> /var/oms/python/{app name}/lib/python2.7/site-packages/pip/cacert.pem

11. Add generated certificate to trusted certificates on your phone - it might be impossible via internet - memory card needed


