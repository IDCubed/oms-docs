:title: OIDC Endpoint Reference
:description: A Brief Description of OpenID Connect Endpoints
:keywords: oms, oidc, endpoints

.. _endpoint_reference:

OIDC Endpoint Reference
=======================

OpenID Connect is a Java implementation of the OAuth2 protocol as described `http://tools.ietf.org/html/rfc6749 <http://tools.ietf.org/html/rfc6749>`_.  The version of OpenID Connect OMS is currently using also contains a number of extensions created by both MITRE and IDCubed to help turn it into a system to be integrated within the Open Mustard Seed framework. This document attempts to summarize what endpoints are there, briefly what they are for, and where to find more information regarding them. This document is not intended as a tutorial on how to use them as this information is already available in other documents, which will be linked here for your convenience.

Protocol Endpoints
------------------

RFC 6749 defines just two endpoints required for the OAuth2 protocol to function, which are used together: Token and Authorization. The protocol endpoints are used in the process of issuing a token for a client. A very detailed description on how a client can request and be granted a token is available at the :ref:`Token Retrieval <token_retrieval>` page.

Authorization Endpoint
~~~~~~~~~~~~~~~~~~~~~~

**GET /authorization**

The authorization endpoint is used to interact with a resource owner to obtain an authorization grant. An authorization grant can then be easily turned into a token. In general, a client will be interacting with the authorization endpoint every time it needs to solicit authorization from a user. Information regarding the endpoint is available at `http://tools.ietf.org/html/rfc6749#section-3.1 <http://tools.ietf.org/html/rfc6749#section-3.1>`_.

Token Endpoint
~~~~~~~~~~~~~~

**POST /token**

The Token Endpoint is used by a client to obtain a token with the OIDC server by presenting some sort of authorization. The exact authorization presented is highly dependant on who the client is and what it is trying to accomplish. Some examples are an authorization code granted by a user acting as the owner of some protected resource (authorization code grant), or client's own credentials (client credentials grant), or even user credentials directly (resource owner grant). In some situation a token may even be issued based on another token (refresh token, redelegation). There are a number of different mechanisms available, as described in great detail in the :ref:`Token Retrieval <token_retrieval>` page. A detailed description of this endpoint is available at `http://tools.ietf.org/html/rfc6749#section-3.2 <http://tools.ietf.org/html/rfc6749#section-3.2>`_. Redelegation is a mechanism not currently used within OMS, but more inforamtion regarding it is available at `http://tools.ietf.org/html/draft-richer-oauth-chain-00 <http://tools.ietf.org/html/draft-richer-oauth-chain-00>`_.

User Information API
--------------------

**GET /userinfo**

There is a situation where OpenID Connect also acts as the protected resource and is used to serve some or all information regarding the authenticated user based on the scope granted on the token. More information regarding this extension can be found at  `http://openid.net/specs/openid-connect-basic-1_0-32.html#UserInfo <http://openid.net/specs/openid-connect-basic-1_0-32.html#UserInfo>`_.

Web Discovery
-------------

**GET /.well-known/webfinger**

This is the endpoint discovery endpoint, which can be used to locate all the various standard endpoints within this particular implementation of the OIDC server. Currently OMS does not make use of this endpoint, but more information regarding it is readily available at `http://openid.net/specs/openid-connect-discovery-1_0.html <http://openid.net/specs/openid-connect-discovery-1_0.html>`_.

Introspection
--------------

**POST /introspect**

The introspection endpoint is used to get information regarding a token. It is usually used by a protected resource to query if a token presented to it is valid for the needs of the protected resource. For this reason this endpoint is heavily protected.

A very detailed description regarding this endpoint, what security there is on it and how to drive it, is available at the :ref:`Integrating a Protected Resource <integrating_protected_resource>` page.


Server Management APIs
----------------------

OpenID Connect has a number of management APIs and an administration UI based on Bootstrap, a framework to allow Javascripts to interact with REST APIs within OpenID Connect. This decoupling of UI from API allows for alternative UIs to OpenID Connect as well as the creation of applications to manage an OpenID Connect server. All endpoints provided with the original MITRE implementations are very well documented at `https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server/wiki/API <https://github.com/mitreid-connect/OpenID-Connect-Java-Spring-Server/wiki/API>`_ and will be summarized here for your convenience. For persona support within OMS, an additional endpoint for persona-approved sites was added and will be documented in detail below.

Client API
~~~~~~~~~~

**GET /api/clients**

