:title: Token Retrieval
:description: How to Obtain And Persist a Token 
:keywords: oms, oidc, token, management


.. _token_retrieval:

OIDC Token Retrieval
====================

All information here comes from RFC 6749, for the OAuth 2 specification:
`http://tools.ietf.org/html/rfc6749 <http://tools.ietf.org/html/rfc6749>`_. This
page aims to present a little summary here so that one can find what one needs
for the purposes of OMS without having to review the paper.


Summary of Token Approval Flows
-------------------------------

OAuth 2 specifies two types of token approval flows: user and non-user. This
section will discuss what flows are present as well as what each flow is meant
for and what advantages and disadvantages it has over others. This is meant to
be a summary of what is available, with the section below containing all the
details.


User Approval Flows (AKA Interactive Flows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A user approval flow involves a user performing some action to approve a token
(e.g. hitting an Approve button). It always involves exactly three actors: the
OAuth server (e.g. OIDC), the user who approves access and the client requesting
access. All user-approval flows are closely-tailored for web clients with a user
present. The client must be registered into the server in advance and is never
allowed to request more than it has been registered for. With the user approving
a token, the user is able to approve less access than what the client is asking
for by virtue of unchecking the scope checkboxes before hitting Approve. There
are two user approval flows specified within OAuth 2 and supported by OIDC:
implicit grant and authorization code grant. 

One important detail to note: within the OIDC implementation of the OAuth
protocol, any token approved by user is associated with that user permanently
and is permitted the same access to the server that user would have. For
example, a token approved by an administrator would be usable by that client to
administer the OIDC server on user's behalf. As of version 0.8, this is being
used to enable the so-called "superclient" solution.


**Implicit Grant (AKA Implicit Approval)**

As of v.0.8, this is what all OMS clients use to get an access token, and this
poses a problem. The flow is intended for lightweight clients with no access to
a backend or persistent storage, for example a client written entirely within
Javascript and running within the user's browser. Such convenience comes at a
high price, though: the client is not authenticated to the OIDC server, in
theory allowing a black hat to use cross-site scripting to inject malicious
script impersonating a valid client, and then trick the user into approving a
token for it. Another even bigger restriction is, there is absolutely no way to
persist the access granted by the user: once the access token expires, so does
the access. There is nothing to do but have the client request access from the
user again, going through a full user approval, every time. A client has to ask
for user approval every hour, the default lifespan of an access token. There is,
of course, a way to increase the default, but this undermines to security of the
OAuth as a long-lived access token becomes a security target. Another limitation
is, with implicit approval one can only get one access token with all the access
approved, there is no way to split it up among multiple tokens: the entire
client has to share a single token.


**Authorization Code Grant (AKA Basic Approval)**

This is the preferred way to get a token from the server, as it addresses all of
the disadvantages the implicit grant has. It does so at the expense of some
added complexity in the form of an additional interaction: a client requires
access to a backend as an authorization code is being delivered to it with a
callback from the OIDC server, and then has to make an additional call with that
authorization code to get a token. This authorization code is very short lived
and is for single-use only, but can be used to issue a refresh token, which
opens the doors to functionality like splitting access to multiple access
tokens, and then reissue them once they expire, persisting a client's access
indefinitely. A client will need access to a backend to receive the authorization
code for it, and then keep track of all your access and refresh tokens as they
get issued, expire and get replaced. Note that if a client allows the refresh
token itself to lapse, it will still have to ask for a full user approval as the
authorization code issued to it is no longer valid. Also, according to the
specification, sending a token after it has been replaced SHOULD cause the
corresponding newly-issued token to be instantly invalidated, though OIDC does
not seem to do this as of version 1.0.5. This invalidation is meant to be part
of a mechanism to protect against a token getting intercepted in a
Man-In-The-Middle scenarios.


Non-User Approval Flows (AKA Non-Interactive Flows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This type of flows are very different from the ones above: there are only two
actors here: the OAuth server and the client. The user is indirectly involved by
registering the client with the server with the access it is allowed to request
in advance, and may or may not be present for the actual approval. These flows
are usable by web clients, but can also be utilized by non-web-based clients. In
general, these flows are much simpler than the user approval flows to execute,
but that's a problem in itself as now careful setup of the OAuth server is
crucial and mistakes result in wrongly denied, or worse: wrongly granted access.
The client is still not allowed to request anything it is not registered to
request, but will now automatically be granted everything it requests within
those boundaries.


**Client Credentials Grant**

Here the client is registered with the OIDC server with particular credentials:
typically a client ID and a secret, though other options are available. The
client approaches the OIDC Server with those credentials, and receives a token
for the access requested. No refresh token is issued with this grant type, or is
meaningful to be issued, as the client is managing its access with its
credentials directly. The resulting token does not have a user associated with
it, unless the token is being issued to a Managed Client as described by the
:ref:`Dynamic Client Registration <dynamic_client_registration>` page. Whenever
the token does not have a user associated with it, it does not allow any access
to the OIDC server beyond granting and persisting the token.


**Resource Owner Credentials Grant**

Here the client obtains a token very much as above, except that now user's
credentials are being used directly. This goes very much against everything
OAuth serves to address, but this type of grant can integrate legacy frontends
written to work with user credentials directly, with an OAuth server for the
purposes of authentication and even authorization. In the context of a problem
the OMS team was facing at one point, this flow would enable Jenkins to
authenticate a user with the OIDC server, though doing so would still require a
specially-written plugin for the job. As of version OIDC 1.0.5, MITRE does not
support this grant type, though the underlying library supports it. In theory,
support can be added.

The use of this flow is depreciated: using it sacrifices most advantages to
having an OAuth server present as user's credentials are still being passed
around through clients.


Token Approval Flows In Detail
------------------------------

This section lays out each approval flow in details, complete with examples. The
narrative below adds some implementation-specific notes not part of the RFC
above.


User Approval Flows (AKA Interactive Flows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

All such flows have a lot in common: the client redirects the user's browser to
the Authorization endpoint, asking for access. The OIDC server responds by
returning a login form in HTML for the user to log in on. On doing so, the user
is presented with an approval page. Upon approving access, the OIDC server
redirects the user back to the client. It is at this point where the two flows
diverge.


**Implicit Grant (AKA Implicit Approval)**

Below is an example of an implicit grant flow perform with a web browser. The
test client in this case is a Chrome plugin generating an HTTP GET request on an
OIDC server's authorization endpoint. The fields of the request are listed and
explained at `http://tools.ietf.org/html/rfc6749#section-4.2.1 <http://tools.ietf.org/html/rfc6749#section-4.2.1>`_. It is highly recommended to make use of the state parameter as it is used to prevent replay attacks: a client simply has to generate a random number and verify if it is getting the same value back with its token. If it does not, it should reject the token and handle as an error.

REQUEST:

.. code::

   GET https://localhost/oidc/authorize?response_type=token&client_id=id3-oic-demo-client&redirect_uri=https://localhost/oidc-demo&scope=openid+profile&state=12345


RESPONSE: 

.. code::

   302 Moved Temporarily
   Location: https://localhost/oidc/login


Upon following the redirection, the user gets presented with a log in page
within the web browser. Upon logging in, they are presented with an access
approval page. The user chooses a persona and clicks ``Authorize``.

Server returns the following. Note that an HTML fragment is not passed to the HTTP server when redirecting and the request has to be intercepted in order to extract the token from it. All response fields are listed and explained at `http://tools.ietf.org/html/rfc6749#section-4.2.2 <http://tools.ietf.org/html/rfc6749#section-4.2.2>`_. Note that the state parameter is mirrored back to the client.


RESPONSE: 

.. code::

   302 Moved Temporarily
   Location: https://localhost/oidc-demo/#access_token=eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MjcxNDYsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiI0ZDY2YzRkNC00YzkxLTQwZjQtYTY5YS1iZjMyNjkzODAxYjQiLCJpYXQiOjEzNzc5OTExNDd9.oINDnU1hplKIOSqZiFJoEKLTrUv0ttz6F9yiyQhpkCG450MgAYvJz8RvSSA7SMPsHtjB89cBpiXFBJ6pkx2v8YdRcFSnC8iYGbApqMnddQQa1GXGYX3FGioXqT_h-jho1LabtQiyEcXKJTYii5CbDPLzWmv7PFTXBR9ZiN_Ziiw&token_type=Bearer&state=12345&expires_in=31535999&id_token=eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MjcxNDcsInN1YiI6ImFkbWluIiwiYXRfaGFzaCI6ImVvdFZMYkUxS1lMZm1hS002ZE50VEEiLCJhdWQiOlsiaWQzLW9pYy1kZW1vLWNsaWVudCJdLCJpc3MiOiJodHRwczpcL1wvbG9jYWxob3N0XC9pZG9pY1wvIiwiaWF0IjoxMzc3OTkxMTQ3fQ.Gg9VefoSMTwIS1qn4IrCq6WCF2Vk2HIwf76a6WfbEpe3JukH98MW6OaLAdBj47h_sebR37habqm8TfZnYNpkzRelWWuE6SOhPdcQBB2wousK38d7agjWCuxDqh5yxekRs3FQAydgW71N31sGD4A7c0CTC_bp34uOCEYDiEodka8


Note that the OIDC server will redirect even when the user does not approve the
request, or if there is an error. Below is the response in case the request is
declined. The meaning of all parameters returned is explained at `http://tools.ietf.org/html/rfc6749#section-4.2.2.1 <http://tools.ietf.org/html/rfc6749#section-4.2.2.1>`_.


RESPONSE:

.. code::

   302 Moved Temporarily
   Location: https://localhost/oidc-demo/#error=access_denied&error_description=User+denied+access&state=12345


**Authorization Code Grant (AKA Basic Approval)**

Again, the client creates a request to the Authorization endpoint, this time 
etting response_type to "code". This is all that changes from above. All the
parameters part of the request are listed and explained at `http://tools.ietf.org/html/rfc6749#section-4.1.1 <http://tools.ietf.org/html/rfc6749#section-4.1.1>`_. The Response is much the same.

Again, please consider setting the state parameter to something random, and then
check if you are getting the exact same string with your authorization code.


REQUEST:

.. code::

   GET https://localhost/oidc/authorize?response_type=code&client_id=id3-oic-demo-client&redirect_uri=https://localhost/oidc-demo&scope=openid+profile&state=12345


RESPONSE: 

.. code::

   302 Moved Temporarily
   Location: https://localhost/oidc/login


Again, the user is redirected to a login page and logs in. Again, the user is
presented with an approval page, chooses a persona and clicks "Authorize".

Server now redirects to the client, this time using a query parameter to pass
the authorization code, which is passed to the HTTP server. All parameters being
returned are listed and explained at `http://tools.ietf.org/html/rfc6749#section-4.1.2 <http://tools.ietf.org/html/rfc6749#section-4.1.2>`_.


RESPONSE:

.. code::

   302 Moved Temporarily
   https://localhost/oidc-demo/?code=6vycYm&state=12345

There is an additional interaction now: the authorization code is not an access
token, and turning it into one takes an extra step.

The client POSTs on the token endpoint, passing its client credentials using
basic authorization. All parameters being POSTed are listed and explained at `http://tools.ietf.org/html/rfc6749#section-4.1.3 <http://tools.ietf.org/html/rfc6749#section-4.1.3>`_ and the parameters returned with the response are similarly explained at `http://tools.ietf.org/html/rfc6749#section-5.1 <http://tools.ietf.org/html/rfc6749#section-5.1>`_.


REQUEST:

.. code::

   POST https://localhost/oidc/token
   Authorization: Basic aWQzLW9pYy1kZW1vLWNsaWVudDpjMmIzZTA4MC0xOTIzLTRiMTYtOWE4NS03ODYxMDRkMjljZjg=
   Content-Type: application/x-www-form-urlencoded 

   grant_type=authorization_code&code=6vycYm&state=123456&redirect_uri=https%3A%2F%2Flocalhost%2Foidc-demo


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=UTF-8 

   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MjkzMzAsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiJiMzQyYTMyZC03ZThjLTQwYjgtYjM3Yi02OTQ0MGIzZGM0MDkiLCJpYXQiOjEzNzc5OTMzMzF9.ao72nEdmu36M1yfgR0Z8tRHFUlAdQhh1o5stB2WsAksn1vEwhYHy_7Zy6P--0DYur1bVOcfSa_hzqoGqTFh_yYpsHD_9T3KQZV_7fDfTyyXJnpD-tNiSvYrgBTrbYgwrKQD1U0R3aOCoQNXdnMH24noGdqydFN8cQQ_RFYZ1WyU",
   "token_type":"Bearer",
   "expires_in":31535999,
   "scope":"openid profile",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MjkzMzEsInN1YiI6ImFkbWluIiwiYXVkIjpbImlkMy1vaWMtZGVtby1jbGllbnQiXSwiaXNzIjoiaHR0cHM6XC9cL2xvY2FsaG9zdFwvaWRvaWNcLyIsImlhdCI6MTM3Nzk5MzMzMX0.0yxqP4ofXpo6fB9XWo5SdgmmqGUerr_z1JpdHjLo3p97fQdZMx0duqsubQDFiOr1k-s7jbY1T4Gjtd0ov_fXvOo4QX6CiPPNBPhk4mTHBJ2VZJ54w3loo9yq5SH2clzuJoyJUwYdnemu2Jg-QBxxM1IiFLrIOqW2FtfB-VE5QH8"
   }


One of the advantage of the authorization code flow is the ability to request a
refresh token in order to persist access. In order to receive a refresh token as
well, the client must be allowed the refresh_token grant type (in the admin page
go to "Manage Client" > "Edit" on the client > "Tokens" > "Refresh Token" must
be checked). Also, the client must have and be requesting the offline_access
scope. In this case the response will look like this:


RESPONSE:

.. code::
   
   200 OK
   Content-Type: application/json;charset=UTF-8 

   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzA0MjIsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiJkMjkzMmQ5NS00MmYxLTQ4YTgtOTY0Yy1lY2MzZGI1MzIwYmYiLCJpYXQiOjEzNzc5OTQ0MjN9.1MybazKdnayrrQQxqrkbwma6ypPF8Pr42FZKABBM0HGtpKx8JfsMEMVBHZcrG1gmSc-Ikga2SFRD27UXEZmok5yZ7xfWPpxZv1VIKtx4T_DucMjgcTaxSvTNnklPQUau5X9f6OFO08HGdKjRqyO-CGARny6ny4Aavs77jRj0Cjk",
   "token_type":"Bearer",
   "refresh_token":"eyJhbGciOiJub25lIn0.eyJleHAiOjEzNzg1OTkyMjIsImp0aSI6ImFjZjEyNGYyLTljMGMtNDUzZS05MGNhLTQyMjVjMmJhZjU0ZiJ9.",
   "expires_in":31535999,
   "scope":"offline_access openid profile",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzA0MjMsInN1YiI6ImFkbWluIiwiYXVkIjpbImlkMy1vaWMtZGVtby1jbGllbnQiXSwiaXNzIjoiaHR0cHM6XC9cL2xvY2FsaG9zdFwvaWRvaWNcLyIsImlhdCI6MTM3Nzk5NDQyM30.RheJLyxOQcedwjQK_pLVWCN3TDnBpKEXbM9ajjmUlI8ApQe1jsiR2zlRGwudMoRD2bZ9xg3o_cKZ_REGXtmSs-DqgsjAlZFgbogz13mdbv4lEL_14muH5B5P2xm1BVIo1UDiakD8jq-KCyXh54_F5kLBPWxxt1ntHJSH0qv0HdI"
   }


**Uses Of A Refresh Token**

The refresh token is what represents the access approved by the user and in that
it is very much like a long-lived authorization code. It should never be used
for accessing protected resources directly, but can be used to replace access
tokens. It is also what allows a client to break down their access between
multiple access tokens. For this to work, the refresh token is much longer-lived
and must be protected even better than your access tokens are. When working with
refresh tokens, every access token obtained will be coming with a refresh token,
which may or may not be just the original refresh token mirrored back, however
should it ever change, the client must stop using the old one immediately,
replacing it with the new one. 

In the previous call, the refresh token returned was this:


.. code::

   eyJhbGciOiJub25lIn0.eyJleHAiOjEzNzg1OTkyMjIsImp0aSI6ImFjZjEyNGYyLTljMGMtNDUzZS05MGNhLTQyMjVjMmJhZjU0ZiJ9.


This section describes how to replace and break down the original token above
into multiple new ones.

Breaking down access is the simple act of requesting a new access token with
fewer scopes than originally granted. Note that as far as personas are
concerned, every token has all the original personas granted and there is no
mechanism to control this at the time of writing.


REQUEST:

.. code::

   POST https://localhost/oidc/token
   Content-Type: application/x-www-form-urlencoded 

   Authorization: Basic aWQzLW9pYy1kZW1vLWNsaWVudDpjMmIzZTA4MC0xOTIzLTRiMTYtOWE4NS03ODYxMDRkMjljZjg=

   grant_type=refresh_token&refresh_token=eyJhbGciOiJub25lIn0.eyJleHAiOjEzNzg1OTkyMjIsImp0aSI6ImFjZjEyNGYyLTljMGMtNDUzZS05MGNhLTQyMjVjMmJhZjU0ZiJ9.&scope=openid


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=UTF-8 

   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzEwMTEsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiIxZDY0NTcwZC03MmVmLTQ4NGItYjY4OS1kNzg1YzdiNmMxYjUiLCJpYXQiOjEzNzc5OTUwMTF9.olNL834QMDsq_ziXryroQsqHnkZzqGGvSlffFwstwU0esNRa_FuLiD3T3Hf9BUHNNM5aejKKkEyODSW7Lz1CYFkJdwZTF9Fa1oBxRclQgoFc-ihcf5HtsDCDmRhghRL_SIGhzL78Mr099VhgrdnpMohALYZbPG0HKKeXJl4Resk",
   "token_type":"Bearer",
   "refresh_token":"eyJhbGciOiJub25lIn0.eyJleHAiOjEzNzg1OTkyMjIsImp0aSI6ImFjZjEyNGYyLTljMGMtNDUzZS05MGNhLTQyMjVjMmJhZjU0ZiJ9.",
   "expires_in":31535999,
   "scope":"openid",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzEwMTEsInN1YiI6ImFkbWluIiwiYXVkIjpbImlkMy1vaWMtZGVtby1jbGllbnQiXSwiaXNzIjoiaHR0cHM6XC9cL2xvY2FsaG9zdFwvaWRvaWNcLyIsImlhdCI6MTM3Nzk5NTAxMX0.tr9ripP7_7dajGbOf4E2miHt1XatVZ08X84uAo7eD1sP3qtl1PGQBMZqj8dTYwoY2xykXRnSkc2gj8k65mfT24Tz6Bs8BD5mZ6NQwmiV9tCGjdnNzHvyGMVUK07fQid79vSfkSOWJz1WVsOvbDZwwqivoRfKnZ073x9ZW-mYh6E"
   }


