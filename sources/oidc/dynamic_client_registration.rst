:title: Dynamic Client Registration
:description: How to Dynamically Register a Client (AKA Local Client Orchestration) 
:keywords: oms, oidc, dynamic registration, local client orchestration


.. _dynamic_client_registration:

OIDC Dynamic Client Registration
================================

The purpose of this page is to describe Dynamic Client Registration in all its
usecases, as it exists for the current persona solution to integrate the OIDC
server and introduce the concept of personas. What is described here is
backwards-compatible with the behaviour of the reference implementation, though
it has been extended in several important ways. Those will be pointed out. There
will be sample requests and responses provided for illustration purposes. Most
information here comes from `The IEFT oAuth Dynamic Registration`_, the formal
paper where dynamic registration is proposed (refered to as *The oAuth Paper*,
throughout the rest of this document. MITRE's OIDC Server is an implementation
based on this specification. This page does not require familiarity with this
paper, though references to it will be made occasionally.

.. _The IEFT oAuth Draft r13: http://tools.ietf.org/html/draft-ietf-oauth-dyn-reg-13


ID3 OIDC Server implements what MITRE calls a Protected Registration System, as
described in `Appendix B.2 of the oAuth Paper`_. In a nutshell, this means that
dynamic registration is not open to all, a client seeking to register itself
dynamically requires an access token belonging to a client already into the
system. The paper does not specify where this initial access token comes from,
or how this token is used in order to control access of the new client. In the
context of the OMS framework, the only client able to create initial access
tokens for other clients is the User Registry. The User Registry is provisioned
into the OIDC database at the time the server is installed from an image and
serves to help provision additional clients. The initial access token is issued
by the User Registry for the express purpose to be used by the new client.
Creating that initial access token is where User Registry's involvement ends: it
is up to the client to set itself up and manage itself using the tools available
to it by the Dynamic Registration APIs. There are also strict limits to what a
dynamically-registered client can and cannot do and these will be discussed in
great details below.

.. _Appendix B.2 of the oAuth Paper: http://tools.ietf.org/html/draft-ietf-oauth-dyn-reg-13#appendix-B.2


The following is a sequence diagram describing the process of registering a new
client in the context of the OMS framework:

.. image:: images/local_client_orchestration.png
   :align: center
   :alt: Protected Resource Orchestration
   

A Managed Client
----------------

This is a new concept introduced by the ID3 OIDC implementation. A Managed
Client is a client created to fulfill given user personas. It is managed because
everything it does is governed by the personas it was approved to fulfill. Such
personas are thus called governing personas and act to restrict what the client
can do. In effect governing personas act as standing user approvals for a set of
scopes the managed client can have on a token. Governing personas are enforced
and attached to each and every token a managed client obtains without explicit
user participation and a managed client has no control over this. A managed
client can ask for and receive access beyond what its governing personas allow
by requesting additional access through any of the user-based token
authorization flows: only a user can overrule the governing personas for a
client.

The managed client concept has a visible impact on how dynamic registration
behaves for a client and it will be pointed out in the narrative below.


The Initial Access Token
------------------------

The Registration endpoint from the Dynamic Client Registration API requires a
user-approved token with the the initial-client-registration-token scope. This
scope is listed as one of the scopes with special meaning for the ID3
implementation of the OIDC server at the :ref:`Special Scopes <special_scopes>`
page. This scope is set so that it is out-of-reach for dynamically-registered
clients, and has some special handling to it so that it can be approved on a
token even when not contained within a persona for a client who already has it.
In the context of the OMS framework, this client can only be the User Registry,
a client provisioned into the OIDC database at the time the server is installed
from an image, though any client defined in the UI with this scope can also
serve in this role.

A new client can register itself with the help of an initial access token issued
to the User Registry specially for the purpose. This is what the initial access
token used for the examples below looks like at the introspection endpoint:


.. code::

   {
   "active":true,
   "scope":"initial-client-registration-token openid phone email address profile",
   "id3_personas":"Home",
   "exp":"2013-10-13T21:56:03-0400",
   "sub":"admin",
   "client_id":"private_registry",
   "token_type":"Bearer"
   }


In the context of a managed client, the initial access token bears the list of
personas to be permanently attached to the newly-registered client. The list of
personas become governing personas for the managed client. A managed client does
not inherit the list of scopes from the initial access token, only the personas
and the user they belong to.


Anonymous Client Flow
---------------------

An anonymous client flow is when a client takes the initial access token and,
instead of registering itself with the server, proceeds to using it directly. As
seen above, the token is perfectly good for access, it contains everything a
client needs to drive protected resources. If a protected resource is not meant
to be driven by anonymous clients, such clients can be restricted by not letting
the protected resource have the initial-client-registration-token scope.

This is the simplest mechanism to add a new client to the system: it does not
require additional steps to gain access and it does not require cleaning up
after the client is done. It is best suited for simple clients performing
one-off tasks, such as performing a one-time action on a piece of data. It also
comes with several very important restrictions, making it unsuitable for all but
the simplest cases:

* There is no way to persist the access afforded by the initial access token.
  Once that token expires, so will the access.
* There is no way to split the access afforded by this token among multiple
  tokens. With protected resources needing all scopes on the token in order to
  validate it, the client is limited to driving a single protected resource.
* There is no way to request additional access beyond the one afforded by the
  initial token.


Registering a New Client
------------------------

The primary purpose of an initial access token is to allow the client to
register itself with the server dynamically. Doing so is a matter of POST to the
registration endpoint, with the initial access token in the authorization header.

The request and response fields are referred to as "Client Metadata" and are
described in `Section 2 of the IETF oAuth Dynamic Registration`_ and a client is
welcome to set itself as desired. In the example below a client registers itself
with the minimum required pieces of information, and the server replies with the
full client metadata, everything set to defaults.

.. _Section 2 of the IETF oAuth Dynamic Registration: http://tools.ietf.org/html/draft-ietf-oauth-dyn-reg-13#section-2


REQUEST:

.. code::

   POST https://localhost/idoic/register
   Content-Type: application/json
   Accept: application/json
   Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE..CNcmFdUapol2Kg

   {
   client_name=[demo client 205050143], 
   redirect_uris=[https://client.example.org/callback https://client.example.org/callback2], 
   logo_uri=[https://client.example.org/logo.png], 
   require_auth_time=[true]
   }


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=ISO-8859-1

   {
   "client_id": "f860345d-40c4-4f46-a1a8-85afe4202939",
   "client_secret": "AIj9TB0CDhcs_efZjulWPEA7zl10H9kwYud2jFf9exBeteMbqnlUsf3jdwKnZJS6YZnHplzO-QVpZKJuVBRsyCM",
   "client_secret_expires_at": 0,
   "client_id_issued_at": 1381714271,
   "registration_access_token": "eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiZjg2MDM0NWQtNDBjN...B2rS86w",
   "registration_client_uri": "https://localhost/idoic/register/f860345d-40c4-4f46-a1a8-85afe4202939",
   "redirect_uris": [ "https://client.example.org/callback https://client.example.org/callback2"],
   "contacts": [],
   "token_endpoint_auth_method": "client_secret_basic",
   "scope": "openid",
   "grant_types": [ "authorization_code" ],
   "response_types": [ "code" ],
   "default_acr_values": [],
   "request_uris": []
   }


Please note that the newly registered client is assigned a ``client_id`` and a
``client_secret``. It is also given a special registration_client_uri, where it
can update its client metadata as often as it wishes, and the
``registration_access_token`` needed to do so. Please note that the registration
token is not an access token, it may only be used with the
``registration_client_uri`` issued for the client. The registration token should
be kept confidential as it is what allows a client to manage itself.


Reading Client Metadata
-----------------------

The client can read its client metadata at any point with a simple ``GET``
request to the ``registration_client_uri`` endpoint returned above using its
registration token:

REQUEST:

.. code::

   GET https://localhost/idoic/register/f860345d-40c4-4f46-a1a8-85afe4202939
   Accept: application/json
   Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiZjg2MDM0NWQtNDBjN...B2rS86w


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=ISO-8859-1

   {
   "client_id":"f860345d-40c4-4f46-a1a8-85afe4202939",
   "client_secret":"AIj9TB0CDhcs_efZjulWPEA7zl10H9kwYud2jFf9exBeteMbqnlUsf3jdwKnZJS6YZnHplzO-QVpZKJuVBRsyCM",
   "client_secret_expires_at":0,
   "client_id_issued_at":1381636800,
   "registration_access_token":"eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiZjg2MDM0NWQtNDBjN...B2rS86w",
   "registration_client_uri":"https://localhost/idoic/register/f860345d-40c4-4f46-a1a8-85afe4202939",
   "redirect_uris":["https://client.example.org/callback https://client.example.org/callback2"],
   "contacts":[],
   "token_endpoint_auth_method":"client_secret_basic",
   "scope":"openid",
   "grant_types":["authorization_code"],
   "response_types":["code"],
   "default_acr_values":[],
   "request_uris":[]
   }


Please note that the OIDC server is free to rotate a client's secret and its
registration token with any request to any of the registration APIs by returning
the new values. If this happens the client should read the new values and stop
using the old values immediately. Also, if the OIDC server is configured to
rotate client credentials periodically (the client_secret_expires_at field is
not 0), the client should periodically request its metadata in order to get its
updated client secret.


Updating Client Metadata
------------------------

The example above did not request any scopes, letting the server assign a
default list to the client. A client is free to update its client metadata any
time it wishes by PUTing the updated record to the server. When doing so, it is
important to remove the following fields from the request you are about to PUT
to the server in order to avoid duplicating information as well as remove any
unnecessary sensitive information:

* registration_access_token
* registration_client_uri
* client_secret_expires_at
* client_id_issued_at
* client_secret


REQUEST:

.. code::

   PUT https://localhost/idoic/register/f860345d-40c4-4f46-a1a8-85afe4202939
   Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiZjg2MDM0NWQtNDBjN...B2rS86w
   Content-Type: application/json 

   {
   "client_id":"f860345d-40c4-4f46-a1a8-85afe4202939",
   "redirect_uris":["https://client.example.org/callback https://client.example.org/callback2"],
   "contacts":[],
   "token_endpoint_auth_method":"client_secret_basic",
   "scope":"openid initial-client-registration-token phone email address profile green yellow purple blue",
   "grant_types":["authorization_code"],
   "response_types":["code"],
   "default_acr_values":[],
   "request_uris":[]
   }


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=ISO-8859-1 

   {
   "client_id":"f860345d-40c4-4f46-a1a8-85afe4202939",
   "client_secret":"AIj9TB0CDhcs_efZjulWPEA7zl10H9kwYud2jFf9exBeteMbqnlUsf3jdwKnZJS6YZnHplzO-QVpZKJuVBRsyCM",
   "client_secret_expires_at":0,
   "client_id_issued_at":1381636800,
   "registration_access_token":"eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiZjg2MDM0NWQtNDBjN...B2rS86w",
   "registration_client_uri":"https://localhost/idoic/register/f860345d-40c4-4f46-a1a8-85afe4202939",
   "redirect_uris":["https://client.example.org/callback https://client.example.org/callback2"],
   "contacts":[],
   "token_endpoint_auth_method":"client_secret_basic",
   "scope":"phone purple email address blue green openid yellow profile",
   "grant_types":["authorization_code"],
   "response_types":["code"],
   "default_acr_values":[],
   "request_uris":[]
   }


In general the server will allow any scope to a client, even when they were not
on the original initial access token, but there are some limitations: an attempt
to allow a dynamically registered client to issue tokens for additional clients
to dynamically register themselves results in the initial client registration
token scope being pulled from the response. There are several scopes the server
will blacklist this way, all found in the :ref:`Special Scopes <special_scopes>`
page:

* initial-client-registration-token - a dynamically-registered client can't be
  allowed to open the door for more clients to register themselves the same way.
  There must be a single gatekeeper.
* superclient-managed-token - it's meaningless to have that and may interfere
  with the now-deprecated /tokenapi endpoint operation.
* superclient - a dynamically-registered client can't be allowed to operate the
  now-deprecated /tokenapi endpoint and most certainly can't be allowed to
  inherit administrator access from its approving user. A dynamically-registered
  client should never possess admin, no exceptions.
* id-token - it's reserved for an ID token. A client (any client) can't be
  allowed to fake ID tokens.
* registration-token - it's reserved for a registration token. A client (any
  client) can't be allowed to fake registration tokens.

All scopes added to the client are subject to validation by the governing
personas, which is performed upon requesting a token: the client's scope list
now contains blue, green, yellow and purple which do not exist on the Home
persona, which is governing for this client. Those scopes are allowed to stay on
the client, but the client will be unable to get a token with them without full
user approval. Requesting additional access not covered by the governing persona
is the subject of the "Additional Access" section below. 

Please note the behaviour described above is not allowed by MITRE's reference
implementation of the OIDC Server. Instead, it limits the scopes a client is
allowed to add to specially-marked "for dynamic registration" scopes. ID3 OpenID
Connect still supports this behaviour, any such scopes found are now allowed to
be added outside of the governing personas, though this is meant for backwards
compatibility to the reference implementation only. The managed client mechanism
provides a much more flexible control over access and can be easily used even
with clients created with the reference implementation in mind.


Requesting a New Token
----------------------

A Dynamically Registered client can request a new token using any of the
mechanisms found on the [[OIDC_Token_Retrieval|OIDC Token Retrieval]] page it is
registered for. The one of special interest for any Managed Client is the Client
Credentials flow, which does not require a user to be present. To register for
it a client must update its client metadata to contain the "client_credentials"
grant type.


.. code::

   {
   ...
   "grant_types":["authorization_code","client_crednetials"],
   ...
   }


The ID3 OIDC Server implementation performs all its scope validation upon requesting a token using any non-interactive flow: all scopes but the ones complying with the governing personas get stripped from the final token. A managed client is free to add virtually any scope it wishes to itself, but it can only receive a token for those the governing persona allows it to keep.


REQUEST:

.. code::

   POST https://localhost/idoic/token
   Authorization: Basic Zjg2MDM0NWQtNDBjNC00ZjQ2LWExYTgtODVhZmU0MjAyOTM5OkFJajlUQjBDRGhjc19lZlpqdWxXUEVBN3psMTBIOWt3WXVkMmpGZjlleEJldGVNYnFubFVzZjNqZHdLblpKUzZZWm5IcGx6Ty1RVnBaS0p1VkJSc3lDTQ==
   Content-Type: application/x-www-form-urlencoded 

   grant_type=client_credentials&scope=phone+purple+email+address+blue+green+openid+yellow+profile


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=UTF-8 
   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjEzODE3MjExNzQsI...Yjz3FOrjX1qt0",
   "token_type":"Bearer",
   "expires_in":3599,
   "scope":"phone address email openid profile",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJhdXRoX3RpbW...QLjcjQTmBA"
   }


Something important to note for a managed client is that even though the tokens
above were issued using a non-interactive flow, the tokens are still approved by
a user and have the governing persona for the client. A call to the
introspection endpoint for the access token above reveals the following:

.. code::

   {
   "active":true,
   "scope":"openid phone email address profile",
   "id3_personas":"Home",
   "exp":"2013-10-13T23:26:14-0400",
   "sub":"admin",
   "client_id":"f860345d-40c4-4f46-a1a8-85afe4202939",
   "token_type":"Bearer"
   }


A persona is a user concept and a managed client has no control over the
personas associated to it by the user: they act as a standing approval,
governing personas over everything the managed client does. This link is
established the moment the managed client got registered with an initial access
token with the Home persona belonging to the Admin user, and now is carried over
to any and all tokens this managed client receives through any non-interactive
flow. The result is, there is always a user in the picture acting through the
persona associated with the managed client.


Additional Access
-----------------

A managed client is limited to whatever access is afforded by its governing
personas when obtaining a token with a non-interactive flow, but it is still
able to ask the user for additional access. The client above has the
``authorization_code`` grant to it, which enables it to request tokens with
additional personas in the exact same way a normal client would, as described
in the :ref:`Token Retrieval <token_retrieval>` page. These additional tokens
may grant the client access beyond what the normal governing personas allow, and
this access can be persisted with a refresh token.

The ability to do this is the primary reason the ID3 OIDC implementation delays
scope enforcement until the time a token is requested: with a governing persona
in place, security of the final OIDC server is in no way compromised, while also
allowing the managed client the ability to possess access beyond the one it was
originally provisioned for by independently engaging a user to grant it. What
access is requested and how it is being used is entirely up to the client and
the user, with the OIDC server merely facilitating it, as no other pieces are
involved in.

Additionally, the additional personas granted in this way are not required to
belong to the same user who first provisioned the managed client, allowing for
some very interesting behaviour, such as a client copying data between two users
in a shared OMS installation.

The process to obtain additional access is described in the following sequence
diagram, and is basically the normal process to get a token:

.. image:: images/additional_access_orchestration.png
   :align: center
   :alt: Protected Resource Orchestration


Deleting a Client
-----------------

A client can be deleted by the local user by going to the administrator UI and
clicking on the delete button against the client. Doing so voids all tokens
currently active for that client and safely removes it from the system.

A client may also choose to delete its client record as a way to clean up while
deprovisioning itself. Doing so is a simple matter of calling DELETE on the
registration URI, using its registration token in an authorization header:


REQUEST:

.. code::

   DELETE https://localhost/idoic/register/f860345d-40c4-4f46-a1a8-85afe4202939
   Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiZjg2MDM0N...PB2rS86w


RESPONSE:

.. code::

   204 No Content


At this point all still-active tokens belonging to the client are revoked. The
client record for the client is permanently deleted, along with the association
to the personas which governed its behaviour. From this moment the client is
again not recognized by the OIDC server.


Final Notes
-----------

The Dynamic Registration flow serves to empower the client to manage itself,
while freeing the User Registry from the burden of managing clients beyond
initially provisioning them. The ID3 OIDC server was altered to enable maximum
flexibility for the client, while maintaining the same level of security as with
the reference implementation. Security mechanisms of the reference
implementation have been moved around, but not relaxed, and an additional
security mechanism has been introduced in the governing personas managing access
for their associated clients.

The process described above does not change when a remote client is being
provisioned for access by a local User Registry as the initial access token is
still requested by the local User Registry and is issued to the local User
Registry. With a persona solution implemented this way, a lot of complexity is
being driven away from the User Registry and thus allows for a more robust OMS
framework. Additionally, a local user is now empowered to directly manage both
local and remote clients requesting access to its protected resources in very
much the same way, creating for a very consistent UI experience for the final
system.
