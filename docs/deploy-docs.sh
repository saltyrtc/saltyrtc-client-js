#!/bin/bash
cd docs
virtualenv --no-site-packages VENV
VENV/bin/pip install -r requirements.txt
VENV/bin/mkdocs build -v --clean

git config user.name "Travis CI"
git config user.email "travis@saltyrtc.org"
git remote add gh-token "https://${GH_TOKEN}@github.com/saltyrtc/saltyrtc-client-js.git"
git fetch gh-token && git fetch gh-token gh-pages:gh-pages

VENV/bin/mkdocs gh-deploy -v --clean --remote-name gh-token