Replacing an access token is the act of requesting a new access token with
exactly the same access as the original access token:


REQUEST:

.. code::

   POST https://localhost/oidc/token
   Content-Type: application/x-www-form-urlencoded 

   Authorization: Basic aWQzLW9pYy1kZW1vLWNsaWVudDpjMmIzZTA4MC0xOTIzLTRiMTYtOWE4NS03ODYxMDRkMjljZjg=

   grant_type=refresh_token&refresh_token=eyJhbGciOiJub25lIn0.eyJleHAiOjEzNzg1OTkyMjIsImp0aSI6ImFjZjEyNGYyLTljMGMtNDUzZS05MGNhLTQyMjVjMmJhZjU0ZiJ9.&scope=openid+profile+offline_access


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=UTF-8 

   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzE2MDMsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiIxMWRkMGE4Yy03ZTdhLTQxNjMtYjU2Mi00NjJmZjAyMTk2YmMiLCJpYXQiOjEzNzc5OTU2MDN9.Umf9coRuUM8XviU04qw6deISIk59W0dBxh3K8D_YvU7ULAfiHkIVpyLK4iaDeeRYudeleo0-fYIxC3b4TP9Tthtb3XtNtC6B34Pqui7EoxcZwVkXEB_iCrVZhKDoytRtM2_9SThQssNrP6LaET7jMJngiObdoutR_ntc0ItGXUk",
   "token_type":"Bearer",
   "refresh_token":"eyJhbGciOiJub25lIn0.eyJleHAiOjEzNzg1OTkyMjIsImp0aSI6ImFjZjEyNGYyLTljMGMtNDUzZS05MGNhLTQyMjVjMmJhZjU0ZiJ9.",
   "expires_in":31535999,
   "scope":"offline_access openid profile",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzE2MDMsInN1YiI6ImFkbWluIiwiYXVkIjpbImlkMy1vaWMtZGVtby1jbGllbnQiXSwiaXNzIjoiaHR0cHM6XC9cL2xvY2FsaG9zdFwvaWRvaWNcLyIsImlhdCI6MTM3Nzk5NTYwM30.PZrp7RY9FYT-fjwGgPJ4_scONMxjsS8meGEqkx7YR-dPU2pDoj61kExxuHIvnYKvoyJ0Zv9a40oTzf5PC5ka14xw29x7AZ-IcH4c2VTTpgEAKFz3-cLTKbNuL4KOE6oOHjuDV0Dc8gs3SfDyhF52LblOC78J6FUX15WGBgGfUXM"
   }


