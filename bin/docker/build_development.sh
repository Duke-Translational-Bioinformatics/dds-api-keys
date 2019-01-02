#!/bin/bash

which s2i > /dev/null
if [ $? -gt 0 ]
then
  echo "install s2i https://github.com/openshift/source-to-image#installation"
  exit 1
fi
s2i build -c -e "DEV_MODE=true" -e "NODE_ENV=development" . centos/nodejs-8-centos7 dds-api-keys
