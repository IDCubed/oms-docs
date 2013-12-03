<<TableOfContents()>>

= Online documentation with Sphinx and Read the Docs =

[[http://sphinx-doc.org|Sphinx]] is a tool for the creation and maintenance of up-to-date online documentation.  It is designed especially for Python code and integrates nicely with [[https://readthedocs.org|Read the Docs]] (RtD), a free documentation hosting service.

== Setting up Sphinx ==

To install Sphinx, run the following command:

{{{
$ pip install Sphinx
}}}

Next, create a directory called "docs" at the top level of your source code repository.  Go into the "docs" directory and execute the following:

{{{
$ sphinx-quickstart
}}}

You will be guided through a command-line wizard to set up your documentation.  Except for some basic information about your project, you can accept most default values.  Use the output from this Sphinx 1.1.3 interactive session as a a guide, replacing "PROJECT_NAME", "AUTHOR_NAME", and "VERSION" with the appropriate values:

{{{
$ sphinx-quickstart 
Welcome to the Sphinx 1.1.3 quickstart utility.

Please enter values for the following settings (just press Enter to
accept a default value, if one is given in brackets).

Enter the root path for documentation.
> Root path for the documentation [.]: 

You have two options for placing the build directory for Sphinx output.
Either, you use a directory "_build" within the root path, or you separate
"source" and "build" directories within the root path.
> Separate source and build directories (y/N) [n]: Y

Inside the root directory, two more directories will be created; "_templates"
for custom HTML templates and "_static" for custom stylesheets and other static
files. You can enter another prefix (such as ".") to replace the underscore.
> Name prefix for templates and static dir [_]: 

The project name will occur in several places in the built documentation.
> Project name: PROJECT_NAME
> Author name(s): AUTHOR_NAME

Sphinx has the notion of a "version" and a "release" for the
software. Each version can have multiple releases. For example, for
Python the version is something like 2.5 or 3.0, while the release is
something like 2.5.1 or 3.0a1.  If you don't need this dual structure,
just set both to the same value.
> Project version: VERSION
> Project release [VERSION]: 

The file name suffix for source files. Commonly, this is either ".txt"
or ".rst".  Only files with this suffix are considered documents.
> Source file suffix [.rst]: 

One document is special in that it is considered the top node of the
"contents tree", that is, it is the root of the hierarchical structure
of the documents. Normally, this is "index", but if your "index"
document is a custom template, you can also set this to another filename.
> Name of your master document (without suffix) [index]: 

Sphinx can also add configuration for epub output:
> Do you want to use the epub builder (y/N) [n]: 

Please indicate if you want to use one of the following Sphinx extensions:
> autodoc: automatically insert docstrings from modules (y/N) [n]: Y
> doctest: automatically test code snippets in doctest blocks (y/N) [n]: 
> intersphinx: link between Sphinx documentation of different projects (y/N) [n]: 
> todo: write "todo" entries that can be shown or hidden on build (y/N) [n]: 
> coverage: checks for documentation coverage (y/N) [n]: 
> pngmath: include math, rendered as PNG images (y/N) [n]: 
> mathjax: include math, rendered in the browser by MathJax (y/N) [n]: 
> ifconfig: conditional inclusion of content based on config values (y/N) [n]: 
> viewcode: include links to the source code of documented Python objects (y/N) [n]: 

A Makefile and a Windows command file can be generated for you so that you
only have to run e.g. `make html' instead of invoking sphinx-build
directly.
> Create Makefile? (Y/n) [y]: 
> Create Windows command file? (Y/n) [y]: N

Creating file ./source/conf.py.
Creating file ./source/index.rst.
Creating file ./Makefile.

Finished: An initial directory structure has been created.

You should now populate your master file ./source/index.rst and create other documentation
source files. Use the Makefile to build the docs, like so:
   make builder
where "builder" is one of the supported builders, e.g. html, latex or linkcheck.

}}}

Before Sphinx can build the documentation, the file "docs/source/conf.py" needs to be updated.  Add the following line to the bottom of the file to give Sphinx visibility to the top of your repository:

{{{
sys.path.insert(0, os.path.abspath('../..'))
}}}

If you have any dependencies in other repos, you may need to stub them out.  (The best time to do this may be after observing a failed build).  These stubs should exist in a single location to avoid interference with production code.  Create a directory called "rtd" at the top of your repo and stub out any external objects that are imported into your app.

You'll then need to update the path in "docs/source/conf.py":

{{{
sys.path.insert(0, os.path.abspath('../../rtd'))
}}}

You may also need to update your environment.  For example, Django apps require an environment variable, so add this line to "docs/source/conf.py":

{{{
os.environ['DJANGO_SETTINGS_MODULE'] = "settings"
}}}

Finally, update your repo's .gitignore file with "docs/build".  "Makefile" and the entire "source" directory should be added to source control.

== Maintaining and building your documentation ==

A popular documentation format is [[http://en.wikipedia.org/wiki/ReStructuredText|reST]].  You can maintain your documentation by adding or updating reST files in "docs/source" .  If you add a new file, remember to include its name (sans extension) in "docs/source/index.rst" .  To build the documentation locally, go into the "docs" directory and type the following:

{{{
$ make html
}}}

The newly built documentation will be placed in "docs/build/html/", and you can view it locally in a browser.  Once the code is pushed to GitHub, RtD will periodically rebuild your documentation (your repository must be public for this to happen).

== Setting up RtD ==

Since RtD imports your code to extract the documentation, it must be aware of your project's dependencies.  One way to do this is to add a minimal setup.py file at the top of your repo with the dependencies enumerated in the `install_requires` parameter.  RtD will use this file to install your project and its dependencies into a virtual environment.  Here is an example setup.py for a project named "foo" that depends on Django and requests.

{{{
from setuptools import setup, find_packages

setup(
    name='foo',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        'Django',
        'requests',
    ],
)
}}}

After you've added this file to your repo, go to https://readthedocs.org and create an account.  Once you're logged in, navigate to your Dashboard and click the "Import" button.  Enter your repo information, specifying "docs/source/conf.py" for "Python configuration file" and checking "Use virtualenv".

Once your repository is imported into RtD, you can navigate to it and build a version of the documentation.  After a successful build, the docs will become immediately available at https://PROJECT_NAME.readthedocs.org/ .

To debug a failing build, click on the build to view detailed debugging information.

== See also ==

 * [[http://docutils.sourceforge.net/rst.html]]
 * [[https://read-the-docs.readthedocs.org/en/latest/getting_started.html]]