Refresh tokens are a big topic in the OAuth2 RFC, there is some additional
information on the subject at `http://tools.ietf.org/html/rfc6749#section-1.5 <http://tools.ietf.org/html/rfc6749#section-1.5>`_, and the examples above are coming with very little modification from `http://tools.ietf.org/html/rfc6749#section-6 <http://tools.ietf.org/html/rfc6749#section-6>`_.
With the two examples above, a client can persist its access indefinitely and also manage its access.


Non-User Approval Flows (AKA Non-Interactive Flows)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As mentioned above, non-user flows are targeting non-web clients and web clients
where the user is not available to approve access. The client registration
record is used as a guideline regarding what is allowed and what isn't, and the
only difference between the flows is what type of credentials are being used to
authorize the request.


**Client Credentials Grant**

Compared to the user approvals, this is rather straightforward: The client POSTs
a simple request with its client's credentials and get a token in return.

All the parameters are listed and explained at `http://tools.ietf.org/html/rfc6749#section-4.4.2 <http://tools.ietf.org/html/rfc6749#section-4.4.2>`_ with the response being the standard response at `http://tools.ietf.org/html/rfc6749#section-5.1 <http://tools.ietf.org/html/rfc6749#section-5.1>`_.

REQUEST:

.. code::

   POST https://localhost/oidc/token
   Authorization: Basic aWQzLW9pYy1kZW1vLWNsaWVudDpjMmIzZTA4MC0xOTIzLTRiMTYtOWE4NS03ODYxMDRkMjljZjg=
   Content-Type: application/x-www-form-urlencoded 

   grant_type=client_credentials&scope=openid+profile+offline_access


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=UTF-8 

   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzU1OTAsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiJlOWYzY2JhYy00MjM3LTQ0MmMtOTJjNi1jNDE2MDUyOGZlMzYiLCJpYXQiOjEzNzc5OTk1OTB9.NgItPIcnmEVYxetOrPhFuemFembJ-0MARGnhdN2pWDE3tfPrnHiaBOAk6rZ-Rul36a9A39hoBgT7KBnb9Mgnr1hpVPWNpuknRH6ZASd53z_Mn3LkqZd4o-7bImF1ETjLpW_GSGvgax57Pt_3WnG3gKkmUELO__3jHbFzz92ek24",
   "token_type":"Bearer",
   "expires_in":31535999,
   "scope":"offline_access openid profile",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzU1OTAsInN1YiI6ImlkMy1vaWMtZGVtby1jbGllbnQiLCJhdWQiOlsiaWQzLW9pYy1kZW1vLWNsaWVudCJdLCJpc3MiOiJodHRwczpcL1wvbG9jYWxob3N0XC9pZG9pY1wvIiwiaWF0IjoxMzc3OTk5NTkwfQ.1NAulXKiKWaDfKjOvv3ajlKPSbP-5Wt35Te3g40Bbl_GWkBILu5xQbFQn1dgfqTtj_sw-mCO42xW5G-c64NV3sfyr7i2W9nPECfVaPN43yeIVf293JJoiq71Sr1v9FIKEc-eknhTKfSGNXmjHXQW2bV13IWph7whHJbtB1O_fbw"
   }