This allows the OIDC server to be queried for the list of registered clients. For the purpose one requires an active session where a user has authenticated by some means (e.g. the login page), or a client with a token supporting at least ROLE_USER. The endpoint returns only basic information about each client for ROLE_USER clients, and full client information for ROLE_ADMIN clients. Please note that the default implementation from MITRE allows a client approved for a token by a user to inherit the same access to the OIDC server the user itself possesses with their token, so a user with ROLE_ADMIN access granting a token to a client allows that client to use that token to start administering the server on behalf of the user. This is normally controlled by external means such as a firewall or a reverse proxy preventing token-bearing authorization headers to this endpoint. The OMS implementation contains an extension, which attempts to partially address this need by restricting how much of its own access a user can bestow to a client by means of the superclient scope: unless a ROLE_ADMIN user grants the superclient scope to the client, the token being issued to the client will be demoted to ROLE_USER.

**POST /api/clients**

This allows registration of a new client with the OIDC server. This operation is only allowed for clients with the ROLE_ADMIN privillege either by means of a user logging in directory, or by using a token with that privillege. As mentioned above, the OMS implementation will only allow a client to keep ROLE_ADMIN on their token if the user granting that token approves them for the "superclient" scope.


**GET /api/clients/{id}**

This allows the OIDC server tobe queried for a particular client by its ID. Same rules as with the GET /api/clients endpoint apply.

**PUT /api/clients/{id}**

This allows a client to alter a client record for a registered client with the OIDC server. Same rules as with the POST /api/clients endpoint apply.

**DELETE /api/clients/{id}**

This allows a client to delete a client record for a registered client with the OIDC server. Once a client is deleted, all its information is also deleted with it including any active tokens and authorizations. Same rules as with the POST /api/clients endpoint apply.

Whitelist API
~~~~~~~~~~~~~

Normally a client asking for access would have to be approved by a user every time they need it. In some cases an administrator may want to "whitelist" a client so that no user registered with the server will be prompted to approve a request from them, instead this access would be granted automatically. This is done by associating a client with a list of "whitelist" scopes the client may request and have granted with no prompts.

Please note this feature is defined by the MITRE implementation and maintained with the OMS one for compatibility reasons. It is not currently in use within OMS as it cannot be extended for personas. Personas are a user concept and there is no user involvement with whitelisted requests.

**GET /api/whitelist**

Allows a ROLE_ADMIN or a ROLE_USER client to list out the list of whitelisted clients and the scopes they are whitelisted for.

**POST /api/whitelist**

Creates a new whitelisted client for given scopes.

**GET /api/whitelist/{id}**

Same as GET /api/whitelist, except that the client is asking for a particular whitelist entry.

**PUT /api/whitelist/{id}**

Allows an existing whitelist entry to be modified by a ROLE_ADMIN client.

**DELETE /api/whitelist/{id}**

Allows an existing whitelist entry to be removed from the OIDC server so the client will require a full authorization with a user to obtain a token.

Blacklist API
~~~~~~~~~~~~~

This allows an administrator to prevent clients from redirecting to certain known bad URLs. This can also be used to blacklist an entire client as if a client's redirect URLs are all blacklisted, the client will not be able to obtain a token.

**GET /api/blacklist**

Allows a ROLE_USER or ROLE_ADMIN client to list out the currently active blacklists.

**POST /api/blacklist**

Allows a ROLE_ADMIN client to define a new blacklist URL.

**GET /api/blacklist/{id}**

Same as GET /api/blacklist, but allows querying for a particular blacklist record.

**PUT /api/blacklist/{id}**

Allows a ROLE_ADMIN client to alter an existing blacklist record.

**DELETE /api/blacklist/{id}**

Allows deletion of a blacklist record.

System Scope API
~~~~~~~~~~~~~~~~

This allows an administrator to manage the list of system scopes as well as whether or not they are accessible to dynamically-registered clients outside of governing personas. Please note that OIDC assumes it and all its clients agree on a list of scopes, and this API deals only with scopes the OIDC server is expected to manage directly on a system-level. A client is allowed to have scopes other than the system ones: these are known as client scopes.

**GET /api/scopes**

This allows a ROLE_USER or ROLE_ADMIN client to list out the list of all available system scopes.

**POST /api/scopes**

This allows a ROLE_ADMIN client to define a new system scope.

**GET /api/scopes/{id}**

This allows a ROLE_USER or ROLE_ADMIN client to query for a particular system scope record.

**PUT /api/scopes/{id}**

