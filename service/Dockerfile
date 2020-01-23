FROM adoptopenjdk/openjdk11:jre-11.0.5_10-hotspot
MAINTAINER David Kunzmann "david.kunzmann@epfl.ch"

COPY ./target/universal/stage/ /app/

WORKDIR /app
USER root
ENTRYPOINT ["bin/kg-editor"]
CMD []
