# Open Mustard Seed Documentation

The OMS docs can be viewed online at http://docs.openmustardseed.org

All source code for these docs is available in this repository. If you would
like to contribute updates or additions to the OMS documentation, please start
by reviewing the information in the rest of this README.. it will help you get
started.


## Getting Started

### Installation

* It is best to install python packages into a virtualenv, and leave your system
  packages alone, but using virtualenv is outside the scope of this quickstart.
* Either way, install the oms-docs dependencies with pip:

  ```
    pip install -r requirements.txt`
  ```

* If pip is not available you can probably install it using your favorite
  package manager as **python-pip**


### Hacking on Docs

* Each of the .rst files under sources reflects a page on the documentation.
* Edit the `.rst` files with your favorite editor to your liking.
* Run `make docs` to build the .rst into static .html with all CSS/js/etc
  properly linked and bundled together for you..
* The rendered, static  website can now be found in the ``_build`` directory.
* To preview what you have generated run `make server` and open
  http://localhost:9000/ in your favorite browser.
* If it seems updates you have made are not taking effect, you may need to
  remove the build directory with: ``rm -rf _build``


### Use GitHub's file editor

Alternatively, for small changes and typo's you might want to use GitHub's built
in file editor. It allows you to preview your changes right online. Please be
careful to avoid creating many commits when working with the Github editor, we
may ask you to squash your commits (or do it for you) before merging your
updates.


### Additional Notes

* Please wrap all lines at 80 characters, except where a long URL overflows
* Please remove additional whitespace, at end of lines, tabs in empty lines, etc
* Keep each commit focused on one type of contextual update, and linked to a
  ticket, just like with our source code.
* Follow existing/established conventions as much as possible, consistency makes
  it easy for others to get involved.


## Using Sphinx and ReST

### Sphinx and ReST Resources

* http://sphinx-doc.org
* http://matplotlib.org/sampledoc/cheatsheet.html
* http://docutils.sourceforge.net/docs/user/rst/quickstart.html

Most of us learn this stuff by reading other source, so feel free to poke around
what you see here, or in other projects as examples - django, docker, and many
others have great docs rendered with sphinx.


### Adding New Sections

A top-level section will need a new directory created under ``sources`` as well
as an entry in ``sources/toctree.rst``, such as: ``API <api/index>``. Then
create ``sources/new_section/index.rst``. If the new section will only have a
single page, add all section content to this file. If the new section will have
sub-sections, create each as another page within ``sources/new_section/`` and
leave ``sources/new_section/index.rst`` with just a ``toctree`` directive like:

  ```
    .. toctree::
       :maxdepth: 1

       Initial Deployment <first_steps>
       Virtual Resource Controller <vrc>
       Trust Network <trust_network>
  ```



### Headings

  ```
    Top-Level Heading
    =================

    Next Level Down
    ---------------

    Then Still Further
    ~~~~~~~~~~~~~~~~~~
  ```

See also [this bit about document and section titles and headers](http://docutils.sourceforge.net/docs/user/rst/quickstart.html#id21)


### Creating Links

To make links to specific places within the documentation, first create a link
target:

  ```
    .. _introduction:

    Introduction to ...
    ===================

    This is..
  ```

``_introduction`` is the link target and can then be referenced elsewhere in
the documentation with:

  ```

    Start with an :ref:`Introduction to OMS <introduction>` ...
  ```

### Embedding Images

If embedding an image ``Trust_Framework_Features.png`` into a page within the
``introduction`` section, you would first add the image to the directory:
``sources/introduction/images/``.

Then, reference the image in your .rst document with:

  ```
   .. image:: images/Trust_Framework_Features.png
      :alt: Trusted Compute Framework Features
      :align: center
  ```

Note that only the ``.. image: path/to/image.png`` is required, the other
parameters to the image directive are optional.


### Notes, warnings, etc..

  ```
    # a note (use when something is important)
    .. note::

    # a warning (orange)
    .. warning::

    # danger (red, use sparsely)
    .. danger::
  ```


### Code examples

Include code examples with:

  ```
    .. code-block:: bash

       # here is my example
       ls -alh /
  ```

And a python block may look like:

  ```
    .. code-block:: python

       print('hello world')
  ```

### Tables

Tables require some-what specific formatting, but are very easy to write. There
are two styles, [detailed in this overview](http://sphinx-doc.org/rest.html#tables).

The file ``sources/tutorials/gps_demo.rst`` has a good example of a large table
that is both readable and easy to maintain.

The primary requirements are that the directive lines (the ===) match up with
the widths of text in each column.


## Editing THIS readme.md

[This guide](http://daringfireball.net/projects/markdown/syntax) it a good place
to start, but note that Github's *flavor* of Markdown has differences.

See [Github's help doc](https://help.github.com/articles/github-flavored-markdown)
for details on their version of Markdown.
