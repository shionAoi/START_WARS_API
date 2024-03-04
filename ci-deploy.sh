#!/bin/bash

# Validate stage of serverless, default local
stage="local"
while getopts s flag
do
    case "${flag}" in
        s) stage=${OPTARG};;
    esac
done

echo "Stage selected: $stage"

# Create build folder to generate zip
if [ ! -d "build" ]; then
    mkdir -p "build"
else
    rm -r ./build/*
fi

# Build lambda fn_star_wars_get
mkdir -p build/fn_star_wars_get
cp -r fn_star_wars_get/src/** build/fn_star_wars_get/
cp fn_star_wars_get/package.json build/fn_star_wars_get/
cd build/fn_star_wars_get
npm i --omit=dev
zip -r -q fn_star_wars_get.zip .
find . ! -name 'fn_star_wars_get.zip' -type f -exec rm -f {} +
find . ! -name 'fn_star_wars_get.zip' -type d -exec rm -r -f {} +
cd ../..

# Deploy using serverless framework
pwd
sls deploy --stage $stage