# KG Service

This service is a Play framework application which requires the latest SBT installation.

## Production deployment

To create a binary for production; in the root folder run.

```
sbt stage
```

The binary can be found in the `target/universal/stage/bin` folder.

To run the application you have to specify a secret and a file for the running PID for example :
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
#### GET /workspaces/:workspace/types
```plantuml
    participant service
    participant core #Orange
    service -> core: GET /structure?space=workspace
```
Response:
```json5
{
    data: [
        {
          id: "https://schema.org.name/Person",
          label: "Person",
          color: "#111"
        },
        {
          id: "https://schema.org.name/Dataset",
          label: "Dataset",
          color: "#222"
        }
    ]
}
```

#### POST /instances/list
Payload:
```json5
[
  "3J4J3LK434J3KL-34JKKJ3",
  "453H43LKJ3K3J3-54J3K3K"
]
```
```plantuml
    participant service
    participant core #Orange
    service -> core: POST /instances [payload: instance's ids]
    service -> service: get uniq list of types from the instances
    service -> core: POST /structure [payload: types]
```
Response:
```json5
{
    data: [
        {
            id: "3J4J3LK434J3KL-34JKKJ3",
            type: [
                "http://schema.org.name/Person"
            ],
            color: [
                "#fff"
            ],
            fields: {
                "http://schema.org/name": {
                    widget: "InputText",
                    label: "Name"
                },
                "http://schema.org/description": {
                    widget: "InputText",
                    label: "Description",
                    markdown: true
                },
                "http://schema.org/contributor": {
                    widget: "DropDown",
                    label: "Contributors",
                    tooltipLabel: "List all contributors that were involved in the creation of a dataset. This list is equivalent to the list of authors in a conventional journal article publication. The order of contributors is detrimental for how the dataset will be cited. The order of ccontributors should not be changed after a dataset has been released.",
                    allowCustomValues: true,
                    canBe: [
                      "http://schema.org.name/Person",
                      "http://schema.org.name/SoftwareAgent"
                    ]
                }
            }
        }
    ]
}
```
#### POST /instances/summary
Payload:
```json5
[
  "3J4J3LK434J3KL-34JKKJ3",
  "453H43LKJ3K3J3-54J3K3K"
]
```
```plantuml
    participant service
    participant core #Orange
    service -> core: POST /instances [payload: instance's ids]
    service -> service: get uniq list of types from the instances
    service -> core: POST /structure [payload: types]
    service -> service: put labelField String value into name
    service -> service: put promotedFields except labelField into fields
```
Response:
```json5
{
    data: [
        {
            id: "3J4J3LK434J3KL-34JKKJ3",
            type: [
                "http://schema.org.name/Person"
            ],
            color: [
                "#fff"
            ],
            name: "Katrin Amunts",
            fields: {
                "http://schema.org/description": {
                    widget: "InputText",
                    label: "Description",
                    markdown: true
                }
            }
        }
    ]
}
```
#### POST /instances/label
Payload:
```json5
[
  "3J4J3LK434J3KL-34JKKJ3",
  "453H43LKJ3K3J3-54J3K3K"
]
```
```plantuml
    participant service
    participant core #Orange
    service -> core: POST /instances [payload: instance's ids]
    service -> service: get uniq list of types from the instances
    service -> core: POST /structure [payload: types]
    service -> service: put labelField String value into name
```
Response:
```json5
{
    data: [
        {
            id: "3J4J3LK434J3KL-34JKKJ3",
            type: [
                "http://schema.org.name/Person"
            ],
            color: [
                "#fff"
            ],
            name: "Katrin Amunts"
        }
    ]
}
```
#### POST /instances/lookup?field=http%3A%2F%2Fschema.org.name%2FContributor&type=http%3A%2F%2Fschema.org.name%2FPerson
_Remarks: type is optional, when not provided query should take canBe types_  
Payload:
```json5
{
  "http://schema.org/name": "This is a test",
  "http://schema.org/description": "This is a wonderful description save2",
  "https://schema.hbp.eu/demo/createdAs": [],
  "https://schema.hbp.eu/demo/custodian": [],
  "https://schema.hbp.eu/demo/mainContact": [],
  "https://schema.hbp.eu/demo/contributor": [
    {
      "@id": "30d54224-e75c-4260-8f2e-a9f420f451db"
    }
  ],
  "https://schema.hbp.eu/demo/species": [
    {
      "@id": "5e9abd14-607d-454e-9aee-37b24af4d255"
    }
  ],
  "https://schema.hbp.eu/demo/mainFileBundle": [],
  "https://schema.hbp.eu/demo/subjectGroup": [],
  "https://schema.hbp.eu/demo/subject": [],
  "https://schema.hbp.eu/demo/brainStructure": [],
  "https://schema.hbp.eu/demo/cellularTarget": [],
  "https://schema.hbp.eu/demo/doi": [],
  "https://schema.hbp.eu/demo/license": [],
  "https://schema.hbp.eu/demo/embargoStatus": [],
  "https://schema.hbp.eu/demo/intendedReleaseDate": null,
  "https://schema.hbp.eu/demo/hbpComponent": [],
  "https://schema.hbp.eu/demo/project": [],
  "https://schema.hbp.eu/demo/ethicsApproval": [],
  "https://schema.hbp.eu/demo/publication": [],
  "https://schema.hbp.eu/demo/fundingInformation": [],
  "https://schema.hbp.eu/demo/method": [],
  "https://schema.hbp.eu/demo/studyTarget": []
}
```
```plantuml
    participant service
    participant core #Orange
    service -> core: POST /query [payload: instance data]
```
Response:
```json5
{
    data: [
        {
          boost: 2,
          id: "30d54224-e75c-4260-8f2e-a9f420f451db",
          type: [
             "http://schema.org.name/Person"
          ],
          color: [
             "#fff"
          ],
          name: "Schmid Oliver",
        },
        {
          boost: 1,
          id: "8e0b1006-55e0-4be0-9c89-89fc06fc8fb4",
          type: [
            "http://schema.org.name/Person"
          ],
          color: [
            "#fff"
          ],
          name: "Kunzmann David"
        },
        {
          boost: 1,
          id: "v1.0.0/2c8e9376-99e7-4942-b9e4-8854ac628baf",
          type: [
             "http://schema.org.name/Person"
          ],
          color: [
             "#fff"
          ],
          name: "John Doe"
        }
    ],
   "start": 0,
   "size": 20,
   "total": 10
}
```
#### GET /workspaces/:workspace/instances/summary?type=http%3A%2F%2Fschema.org.name%2FPerson&search=...&from=0&size=20
```plantuml
    participant service
    participant core #Orange
    service -> core: GET /query
    service -> service: get uniq list of types from the instances
    service -> core: POST /structure [payload: types]
    service -> service: put labelField String value into name
    service -> service: put promotedFields except labelField into fields
```
Response:
```json5
{
    data: [
        {
            boost: 1,
            id: "3J4J3LK434J3KL-34JKKJ3",
            type: [
                "http://schema.org.name/Person"
            ],
            color: [
                "#fff"
            ],
            name: "Katrin Amunts",
            fields: {
                "http://schema.org/description": {
                    widget: "InputText",
                    label: "Description",
                    markdown: true
                }
            }
        }
    ],
    "start": 0,
    "size": 20,
    "total": 10
}
```
#### GET /workspaces/:workspace/bookmarks
#### GET /workspaces/:workspace/bookmarks/:bookmarkId/instances