Breaking down client's access between tokens is performed by requesting as many
access tokens as needed with the right access for each using the client
credentials flow. Once they expire, they are replaced by requesting a new one
with client credentials. There is never a refresh token generated by a client
credentials flow.

Unless the client is a Managed Client, there is no user involvement and the
resulting tokens do not have any personas. A Managed Client will consistently be
getting tokens with whatever personas the client was registered with. Those
personas, called governing personas, will also act to enforce access
restrictions on the client.


**Resource Owner Credentials Grant**

This type of grant is specified within the OAuth2 specs, but as of version 1.0.5
MITRE's OIDC does not appear to add support for it. Adding support for it is
possible, as the underlying library supports it. As of version 0.8 this does not
work with no current plans to support it. As mentioned above, this type of grant
is depreciated and is only used to provide token support for legacy systems.

The request is very much like above. Note that a resource owner credentials flow
passes both client **and** resource owner credentials.


REQUEST:

.. code::

   POST https://localhost/oidc/token
   Content-Type: application/x-www-form-urlencoded 
   Authorization: Basic aWQzLW9pYy1kZW1vLWNsaWVudDpjMmIzZTA4MC0xOTIzLTRiMTYtOWE4NS03ODYxMDRkMjljZjg=

   grant_type=password&username=admin&password=admin&scope=openid+profile+offline_access

