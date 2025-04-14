#!/bin/sh

# Check if the development server is running
if ! pgrep -f "node" > /dev/null; then
  echo "Node.js development server is not running"
  exit 1
fi

# Check if the development server is responding on port 3000
if ! wget --spider -q  http://127.0.0.1:3000 > /dev/null; then
  echo "Development server is not responding on port 3000"
  exit 1
fi

# Check if npm is installed
if ! command -v npm > /dev/null; then
  echo "npm is not installed"
  exit 1
fi

# Check if required npm packages are installed
#REQUIRED_PACKAGES="react express"
#for PACKAGE in $REQUIRED_PACKAGES; do
  #if ! npm list -g | grep -q $PACKAGE; then
    #echo "Required npm package $PACKAGE is not installed"
    #exit 1
  #fi
#done

echo "Development environment is healthy"
exit 0