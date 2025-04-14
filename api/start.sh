#!/bin/sh
echo "Running " $NODE_ENV
if [ "$NODE_ENV" = "production" ] ; then
  npm run start
else
  npm run start
fi
