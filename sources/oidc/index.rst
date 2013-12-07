:title: OIDC Documentation
:description: ID3 OIDC Server Documentation
:keywords: oms, oidc, examples

.. _oidc:

ID3 OpenID Connect
==================

This is documentation for the extensions done to MITRE's OpenID Connect server
(OIDC) for the OMS framework to implement personas. Deprecated APIs will be
mentioned in passing, along with the means provided to replace them. This set of
Wiki documents the current integration APIs in detail.

The goal of these Wikis is to give a developer all the necessary information they
need to integrate the OIDC server.


.. _oidc_personas:

Personas
--------

The persona concept implemented within ID3's extension to MITRE's OpenID Connect
is taken from a paper titled `Towards a Trustworthy Core Identity Infrastructure
v13 DRAFT <CoreID Paper>`_. Familiarity with this paper is highly recommended.

.. _CoreID Paper: http://iauth.org/wp-content/uploads/2013/01/Core-ID-Infra-paper-v13.pdf
Two types of personas are defined: base personas and principal personas. A base
persona denotes the existential nature of a person, the OIDC user, in digital
space, while the principal persona is derived from a base persona by associating
attributes, pieces of information relevant to the user role represented by the
persona. ID3's OIDC extensions deal with principal personas and manage delegation
of personas selected by the user to OIDC clients, thus granting them all (and
only) the required access to fulfill the given personas for the user in a very
safe and flexible manner.


.. _oidc_repo:

Repository Location & Install Guide
-----------------------------------

The project repository is `hosted on Github.com`_. There is also a comprehensive
:ref:`Developer's Guide <developers_guide>` that details how to build, set
up, deploy and even operate both production and development instances of OIDC.

.. _hosted on Github.com: https://github.com/IDCubed/oms-oidc


.. _oidc_extensions:

List of Extensions
------------------

The ID3 OIDC server was extended with careful attention paid to maintain
compatibility with the reference implementation it is derived from. All
extensions are backwards-compatible so a client created for the MITRE OIDC server
can integrate with the ID3 OIDC server without any modifications.

* Integrate user authentication with an external component, a User Registry.
  OIDC's own user management capabilities have been carefully disabled. This
  involves integrating User Registry's authentication and user information
  endpoint, which serves a specially crafted persona with user information.
* Integrate personas into the token approval flow. The server is now asking for
  personas to be approved, and only falls back to scope approval when no personas
  are found. The server also maintains the identity of the personas approved into
  the token being issued.
* Integrate personas into the introspection endpoint. The standardized endpoint
  for reporting on the capabilities of a token can now report on the personas
  approved on a token.
* Modify dynamic client registration to permanently associate the user and any
  personas approved by that user from the initial access token to the client being
  registered this way. These personas then act to govern and, if necessary, limit
  what access is present on the final tokens approved by non-interactive (without
  a user) token approval flows. Every token approved by a non-interactive token
  approval would always carry the initial access token's user and all personas
  attached to it.
* Relax scope enforcement on dynamic client registration. With personas governing
  access for a dynamically-registered client, preventing a client from registering
  for scopes based on a flag with the scope is no longer required for security.
  Personas can effectively replace this mechanism while not hindering a client
  from requesting or a user from granting additional access to a client
  post-registration. In this context, a dynamic registration scope now becomes
  merely a scope a client can request on a token outside of a persona so that
  compatibility with the reference implementation is maintained.
* Restrict how much access a token inherits from the user approving it. The
  vanilla implementation would extend all roles held by the approving user to any
  token being approved. Now, the server would only do so whenever a "superclient"
  scope is explicitly requested by the client and approved by the user, or else
  is part of a persona approved by the user. This makes it possible to hand over
  an initial access token to an untrusted client so that it can register itself
  without also handing over Administrator access to the OIDC server.
* [deprecated] Create a /tokenscope endpoint: this API is part of a previous
  integration attempt and serves roughly the same function as the introspect
  endpoint built into the server. The tokenscope API is still used, as of the
  time of writing is still being maintained, but its used is being deprecated in
  favour of the introspect endpoint.
* [deprecated] Create a /tokenapi endpoint: this API allows a "superclient" to
  manage tokens for other clients. This API is also part of a previous integration
  attempt and is being deprecated in favour of dynamic registration. The
  reference implementation also includes a sanctioned API for token management
  (``/revoke``), though it is limited to revoking previously-issued tokens only.
* Externalize database configuration for OIDC server to the container (e.g.
  Tomcat or Jetty). The database is now portable.
* Externalize server configuration for OIDC to both database or a property file.
  (The property file configuration is highly preferred as the database
  configuration option does not allow the OIDC server to start whenever its
  database is unavailable)
* Implemented Approved Site functionality for personas and created a UI to
  control it. A user can approve a list of personas for a client and have the
  server remember this decision. This remembered decision will hold for as long
  as the list of available personas remains the same, or the decision expires,
  or the user deletes it from the UI screen.


.. note::

   *Terminology clash.* Superclient in the context of the now deprecated tokenapi
   endpoint is a client who can manage other clients and issue tokens on their
   behalf. Superclient in the context of the latest integration attempt is a
   client who has a token able to administer the server. The two definitions
   largely overlap as both superclients can ultimately manage other clients,
   though the means used to do so are very different.


.. _oidc_special_scopes:

Scopes With Special Meaning
---------------------------

For the most part OIDC allows definition of any scope and its interpretation in
any way at all. There are, however, a few scopes with special meaning to the OIDC
server itself. Those can only be used in the way the OIDC server defines them and
allow to alter the way the server works for a client. They are documented below:

:ref:`Special Scopes <special_scopes>`


Token Retrieval
---------------

Currently tokens are retrieved using a lightweight mechanism known as "implicit
flow": it is very fast, very convenient and very limited.  In retrospect, this is
not the best way to get a token for the needs of the OMS framework, and new
mechanisms are needed. The following page describes all possible ways to get a
valid token from the OIDC server and also how maintain the access granted through
a token. The page is complete with examples of requests and responses, and covers
purpose and use of refresh tokens.

:ref:`Token Retrieval <token_retrieval>`


Integrating a Protected Resource
--------------------------------

In the context of OAuth, a protected resource is approached by a client holding
an access token. This token is part of an authorization header passed by the
client, which the protected resource has to validate against its OIDC server.
The actual validation is performed both by the server and the protected resource
itself: the server will tell you if the token is valid, but it is up to the
protected resource to interpret the token metadata and decide if access should be
granted. The OIDC server provides the means to make this decision, but it's up to
the protected resource to make it.

In the past this was performed using the /tokenscope endpoint. This works and
will continue to work for the immediate future, though this is not the sanctioned
way to do so. The sanctioned implementation has a much better API for the job,
one that has been extended for personas. The following page describes the
sanctioned way to integrate a protected resource, and points out how a protected
resource can look for personas.

:ref:`Integrating a Protected Resource <integrating_protected_resource>`


Dynamic Client Registration (AKA Local Client Orchestration)
------------------------------------------------------------

The following page describes how to use dynamic client registration within the
ID3 OIDC server, and also what this client can and cannot do.

:ref:`Dynamic Client Registration <dynamic_client_registration>`


Section Contents
----------------

.. toctree::
   :maxdepth: 1

   Special Scopes <special_scopes>
   Token Retrieval <token_retrieval>
   Integrating a Protected Resource <integrating_protected_resource>
   Dynamic Client Registration <dynamic_client_registration>
