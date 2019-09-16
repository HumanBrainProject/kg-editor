# KG Service

This service is a Play framework application which requires the latest SBT installation.

## Production deployement

To create a binary for production; in the root folder run.

```
sbt stage
```

The binary can be found in the `target/universal/stage/bin` folder.

To run the application you havbe to specify a secret and a file for the running PID for example :
```
target/universal/stage/bin/kg_service -Dpidfile.path=/var/run/kg-service.pid -Dplay.http.secret.key=myapplicationsecret
```
You can specify the port with the `-Dhttp.port` option (e.g. `target/universal/stage/bin/kg_service  -Dhttp.port=8080`).

## Api calls

### get types grouped by space
```plantuml
       "ui" -> "service": get types grouped by space
       "service" -> "kg-core": get types grouped  by space
       "service" -> "kg-core": get documents of type <typeInfos> from <editor> client space
       "service" -> "kg-editor-service": merge types and typeInfos
```
### get user bookmarks
```plantuml
       "ui" -> "service": get user bookmarks
       "service" -> "kg-core": get documents of type <bookmark> from <editor> client space
```
### add instance to bookmark
```plantuml
       "ui" -> "service":  add instance <instanceId> to bookmark <bookmarkId>
       "service" -> "kg-core": get document <bookmarkId> of type <bookmark> from <editor> client space
       "service" -> "service": update or create document with the "to add" instance
       "service" -> "kg-core": update or create document  <bookmarkId> of type <bookmark> into <editor> client space

```