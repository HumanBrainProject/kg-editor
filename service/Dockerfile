FROM alpine:3.11
MAINTAINER David Kunzmann "david.kunzmann@epfl.ch"
RUN mkdir /app
COPY target/universal/stage/ /app/
RUN ls -al /app
WORKDIR /app
USER root
ENTRYPOINT ["bin/kg-service"]
CMD []
