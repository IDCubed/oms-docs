#
# Copyright (C) 2014 the Institute for Institutional Innovation by Data
# Driven Design Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE INSTITUTE FOR INSTITUTIONAL
# INNOVATION BY DATA DRIVEN DESIGN INC. BE LIABLE FOR ANY CLAIM,
# DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
# OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
# OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# Except as contained in this notice, the names of the Institute for
# Institutional Innovation by Data Driven Design Inc. shall not be used in
# advertising or otherwise to promote the sale, use or other dealings
# in this Software without prior written authorization from the
# Institute for Institutional Innovation by Data Driven Design Inc.

'''
Generate a set of build scripts, based on the list of repositories to be
included in the documentation build.

'''
import os
from jinja2 import FileSystemLoader, Environment

template_path = os.getcwd()

# Load jinja
jinja_loader = FileSystemLoader(template_path)
jinja_env = Environment(loader=jinja_loader)


# the list of sphinx build targets for generating the Makefile.
target_list = [
    'html',
    'singlehtml',
    'json',
    'text',
    'man',
    'changes',
    'linkcheck',
    'doctest',
]


# the list of repos/projects to look for sphinx docs in. these should exist up
# one level from here (in the directory structure).
project_list = [
    'oms-admin',
    'oms-core',
    'oms-deploy',
    'oms-experimental',
    'oms-kickstart',
    'oms-salt-core',
    'oms-salt-tcf',
    'oms-ui',
    'oms-vrc',
    'python-oidc',
]

# build template context dictionary (each variable is available in each template)
context = {
    'http_port': 9000,
    'live_reload_port': 9001,
    # the build path is relative to the oms-docs repo root (up one level)
    'build_path': '_build',
    'target_list': target_list,
    'doc_projects': project_list,
}


# the list of templates to render. these must end in .tpl for this to work.
templates = [
    # default Gruntfile for oms-docs
    'Gruntfile.js.tpl',
    # Gruntfile specific to building all doc projects in oms-*
    'Gruntfile-all.js.tpl',
    # and make is awesome so we only need one of these
    'Makefile.tpl',
]


for t in templates:
    template = jinja_env.get_template(t)
    rendered = template.render(**context)
 
    # To write to another file, instead of 'file.tpl', use `../file`
    write_to = os.path.join('..', t.strip('.tpl'))
    outfile = file(write_to,'w')
    outfile.write(rendered)
    outfile.close()
