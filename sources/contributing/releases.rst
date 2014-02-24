:title: OMS Release Process
:description: How to Build an OMS Release
:keywords: contributing, oms, documentation, release, help, guideline


.. _contribute_release:

OMS Release Process
===================

Here is the high-level process, to be run on each git repo in the OMS release:

* The ``master`` branch is the latest stable release.
* During each sprint, developers hack on topic/feature branches based off of
  ``qa-develop``.
* At the end of each sprint, we cut a Release Candidate branch. This is then
  run through QA.
* when QA is complete, we merge the Release Candidate to ``master`` and create
  a new tag for the version released. Tags are signed with the IDCubed release
  signing key.
* If there were updates to the Release Candidate after branching off ``qa-develop``
  we merge these in to sync the development branch.


Cut Release Candidate
---------------------

For each repository in the release, we run:

* update the local copy to ensure we have the latest HEAD: ``git fetch --all -p``
* delete local copy of ``qa-develop`` branch, checkout clean from remote: ``git
  branch -D qa-develop && git checkout qa-develop``
* double check that the version is correct in setup.py or module init
* create a new branch for the release candidate. example: ``v0.8.3-rc``: ``git
  checkout -b v0.8.3-rc``
* push that new branch out to github: ``git push origin v0.8.3-rc``


Cut Release
-----------

* Checkout and merge to master: ``git checkout master && git merge v0.X.Y-RC``
* Update the commit message, because merge commits have terrible commit messages:
  ``git commit --amend`` - use the form: *merge v0.8.3 to master*
* Create a tag: ``git tag -s -m "$repo v0.8.3" v0.8.3 -u releases@idcubed.org``.
  Note that the email address specified tells git which gpg key to use when
  signing the release.
* Update github: ``git push origin master && git push --tags origin``


Build a Demo VM
---------------

Follow the :ref:`VM Builder's Guide <vm_builders_guide>` to create a VirtualBox
image with packer. The config for OMS Kickstart is already pointed at master, so
it should build and there ought to be no problem.

Create an importable appliance after running OMS Kickstart, this is the development
environment for this release.

:ref:`Deploy a Private TCC <deploy_private_tcc>` and then :ref:`Deploy the GPS
Demo TAB <gps_demo>`, and finally :ref:`the Perguntus Demo <perguntus_demo>`.
Create another importable applicance, this is the Demo VM for the release.


Signed Releases
---------------

All Open Mustard Seed releases are signed by the ID3 Release Signing Key:

.. code::

   -----BEGIN PGP PUBLIC KEY BLOCK-----
   Version: GnuPG v1.4.11 (GNU/Linux)
   
   mQINBFI7UZgBEADKhrfAiW1ZAlGM7RR2EML1veUFo3ldoZzDjVWNFHpBno9gdoY7
   rxZIKvAECavr6TnDVXkrUuAN94vqBM4a3tsbEYZoHu+neKZyUZAOxIj5ib/pZkkF
   Y39Zt3fQ8dy6t8CnKaGK+l4szXTiGzFZzgLLPr503xPmZxVyE6jXLL9XE4EgSOJd
   u38O8mVF1ZyOaQAvljA7oNFLIG//Zx2nh5aa2g5n/tkGcdNBD6TS++PNMB1r3GXD
   RgWjB/4+l/NY3xyvw3DGcQ5kkClRgG00KzQYUtwt4QSEot2tpVXzuiH9aR8d0LnO
   bkKROsxRASuxdhB7HOazZMyHS41jBM1vfy2RR4Fgwxh1bRW/RsHQnIhSHEJnnOmo
   YSqZjo2P8YBX366iTB+wRhVRCqi0wAyezEHqF+4Rm62zOmQYqlxv431JOIRMzeRB
   1zog1U8R/9/9whwfuxRDxpb6SqlWH/LKyJ0T+eLSKCIg62lAYXBP2xSGpiDPdcNC
   B6eUJQDqWNsC0AHSeEoHhGN+wAQtOuQD32MuGL6Ba71KobJFd9PAinj4uA2fbq1a
   JyeU9bj0X/FLN/R5P7aedG0gYPkjy+1LbtXNyJqigbRXFzZ8Wb2qn8AVsQT08xAr
   TGejMoMjwyGZLJ1t/kJk5Fj7Rqzx7ynyDtPivZRR0IUnAKNr3UVQQU8dBQARAQAB
   tDNJREN1YmVkIChSZWxlYXNlIFNpZ25pbmcgS2V5KSA8cGF0cmlja0BpZGN1YmVk
   Lm9yZz6JAj4EEwECACgFAlI7UZgCGwMFCQHhM4AGCwkIBwMCBhUIAgkKCwQWAgMB
   Ah4BAheAAAoJEIhAd2bmxiL7Y5wP/j9m5oG/r1Hfgl3irlNEYWai3U370FR517KW
   E0F1M+mi/7W133kZ8jDEpOnohv+I3rZbqofYML0PGWWwmw0NjcKBhfkWtkm8Qm38
   f0BNq9mYT1tuC7v+TT+V0rOQiXvU3CTBoTEtAFJUmxinQ4bpptJzKDRHU+rQDpu5
   drlAtY5AEUchvUoAY9NYnxltO3SmchXrSO6eVIWNyV39gEHSyuNzzRmY7UtXD9+3
   8AN55F6ZlYS6j691ECmitwJe4ykAFkllarqDm+t/uPHOemsPyHbfUH8gcum5qOxY
   uYnxydUqEv3S798soK4eY1F07j/nIghGC0KP/TTaej4Zg0+vNorHd6EsLAxyoLGk
   BrvovRyMRfiT3jMopPCTDHddaMTC4U36uWBki89I11l6KAO5+ehxyC+i7ZilqLoD
   lRBO7ZpwLKjdSSS9qRmM+sW6Wc7bz7coxY8u23VQuZWoPyT+Ek3fqLfRlHLwV01l
   hZ/f5vK2m/SorBmqXDTTxzR2O44QnQG9WWxEITpc0Vrh0OrLoKF1vPbKtS9MeOHo
   rGfRIUhJGbdubbb7RzlKol9iBm5AQLgrr1Ez3wJav9KMhmJmNE5MU0ltVfti6REO
   v/xSrn+ofvvSdTSp1Vc8GM05FjEBtUN10uIcBoEuU9jRSjVK5nu9dW4DBgcbhWiT
   zp2wN7k0uQINBFI7UZgBEADsTB1OFk0F8vQU5yxFKnd05/R3NISHG0MO/4PBW6JL
   RvCuM70XgKSL0a7sCfLEvbGLcDR17S7HXnC8JLsFa+m9a2oUI/BjdQJz2n8rJ8e2
   3Mz5L+ZblGEJeBKtjYj4QLEx6kDOuPruwEKSzOBwBy7eYKoRtO2O/bylz4OhyeV6
   xCTpqAgO22LNhSmwj3GgS2Q1Y5OrSUGuq+Ya6nbHNTrEvxaLuw0nXNikhqDU8FQM
   4a8D9Y/mY78DJJ7iA+d21MjwaJe+p2AZBHYeeApbRaKH+1KujzfJUzNv0aCmhnUF
   i3Vwn7WT25LvCXrHDeb9zGfA3MqLU9e+HUcsM523djKUxGy18zGce3TsXJ+e93Rf
   4mK/sT21e8VKAoip7y/mo7gEkfSQYIqQwJYVMfsZF9FTI8THdXen3SXfKykvfj74
   vMidrfIWYz6Qa2gZ5bdIHurusG5t+IUTkSMEW4oaQhB8tXNAs6EObcQdb2nIckZ/
   Q8aFp7ISTe+AsAsUrpamOkdrgFNOhp2F882qPlaBqMwPfWdNMCBuDi5fQV37x87N
   DfTB+y4EeANkSM62vJU9Y2VYcBM4hyNH8kZLhV2aL2BYrfKSWcrgIW1RECiOcY0A
   qW7Kb27XlYDpVPlSp1VgdZee/SY55mwjBDAy5Yv19e+8EzGdNAHZ0tu27VPxJCMj
   yQARAQABiQIlBBgBAgAPBQJSO1GYAhsMBQkB4TOAAAoJEIhAd2bmxiL76k4P/1zd
   V767MOPEhOS8GKqp10yf0Vo0OsXFWv7h6pafVBSUyRYmmdheB0zusaq7kfFMN4Lc
   oHdk6UNujhlYmUmEyFNObRzBY1QVvQsgxMJbCEfmryK15lLKkNgrB+HHshSGdtnf
   DfN4W4fadrbH0TjUkoDzTbXNBQ1O1LZKyeHl6zDqXYDAU+C55XX9NC0pErvPcBCY
   ZlKASe37O0pKHMq2SRkAgHNMzHsPiAPkxPKqTLNjDtJjtXF238Vwj+yE2p62CG31
   GDe0QH7ReXDJIEpD2enIlsjpaxFyT1J5hMPcAt6ahjBzdrj7QPjilZ3O/TuJD2d7
   5FLLc2jWLjx9/NMzmZyxqogS7Ft1rpBUOouOy0VCulqoipPklcuZ9KEmFhD04HFG
   zlOgIMVK7/TXLDW+9LltT62xUWuHSUdEST7Dv0M1FRTNvSQVoebtZWpPPIMtdg+B
   9h651RiF0t+yk10C+/T66nA0MC2wFwRmdREqF498idlRDZW5gXhH9dIldvoZrDzt
   sger3q30pvVItzeWLJ1JHcvYUkwxa7idpG121rvDds3oiA21Ujqv6DNgNYqbeD0F
   n5Gj97rLN9PENTGLvXHoV3DXHcIW1YFI5IQYh9hG+mwmtmHIIo3xLv4qJsvq+OXs
   38xz86fWFSnGuP9BAgXpzc1M2GL76rj+SKU/CyCS
   =9CoI
   -----END PGP PUBLIC KEY BLOCK-----

Importing the Release Signing Key
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To verify the authenticity of the OMS release and source code, we recommend
importing and reviewing the Release Signing Key into your GPG Keyring:


.. code::

   wget -O - http://docs.openmustardseed.org/_static/oms-rsk.gpg | gpg --import -


You should then be able to list the key, having imported it into your keyring:

.. code::

   isis % gpg --list-keys
   /home/oms/.gnupg/pubring.gpg
   ----------------------------
   
   pub   4096R/E6C622FB 2013-09-19 [expires: 2014-09-19]
   uid                  IDCubed (Release Signing Key) <patrick@idcubed.org>
   sub   4096R/03C510CB 2013-09-19 [expires: 2014-09-19]


.. note::

   To export a public key to share with others, use GPG's ``--armor``, and
   ``--export`` parameters.
