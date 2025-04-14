# ikaros-recording

Source and full dev and prod environment consosting of:

  - Database - PostgreSQL with PostGIS
    - RESTful API - PostgREST
      - Authentication and user management service - Keycloak
    - Reverse Proxy - NGINX
    - Administration tools
      - PgAdmin
      - Nginx Proxy Manager
    - Web-Frontend
      - node.js with React and Vite
      - Development environment
        - nodemon for instant update on code changes
        - debug port exposed
      - Production environment


## Deployment
Clone repo and run ```make start```

### Makefile usage
Important administrative tasks are collected in a [Makefile](Makefile). Below is the documentation (also available with ```make``` or ```make help```.

```
usage: make [target]

dev:
  build-dev                       Build the application for dev
  build-dev-no-cache              Build the application for dev without using cache
  start                           Start the development environment
  start-detached                  Start the development environment (detached)
  stop                            Stop the development environment
  shell APP=app_name              Go into the running container (the app name should match what's in docker-compose.yml)

git:
  pull                            Pull new data from github
  sync COMMENT="Commit comment"   Add, commit and sync all files with git repository

other:
  help                            Show this help 
```
