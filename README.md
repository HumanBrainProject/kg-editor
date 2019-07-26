# KG Editor

This service is a combination of a Play framework application which requires the latest SBT installation and a React application.

# Installation

In order to install kg-editor and develop locally all you need to do is the following:

First clone the project

```
git clone https://github.com/HumanBrainProject/kg-editor.git
```

then install the kg-service:
```
cd kg-editor/service
sbt clean
sbt complile 
sbt run
```

and finally install the ui and run the dev server:
```
cd kg-editor/ui
npm install
npm start
```

# Deployment

In order to deploy kg-editor with your own configuration you would need to override docker-compose.yml and nginx.conf
located in ui/nginx.conf

An example of a docker-compose.yml file could look like this:

```
version: '3.7'

services:
  <name-of-the-kg-editor-ui-container>:
    build:
      context: ./ui
      dockerfile: Dockerfile
    ports:
      - '8080:80'
  <name-of-the-kg-editor-service-container>:
    restart: "always"
    stdin_open: true
    environment:
      - AUTH_ENDPOINT=${AUTH_ENDPOINT}
      - CREDENTIALS_PATH=${CREDENTIALS_PATH}
      - ELASTICSEARCH_ENDPOINT=${ELASTICSEARCH_ENDPOINT}
      - HBP_URL=${HBP_URL}
      - KG_QUERY_ENDPOINT=${KG_QUERY_ENDPOINT}
      - NEXUS_NAMESPACE=${NEXUS_NAMESPACE}
      - NEXUS_IAM=${NEXUS_IAM}
      - SECRET_KEY=${SECRET_KEY}
    build:
      context: ./service
      dockerfile: Dockerfile
```

and an example of an nginx.conf file could look like this:

```
upstream api_server {
  server   <name-of-the-kg-editor-service-container>:9000;
}

server {
    listen       80;
    server_name  _;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri /index.html;                 
    }

    location /editor/api {
        proxy_pass http://api_server;
        proxy_set_header Host $http_host;
        proxy_pass_request_headers on;
        proxy_set_header Allow-Control-Allow-Methods "GET, PUT, POST, DELETE, OPTIONS";
        proxy_set_header Access-Control-Allow-Origin "*";
        proxy_set_header Content-Security-Policy "frame-ancestors 'self' <any-application-url-to-enable-csp>";
        proxy_set_header Access-Control-Allow-Headers "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With";
    }
}

```
Finally you need to run
```
docker-compose build
docker-compose up
```
and you are ready to go!
