#pragma section-numbers on
<<TableOfContents()>>

==== SSH keys at Rackspace: ====
----

If you would rather {{{ssh}}} back and forth between our development servers and not have to enter your password each time, see [[https://help.ubuntu.com/community/SSH/OpenSSH/Keys|Ubuntu OpenSSH Keys]]


==== SSH keys at GitHub: ====
----

Things run better if you have an ssh key installed at !GitHub.  To do so, first make a ssh key on your localhost:

{{{
cd ~/.ssh
ssh-keygen -t rsa
cat id_rsa.pub
}}}
Now add the text of {{{id_rsa.pub}}} to the list of ssh keys at: https://github.com/settings/ssh

If you have a passphrase setup with your key, you may want to take a look at keychain: [[https://help.ubuntu.com/community/QuickTips#Tip_.233_Keychain_-_Manage_ssh_keys|Keychain - Manage ssh keys]]

To install keychain to take care of having to enter your passphase multiple times:

{{{
sudo apt-get install keychain
}}}
Now add the following lines to your .bashrc (or equivalent) file:

{{{
keychain ~/.ssh/id_rsa
. ~/.keychain/$HOSTNAME-sh
. ~/.keychain/$HOSTNAME-sh-gpg
}}}

