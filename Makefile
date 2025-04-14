# Makefile for ikaros-recording
# Based on work by Viral Ganatra (https://github.com/viralganatra/docker-nodejs-best-practices ) under the MIT license
# Expanded and adapted for multi-distro use by Hallvard Indgjerd
# 
SHELL=bash

###################################################################################################
## INITIALISATION
###################################################################################################

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
.DEFAULT_GOAL := help

# Check if the /etc/os-release exists and then read NAME, VERSION and ID from it
ifneq ($(wildcard /etc/os-release),)
	OS_NAME := $(shell grep '^NAME=' /etc/os-release | cut -d= -f2- | tr -d \")
	OS_VERSION := $(shell grep '^VERSION=' /etc/os-release | cut -d= -f2- | tr -d \")
	OS_ID := $(shell grep '^ID=' /etc/os-release | cut -d= -f2- | tr -d \")
else
	OS_NAME = "No supported OS found, setting default command." 
endif

# Detect system architecture
UNAME_M := $(shell uname -m)

# Set POSTGRES_IMAGE based on architecture
ifeq ($(UNAME_M),x86_64)
	POSTGRES_IMAGE := postgis/postgis:16-3.4
else ifeq ($(UNAME_M),armv7l)
	POSTGRES_IMAGE := nickblah/postgis:16-postgis-3.4
else ifeq ($(UNAME_M),aarch64)
	POSTGRES_IMAGE := nickblah/postgis:16-postgis-3.4
else
	$(error Unsupported architecture)
endif

# Export the POSTGRES_IMAGE so it's available to docker-compose
export POSTGRES_IMAGE

# Set the docker and compose commands based on the distro
ifeq ($(OS_ID),rhel)
	COMPOSE_CMD = /usr/local/bin/podman-compose
	DOCKER_CMD = podman
#else ifeq ($(OS_ID),debian)
#	COMPOSE_CMD = docker compose
#	DOCKER_CMD = docker	
#else ifeq ($(OS_ID),ubuntu)
#	COMPOSE_CMD = docker compose
#	DOCKER_CMD = docker	
#else ifeq ($(OS_ID),raspbian)
#	COMPOSE_CMD = docker compose
#	DOCKER_CMD = docker	
else # Set default command
	COMPOSE_CMD = docker compose
	DOCKER_CMD = docker	
endif

COMPOSE_FILE:=docker_compose.yml


# Function to remove images based on provided services
define remove_images
	echo "Removing images for services: $(1)"
	for service in $(1); do \
		image_id=$$($(DOCKER_CMD) inspect --format='{{ .Image }}' $$($(DOCKER_CMD) ps -a --filter "name=$$service" -q)); \
		if [ -n "$$image_id" ]; then \
			echo "Removing image ID $$image_id for service $$service"; \
			$(DOCKER_CMD) rmi -f $$image_id || true; \
		else \
			echo "No image found for service $$service"; \
		fi; \
	done
endef

# Target to remove all images defined in the Compose file
remove_all_images:
	@services=$$($(COMPOSE_CMD) config --services); \
	$(call remove_images,$$services)

# Target to remove image for a specific service
remove_ikaros_image:
	$(call remove_images,ikaros-prod)

###################################################################################################
## GIT 
###################################################################################################
.PHONY: pull sync

pull: ##@git Pull new data from github
	git pull
	
sync: ##@git Add, commit and sync all files with git repository (the env var COMMENT is passed as commit -m message)
	git add --all
	git commit -m "$(COMMENT)"
	git pull
	git push


###################################################################################################
## APP 
###################################################################################################
.PHONY: build build-no-cache start start-detached start-db start-prod stop shell prune refresh refresh-app

build: ##@app Build the application with all containers
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	$(COMPOSE_CMD) build

build-no-cache: ##@app Build the application without using cache
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	$(COMPOSE_CMD) build --no-cache

start: ##@app Start the environment
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	$(COMPOSE_CMD) up

start-detached: ##@app Start the environment (detached)
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	$(COMPOSE_CMD) up -d

start-db: ##@app Start only the database-related services
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo "Starting database services (Postgres, pgAdmin, NPM)..."
	@$(COMPOSE_CMD) up -d postgres pgadmin npm

start-prod: ##@app Start only the database-related services
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo "Starting production build..."
	@$(COMPOSE_CMD) up -d postgres pgadmin postgrest keycloak npm storage-api mediaserver otterwiki ikaros-prod

stop: ##@app Stop the environment
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	$(COMPOSE_CMD) down

refresh: ##@app Pull code, build and restart all containers
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD) and $(DOCKER_CMD)"
	@echo ""
	git pull
	$(COMPOSE_CMD) build
	$(COMPOSE_CMD) down
	$(MAKE) remove_all_images
	$(COMPOSE_CMD) up -d

refresh-app: ##@app Pull code, build and restart all containers
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	git pull
	$(MAKE) remove_ikaros_image	
	$(COMPOSE_CMD) up -d --force-recreate --no-deps --build ikaros-prod

shell: ##@app Go into the running container (the env var APP should match what's in docker-compose.yml)
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using $(COMPOSE_CMD)"
	@echo ""
	$(COMPOSE_CMD) exec $(APP) /bin/sh

prune: ##@app Remove all stopped containers, and volumes, networks and images not used by/associated with a container
	@echo "Detected OS: $(OS_NAME) $(OS_VERSION)"
	@echo "Detected architecture: $(UNAME_M)"
	@echo "Using docker system prune -a"
	@echo ""
	docker system prune -a	

###################################################################################################
## HELP
###################################################################################################

.PHONY: default
default: help

GREEN  := $(shell tput -Txterm setaf 2)
WHITE  := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

HELP_FUN = \
	print "Detected OS: $(OS_NAME) $(OS_VERSION)\n"; \
	%help; \
	while(<>) { push @{$$help{$$2 // 'options'}}, [$$1, $$3] if /^([a-zA-Z\-]+)\s*:.*\#\#(?:@([a-zA-Z\-]+))?\s(.*)$$/ }; \
	print "usage: make [target]\n\n"; \
	for (sort keys %help) { \
	print "${WHITE}$$_:${RESET}\n"; \
	for (@{$$help{$$_}}) { \
	$$sep = " " x (32 - length $$_->[0]); \
	print "  ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
	}; \
	print "\n"; }

help: ##@other Show this help
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)
