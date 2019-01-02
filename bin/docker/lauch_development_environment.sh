#!/bin/bash

docker images dds-api-keys | grep dds-api-keys > /dev/null 2>&1
if [ $? -gt 0 ]
then
  echo "building local docker development environment" >&2
  ./bin/docker/build_development.sh
fi
docker-compose up -d server
