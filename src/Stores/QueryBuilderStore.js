import axios from "axios";
import {observable, action, computed} from "mobx";
import {uniqueId, sortBy, groupBy} from "lodash";

class Field {
  @observable schema = null;
  @observable id = 0;
  @observable alias = null;
  @observable fields = [];

  constructor(schema){
    this.schema = schema;
    this.id = uniqueId("QueryBuilderField");
  }
}

class QueryBuilderStore {
  @observable structure = null;
  @observable rootField = null;

  @observable showModalSchemaChoice = false;
  @observable showModalFieldChoice = null;

  @observable schemasMap = new Map();

  constructor(){
    this.fetchStructure();
  }

  selectRootSchema(schema){
    this.rootField = new Field({
      id:schema.id,
      label:schema.label,
      canBe:[schema.id]
    });
  }

  @computed
  get groupedSchemas(){
    return groupBy(this.structure.schemas, "group");
  }

  getSortedSchemaGroups(){
    return Object.keys(this.groupedSchemas).sort();
  }

  getSortedSchemasByGroup(group){
    return sortBy(this.groupedSchemas[group], ["label"]);
  }

  findSchemaById(id){
    return this.schemasMap.get(id);
  }

  @action
  addField(schema, field){
    if(field === undefined) {
      field = this.showModalFieldChoice || this.rootField;
      this.showModalFieldChoice = null;
    }
    field.fields.push(new Field(schema));
  }

  @action async fetchStructure(){
    let response = await axios.get(window.rootPath+"/mockup/QBStructure.json");
    this.structure = response.data;
    this.structure.schemas.forEach(schema => {
      this.schemasMap.set(schema.id, schema);
    });
  }

  @action toggleShowModalSchemaChoice(state){
    this.showModalSchemaChoice = state === undefined? !this.showModalSchemaChoice: !!state;
  }

  @action toggleShowModalFieldChoice(field){
    this.showModalFieldChoice = field === undefined? null: field;
  }

  @computed
  get JSONQuery(){
    let json = {
      "@context":{
        "@vocab": "http://schema.hbp.eu/graph_query/",
        "target":"http://schema.hbp.eu/mytarget/",
        "fieldname": {
          "@id": "fieldname",
          "@type": "@id"
        },
        "relative_path": {
          "@id": "relative_path",
          "@type": "@id"
        }
      },
      "root_schema":this.rootField.schema.id
    };
    this._processFields(json, this.rootField);
    return json;
  }

  _processFields(json, field){
    field.fields.forEach(field => {
      if(json.fields === undefined){
        json.fields = [];
      }
      let jsonField = {
        "fieldname":"target:"+(field.alias || field.schema.label),
        "relative_path":field.schema.id
      };
      json.fields.push(jsonField);
      if(field.fields && field.fields.length){
        this._processFields(jsonField, field);
      }
    });
  }
}

export default new QueryBuilderStore();