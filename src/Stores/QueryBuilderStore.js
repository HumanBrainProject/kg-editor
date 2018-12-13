import axios from "axios";
import {observable, action, computed} from "mobx";
import {uniqueId, sortBy, groupBy} from "lodash";
import API from "../Services/API";
import {remove} from "lodash";

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

  @observable schemasMap = new Map();

  @observable runStripVocab = true;
  @observable.shallow result = null;

  @observable currentTab = "query";
  @observable currentField = null;

  constructor(){
    this.fetchStructure();
  }

  selectRootSchema(schema){
    this.rootField = new Field({
      id:schema.id,
      label:schema.label,
      canBe:[schema.id]
    });
    this.selectField(this.rootField);
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
  addField(schema, field, gotoField = true){
    if(field === undefined) {
      field = this.showModalFieldChoice || this.rootField;
      this.showModalFieldChoice = null;
    }
    let newField = new Field(schema, field);
    field.fields.push(newField);
    if(gotoField){
      this.selectField(newField);
    }
  }

  @action
  removeField(field){
    if(this.rootField === field){
      this.rootField = null;
      this.closeFieldOptions();
    } else {
      if(field === this.currentField){
        this.closeFieldOptions();
      }
      remove(field.parent.fields, parentField => field === parentField);
    }
  }

  @action async fetchStructure(){
    let response = await axios.get(window.rootPath+"/mockup/QBStructure.json");
    this.structure = response.data;
    this.structure.schemas.forEach(schema => {
      this.schemasMap.set(schema.id, schema);
    });
  }

  @action toggleRunStripVocab(state){
    this.runStripVocab = state !== undefined? !!state: !this.runStripVocab;
  }

  @action selectTab(tab){
    this.currentTab = tab;
  }

  @action selectField(field){
    this.currentField = field;
    this.currentTab = "fieldOptions";
  }

  @action closeFieldOptions(){
    this.currentField = null;
    this.currentTab = "query";
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