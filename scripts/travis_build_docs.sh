#!/bin/bash
# https://github.com/phosphorjs/phosphor/wiki/TypeDoc-Publishing
set -e

#if [[ $TRAVIS_PULL_REQUEST == false && $TRAVIS_BRANCH == "master" ]]
#then
    echo "-- will build apidocs --"

    git config --global user.email "travis@travis-ci.com"
    git config --global user.name "Travis Bot"

    # Build docs
    rm -rf apidocs/
    npm install typedoc
    cd node_modules/typedoc/
    ../typescript/bin/tsc
    cd ../..
    node_modules/.bin/typedoc \
        --excludeNotExported \
        --excludePrivate \
        --includeDeclarations \
        --target ES6 \
        --out apidocs \
        src/

    # Clone gh-pages repo
    git clone https://github.com/saltyrtc/saltyrtc-client-js.git travis_docs_build
    cd travis_docs_build
    git checkout gh-pages

    # Git credentials
    echo "https://${GHTOKEN}:@github.com" > .git/credentials
    git config credential.helper "store --file=.git/credentials"

    # Add docs
    rm -rf ./*
    cp -r ../apidocs .
    git add -A

    # Make sure to turn off Github Jekyll rendering
    touch .nojekyll
    git add .nojekyll

    # Commit docs
    git commit -m "autocommit apidocs"
    git push origin gh-pages
#else
#    echo "-- will only build apidocs from master --"
#fi