This allows a ROLE_ADMIN client to alter an existing system scope.

**DELETE /api/scope/{id}**

This allows a ROLE_ADMIN client to delete a system scope, turning it into a client scope for all clients who currently have it.

User Approval API
~~~~~~~~~~~~~~~~~

Under normal circumstances a client requesting access would always require a user to approve its requested access. In some cases a user may want to "preapprove" a client, for example if this is a client the user uses often. In such cases the user may selected "Remember forever" on the scope approval page, making repeated requests for the same access to result in the same access to automatically be granted. If the user has an active session with the OIDC server, they will not see the request being made or being granted as their browser will be immediately redirected back to the client. If the user has no active session with the OIDC server, they will be asked to log in but will not be presented with an approval page immediately after that. If the user changes their mind about preappriving the client at some point, they have to access the OIDC Admin page and delete the remembered access for the client, forcing the OIDC server to the default behaviour again. Of course, this is all transparent to the client as it takes place entirely between the user and the OIDC server.

This is the MITRE-supplied feature, which only works on scope level. For the needs of OMS a special persona-aware whitelist feature has been created, which can coexist with the default feature.

**GET /api/approved**

Gets the list of approved clients for the given user, along with their approved access. The user whose records are being retrieved is determined by the authentication supplied, either a token with ROLE_USER access, or an active session authenticated by a user logging in.

**GET /api/approved/{id}**

This queries for a particular record for the given user.

**DELETE /api/approved/{id}**

This deletes an approval for the given user.

Persona-Aware User Approval API
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This endpoint is an OMS extension designed to allow a user to "preapprove" one or more of their personas to a client. The preapproved client will be granted whatever portion of their request is allowed under the personas being preapproved to the client. This endpoint is designed to mimick the behaviour of the User Approval API as closely as possible.

Please note that this and the scope-level feature can coexist, though in case of a conflict, the persona-level handling takes precedence as it is the first to be considered.

**GET /api/personaapproved**

.. code::

   [
      {
         "id":100,
         "userId":"admin",
         "clientId":"id3-oic-demo-client",
         "creationDate":"2014-02-16T19:04:57-0500",
         "accessDate":"2014-02-16T19:04:57-0500",
         "timeoutDate":null,
         "allowedPersonas":[
            {
               "personaName":"Mobile",
               "personaDescription":null
            },
            {
               "personaName":"Home",
               "personaDescription":null
            }
         ],
         "disallowedPersonas":[
            {
               "personaName":"Work",
               "personaDescription":null
            }
         ]
      }
   ]

Gets the list of approved clients along with their approved personas. Again, the identity of the user whose records are being fetched is determined by the identity of the user authorized within the session.

**GET /api/personaapproved/{id}**

This queries for a particular record for the given user.

**DELETE /api/personaapproved/{id}**

This deletes an approval for the given user.

Token Revocation
----------------

**DELETE /revoke, GET /revoke**

MITRE's OIDC allows for tokens granted to clients to be revoked by the user who granted them, though this feature has not yet been exposed to the UI yet. A client with ROLE_USER or ROLE_ADMIN can authenticate (possibly by means of another token), and request a token passed as a request parameter to be revoked. Upon doing so the token is no longer valid.

Deprecated APIs
---------------

OIDC currently supports two APIs, which are being deprecated and will soon be decomissioned. They will be included here for completeness' sake, though their use is highly discouraged.

Token Scope
~~~~~~~~~~~

**GET /tokenscope, GET /get_key_from_token**

This is a mechanism, similar to the introspection endpoint in nature and purpose, to read information about a token. Unlike the introspection endpoint, it supports no security.

Token API
~~~~~~~~~
This was meant to be a set of APIs to handle tokens, but their presence ultimately became moot as there was a much more elegant to implement the usecase they attempt to address. Parts of this API are still being used, which is why it has not been retired.

**GET /tokenapi, GET /tokenapi/check**

Yet another endpoint to return information regarding a token, also supporting no security beyond the token being passed. Unlike /tokenscope, this endpoint reports on personas as well.

**POST /tokenapi**

This endpoint was intended for a super-powered client to issue tokens on behalf of other clients. Soon after its creation, the concept was replaced by a more powerful and more secure concept, so it was never integrated and will soon be removed.

**DELETE /tokenapi**

This endpoint was intended to revoke a token. It is very much like /revoke, though it has been artifically limited to tokens issued by POST /tokenapi. As with the POST /tokenapi, this endpoint was never integrated.