The expected response is like above, except that this flow does allow for a
refresh token to be returned as well. In this context, a refresh token makes a
lot of sense as user's credentials are not being stored by the client and then
passed back and forth all the time. 

Currently this simply returns a 400 response and an error message saying
``Unsupported grant type``. 


RESPONSE:

.. code::

   200 OK
   Content-Type: application/json;charset=UTF-8 

   {
   "access_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzU1OTAsImF1ZCI6WyJpZDMtb2ljLWRlbW8tY2xpZW50Il0sImlzcyI6Imh0dHBzOlwvXC9sb2NhbGhvc3RcL2lkb2ljXC8iLCJqdGkiOiJlOWYzY2JhYy00MjM3LTQ0MmMtOTJjNi1jNDE2MDUyOGZlMzYiLCJpYXQiOjEzNzc5OTk1OTB9.NgItPIcnmEVYxetOrPhFuemFembJ-0MARGnhdN2pWDE3tfPrnHiaBOAk6rZ-Rul36a9A39hoBgT7KBnb9Mgnr1hpVPWNpuknRH6ZASd53z_Mn3LkqZd4o-7bImF1ETjLpW_GSGvgax57Pt_3WnG3gKkmUELO__3jHbFzz92ek24",
   "token_type":"Bearer",
   "expires_in":31535999,
   "scope":"offline_access openid profile",
   "id_token":"eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE0MDk1MzU1OTAsInN1YiI6ImlkMy1vaWMtZGVtby1jbGllbnQiLCJhdWQiOlsiaWQzLW9pYy1kZW1vLWNsaWVudCJdLCJpc3MiOiJodHRwczpcL1wvbG9jYWxob3N0XC9pZG9pY1wvIiwiaWF0IjoxMzc3OTk5NTkwfQ.1NAulXKiKWaDfKjOvv3ajlKPSbP-5Wt35Te3g40Bbl_GWkBILu5xQbFQn1dgfqTtj_sw-mCO42xW5G-c64NV3sfyr7i2W9nPECfVaPN43yeIVf293JJoiq71Sr1v9FIKEc-eknhTKfSGNXmjHXQW2bV13IWph7whHJbtB1O_fbw"
   }
