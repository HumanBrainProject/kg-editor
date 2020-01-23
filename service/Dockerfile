FROM alpine:3.11
MAINTAINER David Kunzmann "david.kunzmann@epfl.ch"
RUN mkdir /app
COPY ./target/universal/stage/ /app/
WORKDIR /app
USER root
ENTRYPOINT ["bin/kg-editor"]
CMD []
