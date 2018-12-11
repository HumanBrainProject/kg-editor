import axios from "axios";
import {observable, action, computed} from "mobx";
import {uniqueId, sortBy, groupBy} from "lodash";
import API from "../Services/API";

class Field {
  @observable schema = null;
  @observable id = 0;
  @observable alias = null;
  @observable fields = [];
  @observable options = new Map();

  constructor(schema, parent){
    this.schema = schema;
    this.parent = parent;
    this.id = uniqueId("QueryBuilderField");
  }

  @action setOption(option, value){
    this.options.set(option, value);
  }

  getOption(option){
    return this.options.has(option)?this.options.get(option):null;
  }
}

class QueryBuilderStore {
  @observable structure = null;
  @observable rootField = null;

  @observable showModalSchemaChoice = false;
  @observable showModalFieldChoice = null;
  @observable showModalFieldOptions = null;

  @observable schemasMap = new Map();

  @observable runStripVocab = false;
  @observable.shallow result = null;

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
    field.fields.push(new Field(schema, field));
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

  @action toggleShowModalFieldOptions(field){
    this.showModalFieldOptions = field === undefined? null: field;
  }

  @action toggleRunStripVocab(state){
    this.runStripVocab = state !== undefined? !!state: !this.runStripVocab;
  }

  @computed
  get JSONQuery(){
    let json = {
      "@context":{
        "@vocab": "https://schema.hbp.eu/graphQuery/",
        "target":"https://schema.hbp.eu/mytarget/",
        "fieldname": {
          "@id": "fieldname",
          "@type": "@id"
        },
        "relative_path": {
          "@id": "relative_path",
          "@type": "@id"
        }
      }
    };
    this._processFields(json, this.rootField);
    //Gets rid of the undefined values
    return JSON.parse(JSON.stringify(json));
  }

  _processFields(json, field){
    field.fields.forEach(field => {
      if(json.fields === undefined){
        json.fields = [];
      }
      let jsonField = {
        "fieldname":"target:"+(field.getOption("alias") || field.schema.label),
        "relative_path":{"@id":field.schema.attribute, "reverse":field.schema.reverse === true? true: undefined},
        "required":field.getOption("required") === true? true: undefined
      };
      json.fields.push(jsonField);
      if(field.fields && field.fields.length){
        this._processFields(jsonField, field);
      }
    });
  }

  @action
  async executeQuery(){
    try{
      let payload = this.JSONQuery;
      let response = await API.axios.post(API.endpoints.query(this.rootField.schema.id, this.runStripVocab?"https://schema.hbp.eu/mytarget/":undefined), payload);
      this.result = response.data;
    } catch(e){
      this.result = null;
    }
  }
}

export default new QueryBuilderStore();