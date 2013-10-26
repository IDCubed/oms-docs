:title: Perguntus Demo Tutorial
:description: How to use and hack on the Perguntus Demo App
:keywords: perguntus, demo, examples, tutorials, oms app, django,


.. _perguntus:

Perguntus: Quantified-Self Demo
===============================

Perguntus is an OMS-enabled Quantified Self web app. You can use it to visualize
your responses to a set of questions, both in terms of the content of the
response, as well as your location. Perguntus runs in your computer browser and
your smartphone browser.
Perguntus also run a CRON Job that will automatically send questions to you.
You can Enable or Disable this via the manifest (see Edit the manifest) 

.. include:: tutorial_setup.inc


Installing the TAB
------------------

The manifests for Perguntus can be found in the oms-core module repository,
included in ``/var/oms/src/oms-core/manifests``. There is a manifest for the
backend and separate manifest for the UI, ``PerguntusDemo.yaml`` and
``PerguntusDemoUI.yaml``, respectively.


Edit the manifest
~~~~~~~~~~~~~~~~~

The URL endpoints that appear in the manifest must be updated to referece the
correct host. For example, each app in the Perguntus TAB contains a django
setting, ``TOKENSCOPE_ENDPOINT``, embedded in the manifest. This setting is used
to validate access tokens at the OpenID Connect server.

There are other URLs/endpoints, update each of the following with correct base
URL based on how your OMS host was deployed (either with/without SSL and DNS).

========================  ======================================================
Setting Key               Description
========================  ======================================================
``PERGUNTUS_BACKEND``     with the path to Perguntus Backend.
``PERGUNTUS_FRONTEND``    with the path to Perguntus UI.
``PERGUNTUS_PDS_SERVER``  with the path to Perguntus PDS Server.
``EMAIL_RECIPIENT``       the email address you want questions to be sent to.
``CRON_EMAIL_DELAY``      the time interval in which emails are sent (in hours)
``APP_QUESTIONS``         Predefined list of quick start questions
========================  ======================================================


Open the manifests for editing:

.. code:: bash

   # this is where you'll find most OMS manifests
   cd /var/oms/src/oms-core/manifests
   # update config in Perguntus Demo TAB manifests
   vim PerguntusDemo.yaml
   vim PerguntusDemoUI.yaml
   

Enabling or Disabling Perguntus CRON:

* edit PerguntusDemo.yaml
* find the services field
* under the services field you should see `enable: True`
* change enabled to False inorder to Disable the CRON


Deploy!
~~~~~~~

When ready, deploy the Perguntus Demo TAB with the oms command line utility.
First the Perguntus Backend - this would include the PDS and a separate Backend
app the UI communicates with:

.. code:: bash

   # specify `localhost` when prompted for a host
   oms deploy -m PerguntusDemo.yaml
   No hosts found. Please specify (single) host string for connection: localhost


Now deploy the UI, this ought to be a lot faster:

.. code:: bash

   # specify `localhost` when prompted for a host
   oms deploy -m PerguntusDemoUI.yaml
   No hosts found. Please specify (single) host string for connection: localhost


Once deployed, you ought to be able to view the Perguntus Demo WebUI with your
browser pointed at https://HOST.DOMAIN.TLD/PerguntusUI/ - and update accordingly
if using SSL and/or DNS.


.. COMMENT THIS OUT UNTIL IT ACTUALLY WORKS
.. * if your private_registry is deployed)
.. * Go to your Private Registry page
.. * Authorize to OIDC (if needed)
.. * Click on your Private Trust Framework block - "Private (User) TF"
.. * On the Available Manifests list select Perguntus manifest
.. * Click "Install selected manifest" and follow the on-screen instructions until
..   your TAB is installed.
.. * Once that TAB is succesfully deployed you should follow PerguntusUI app_urls
..   to reach your Perguntus application (You should see a link that will lead you
..   to your Perguntus Application Dashboard)


Testing Perguntus
-----------------

The following assume that you are in the Perguntus Dashboard

* go to *edit questions* and use the UI to add a few questions
* the questions can be manully sent to you at any time by using the *Resend*
  button, Otherwise the questions will be sent to you at the selected time
* Answer the question
* Refresh Perguntus Dashboard application and see that the answer is being
  reflected on graphs


Running Perguntus
-----------------

From your computer
~~~~~~~~~~~~~~~~~~

After deploying Perguntus, open your browser to
https://HOST.DOMAIN.TLD/PerguntusUI/ (update accordingly based on your host
settings). The dashboard will display a graph showing your answers to three
questions in different categories ("Mood", "Stress", and "Productive") over
time, along with a map with the geographical locations of your answers.

The top right of the page contains links to a few pages on the site. Besides the
dashboard, the "edit questions" page allows you to change the questions
available to you. The "settings" page allows you to set the email address for
sending links to survey questions. The "sharing" page is currently unavailable.

After adding some questions you will see a "Resend" button attached to each
question in the list. Clicking the "Resend" button will trigger a manual send of
the question to your email. This step will verify the emails are being sent
correctly and will help your check Perguntus on your smartphone (see next step).


From your Smartphone
~~~~~~~~~~~~~~~~~~~~

First, make sure that your browser can access your location. In iOS, go to
Settings -> Privacy -> Location Services . Make sure that *Location Services* is
on, as well as *Safari*.

Open your email client on your smartphone and click on the link in the email
sent to you by Perguntus

If prompted, allow the web page to use your current location.

Set the slider to the appropriate value (0-10) and click *Submit* or answer your
Free Text question or just answer a Yes or No question

The dashboard's graph will now display a new point with your answer, and the map
will show a dot with your response at your current location. Your Free Text
answers will be displayed in the day to day log available on the dashboard as
well.


Preloading data
---------------

If you would like to preload Perguntus with some questions and answers (instead
of providing your own), you can add a fixture to your manifest before deploying:

.. code:: yaml

   fixtures:
     - oms-core/perguntus


There are also the ``oms-core/perguntus_national`` fixture, containing a
different dataset, is also available.

This information will be available to you in the Pertungus dashboard immediately
after deployment.
