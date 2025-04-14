#!/bin/bash

# Set non-interactive daemon upgrade:
sed -i "/#\$nrconf{restart} = 'i';/s/.*/\$nrconf{restart} = 'l';/" /etc/needrestart/needrestart.conf

# Update and install base packages
apt-get update
apt-get upgrade -y
apt-get install curl git wget vim gnupg ca-certificates build-essential -y

# Remove pre-existing Docker installations, if any
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do apt-get remove $pkg; done

# Add Docker's official GPG key:
install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update

# Install Docker
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Reset interactive daemon upgrade
sed -i "/#\$nrconf{restart} = 'l';/s/.*/\$nrconf{restart} = 'i';/" /etc/needrestart/needrestart.conf

# Set up app

mkdir /containers
cd /containers

TOKEN="yourToken"
GITUSER="yourUsername"
REPO="ikaros"

git clone https://$TOKEN@github.com/$GITUSER/$REPO.git

cd ikaros
cp .env.template .env
