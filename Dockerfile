from ubuntu:12.04
maintainer IDCubed

run apt-get update
run apt-get install -y python-setuptools make
run easy_install pip
add . /docs
run pip install -r /docs/requirements.txt
run cd /docs; make docs

expose 9000

workdir /docs/_build/html

entrypoint ["python", "-m", "SimpleHTTPServer"]
