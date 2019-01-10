import axios from "axios";
import {observable, action, computed, runInAction} from "mobx";
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
    if(option === "flatten"){
      if(value === true && this.fields.length === 1){
        this.options.set(option, value);
      } else if(value === null){
        this.options.set(option, value);
      }
    } else {
      this.options.set(option, value);
    }
  }

  getOption(option){
    return this.options.has(option)?this.options.get(option):null;
  }

  getDefaultAlias(){
    let currentField = this;
    while(currentField.getOption("flatten") && currentField.fields[0] && currentField.fields[0].schema.canBe){
      currentField = currentField.fields[0];
    }
    return currentField.schema.simpleAttributeName || currentField.schema.simplePropertyName || currentField.schema.label;
  }
}

class QueryBuilderStore {
  @observable structure = null;
  @observable rootField = null;

  @observable schemasMap = new Map();

  @observable runStripVocab = true;
  @observable resultSize = 20;
  @observable resultStart = 0;
  @observable.shallow result = null;
  @observable tableViewRoot = ["results"];

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
    if(!field.getOption("flatten") || field.fields.length < 1){
      let newField = new Field(schema, field);
      field.fields.push(newField);
      if(gotoField){
        this.selectField(newField);
      }
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
        "query":"https://schema.hbp.eu/myQuery/",
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
        "fieldname":"query:"+(field.getOption("alias") || field.schema.simpleAttributeName || field.schema.simplePropertyName || field.schema.label),
        "relative_path":{"@id":field.schema.attribute, "reverse":field.schema.reverse === true? true: undefined},
        "required":field.getOption("required") === true? true: undefined
      };
      if(field.getOption("flatten")){
        let topField = field;
        jsonField.relative_path = [jsonField.relative_path];
        while(field.getOption("flatten") && field.fields[0]){
          field = field.fields[0];
          jsonField.relative_path.push({"@id":field.schema.attribute, "reverse":field.schema.reverse === true? true: undefined});
          if(field.fields && field.fields.length){
            jsonField.fieldname = "query:"+(topField.getOption("alias") || field.schema.simpleAttributeName || field.schema.simplePropertyName || field.schema.label);
          }
        }
      }
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
      let response = await API.axios.post(API.endpoints.query(this.rootField.schema.id, this.runStripVocab?"https://schema.hbp.eu/myQuery/":undefined, this.resultSize, this.resultStart), payload);
      runInAction(()=>{
        this.tableViewRoot = ["results"];
        this.result = response.data;
      });
    } catch(e){
      this.result = null;
    }
  }

  @action
  setResultSize(size){
    this.resultSize = size;
  }

  @action
  setResultStart(start){
    this.resultStart = start;
  }

  @action
  returnToTableViewRoot(index){
    this.tableViewRoot = this.tableViewRoot.slice(0, index+1);
  }

  @action
  appendTableViewRoot(index,key){
    this.tableViewRoot.push(index);
    this.tableViewRoot.push(key);
  }
}

export default new QueryBuilderStore();