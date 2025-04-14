#!/bin/sh

echo "Running " $NODE_ENV
if [ "$NODE_ENV" = "production" ] ; then
  npm run build
else
  npm run start
fi
