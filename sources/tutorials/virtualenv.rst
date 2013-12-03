OMS Python webapps are installed into Python virtual environments created by virtualenv. We use {{{virtualenvwrapper.sh}}} as a utility in simplifying interacting with and managing these venvs for developers. Nothing fancy is being done here, and use of virtualenvs is becoming the norm for Python and Ruby developers, so expect nothing out of the ordinary. By default, all OMS webapp instances are installed as their own virtualenvs, and all virtualenvs live in {{{/var/www/python/}}}. Before hacking on an OMS webapp, the associated virtualenv must first be 'activated'.

For example, if you created an OMS webapp instance named {{{my_registry}}}, the following would activate the virtualenv for development:

{{{
export WORKON_HOME=/var/www/python
source /usr/local/bin/virtualenvwrapper.sh
workon my_registry
}}}

To launch the server for that app, continue as follows, replacing the port number as needed:

{{{
cd /var/www/python/my_registry
python oms_sandbox/manage.py runserver 0.0.0.0:8002
}}}

Afterwards, if you ever need to restart the server, you can use this command:

{{{
touch /var/www/python/my_registry/oms_sandbox/oms_sandbox/settings.py
}}}

For development, it makes a lot of sense to include the {{{$WORKON_HOME}}} export in your shell's rc config. eg, if using bash:

{{{
echo "export WORKON_HOME=/var/www/python" >> ~/.bash_aliases
}}}

