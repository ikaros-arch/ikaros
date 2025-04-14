#!/bin/bash

# Updating and installing base packages
dnf update
dnf upgrade -y
dnf install -y curl git wget vim make python3-pip container-tools podman-plugins 

# Install podman-compose
pip3 install podman-compose

#Set up app
mkdir /containers
cd /containers

TOKEN="yourToken"
GITUSER="yourUsername"
REPO="ikaros"
git clone https://$TOKEN@github.com/$GITUSER/$REPO.git

cd ikaros
cp .env.template .env
