:title: OIDC Scopes With Special Meaning
:description: ID3 Scopes With Special Meaning To The Server
:keywords: oms, oidc, special scopes, scopes


.. _special_scopes:

OIDC Scopes With Special Meaning
================================

Scopes represent the concept of capabilities of a security system. A scope is a
free-form string whose presence signifies ability to perform a certain action.
For the most part the OIDC server does not put any meaning into scopes granted
on a token, this is up to the protected resource, though there are a few
important exceptions:


System Scopes
-------------

There is a set of system scopes the OIDC specification defines and the OIDC
server serves through the UserInfo endpoint. As the name implies, they are used
by the server to serve information regarding the user approving the token. Since
the OIDC server itself is the protected resource in this case, those scopes have
a special significance and cannot be reused for anything else. The most up-to-date
list defined by MITRE can be found here:
`http://openid.net/specs/openid-connect-basic-1_0.html#StandardClaims <http://openid.net/specs/openid-connect-basic-1_0.html#StandardClaims>`_


Scopes With Special Meaning
---------------------------

In addition to the list above, there are scopes that alter the server's own
behaviour and what it will do for a client. This list is poorly documented and
has been obtained by reverse-engineering the code.

offline_access
~~~~~~~~~~~~~~

The offline_access scope is introduced and used by MITRE's implementation of the
OpenID Connect specification. You can read about it here:
http://openid.net/specs/openid-connect-basic-1_0.html#OfflineAccessPrivacy

In a nutshell, this scope is automatically added to any client allowed the
``refresh_token`` grant type. When present in a token request made by such a
client, it instructs the server to issue a refresh token along with the access
token. This refresh token can then be used to persist the client's access
granted through the access token indefinitely.


openid
~~~~~~


The openid scope can be requested by a client and signifies that the client
wishes an ID token issued along with their access token. The ID token is a token,
which represents the act of authentication performed by whoever is approving the
access token for the client. This can be either the user approving the token or
the client itself. The ID token allow a client to operate OpenID-based APIs on
behalf of the user approving their access token.


registration-token
~~~~~~~~~~~~~~~~~~

This scope may not be added to a client and may not be requested by a client.
When found on a token, it represents a registration token issued for a
dynamically-registered client at the time of its registration so that it can
update its client record. A registration token cannot be used for access beyond
updating the client's own client record.


id-token
~~~~~~~~

Another scope that may not be added to a client and may not be requested by a
client. When found on a token, it presents an ID token issued to a client in
response to it requesting the openid scope. Such a token merely represents the
act of authentication and does not enable one to access any resources. Such a
token is typically used to drive OpenID APIs.


Scopes With Special Meaning Introduced to Support OMS
-----------------------------------------------------

The following scopes have been added to drive ID3 OIDC extensions for the
purposes of supporting the OMS framework. They have no meaning in the reference
implementation.


initial-client-registration-token
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is a special scope used by a system client (as opposed to a
dynamically-registered one) to enable the bearer of the access token to register
itself dynamically as a client. It is part of the current persona solution and
allows the User Registry to enable a client to register itself.

This scope is currently handled as a special case as it can be requested and will
be granted even when it is not part of any persona selected. When this scope is
not present on a token handed by a User Registry to a client, the client is
limited to the so-called "anonymous client flow": it can use the token it has
freely, but it may not register itself. The access afforded to an anonymous
client expires with the token and cannot be persisted.

This scope also needs to be added to protected resources that are intended to be
accessible to anonymous clients. Protected resources aren't (normally) able to
get tokens from the OIDC server, but still need to validate tokens.


[deprecated] superclient-managed-token
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This is a special scope added to any token issued by the /tokenapi endpoint on
behalf of a client. This token is part of a deprecated solution and serves to
mark a token issued by the /tokenapi endpoint. When the /tokenapi endpoint is
retired, this will no longer be a token with special meaning.


superclient
~~~~~~~~~~~

This is another special scope, introduced for the /tokenapi endpoint and later
redefined and reused for the current persona solution.

In the context of the /tokenapi endpoint, this scope enables its bearer to access
the /tokenapi endpoint. For this to work, the token must also be approved by an
OIDC administrator.

In the context of the current persona solution, this scope serves for a client to
tell the OIDC server that it would like to inherit administrator access to the
server from the administrator approving the token (assuming that user was an
administrator). When this scope is approved by an administrator, the client can
then itself act as an administrator to the OIDC server. When this scope is *not*
present, or has not been granted, the token will be limited to always acting as
a regular user. When this scope *is* present, and has been granted by an
administrator, the client will be allowed to inherit administrator access from its
approving user and thus access the administration APIs.

In both cases, this scope is intended for use by the User Registry so that it can
provision new clients. It was reused to create backwards-compatibility between
versions of the ID3 OIDC server.

.. note::

   This scope is fundamentally incompatible with the
   ``initial-client-registration-token`` scope. There is nothing restricting it
   from being on the same token, but having a token with administrator access
   being handed over to an untrusted client is a giant security risk.
