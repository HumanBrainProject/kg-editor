import {observable, action, computed, runInAction, toJS} from "mobx";
import {uniqueId, sortBy, groupBy, isEqual} from "lodash";
import API from "../Services/API";
import {remove} from "lodash";

import authStore from "./AuthStore";

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

const forbiddenQueryIdChars = [" ", ".", ",", ";", "\"", "'", ":", "/", "\\", "@", "[", "]", "{", "}", "?", "*"];

const isQueryIdValid = queryId => typeof queryId === "string" && queryId.trim() !== "" && !forbiddenQueryIdChars.some(value => queryId.includes(value));

const defaultContext = {
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
};

class QueryBuilderStore {
  @observable structure = null;
  @observable queryId = "";
  @observable label = "";
  @observable description = "";
  @observable sourceQuery = null;
  @observable rootField = null;
  @observable fetchStuctureError = null;
  @observable isFetchingStructure = false;
  @observable fetchQueriesError = null;
  @observable isFetchingQueries = false;
  @observable isSaving = false;
  @observable saveError = null;
  @observable isRunning = false;
  @observable runError = null;
  @observable saveAsMode = false;
  @observable showMyQueries = true;
  @observable showOthersQueries = true;
  @observable saveAsMode = false;

  @observable specifications = [];

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

  get forbiddenQueryIdChars() {
    return forbiddenQueryIdChars;
  }

  selectRootSchema(schema){
    if (!this.isSaving) {
      this.queryId = "";
      this.label = "";
      this.description = "";
      this.context = toJS(defaultContext);
      this.sourceQuery = null;
      this.rootField = new Field({
        id:schema.id,
        label:schema.label,
        canBe:[schema.id]
      });
      this.isSaving = false;
      this.saveError = null;
      this.isRunning = false;
      this.runError = null;
      this.saveAsMode = false;
      this.selectField(this.rootField);
      this.fetchQueries();
    }
  }

  @computed
  get isQuerySaved(){
    return this.sourceQuery !== null;
  }

  @computed
  get isOneOfMySavedQueries(){
    return this.sourceQuery !== null && this.sourceQuery.user === authStore.user.id;
  }

  @computed
  get isValid(){
    return !!this.rootField && !!this.rootField.fields && !!this.rootField.fields.length;
  }

  @computed
  get queryIdAlreadyExists(){
    const queryId = this.queryId.trim();
    return this.myQueries.some(spec => spec.id === queryId);
  }

  @computed
  get queryIdAlreadyInUse(){
    const queryId = this.queryId.trim();
    return this.othersQueries.some(spec => spec.id === queryId);
  }

  @computed
  get isQueryIdValid(){
    return isQueryIdValid(this.queryId);
  }

  @computed
  get hasChanged(){
    /*
    if (this.sourceQuery) {
      window.console.log(this.JSONQuery.fields, toJS(this.sourceQuery.fields), isEqual(this.JSONQuery.fields, toJS(this.sourceQuery.fields)));
    }
    */
    return this.isValid && (this.sourceQuery === null
      || (this.saveAsMode && this.queryId !== this.sourceQuery.id)
      || this.label !== this.sourceQuery.label
      || this.description !== this.sourceQuery.description
      || !isEqual(this.JSONQuery.fields, toJS(this.sourceQuery.fields)));
  }

  @computed
  get groupedSchemas(){
    return groupBy(this.structure.schemas, "group");
  }

  @computed
  get myQueries(){
    if (authStore.hasUserProfile) {
      return this.specifications.filter(spec => spec.user === authStore.user.id).sort((a, b) => a.label - b.label);
    }
    return [];
  }

  @computed
  get othersQueries(){
    if (authStore.hasUserProfile) {
      return this.specifications.filter(spec => spec.user !== authStore.user.id).sort((a, b) => a.label - b.label);
    }
    return this.specifications.sort((a, b) => a.label - b.label);
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
      this.queryId = "";
      this.label = "";
      this.description = "";
      this.sourceQuery = null;
      this.context = null;
      this.specifications = [];
      this.saveError = null;
      this.runError = null;
      this.saveAsMode = false;
      this.sourceQuery = null;
      this.closeFieldOptions();
    } else {
      if(field === this.currentField){
        this.closeFieldOptions();
      }
      remove(field.parent.fields, parentField => field === parentField);
    }
  }

  @computed
  get hasSchemas(){
    return !this.fetchStuctureError && this.structure && this.structure.schemas && this.structure.schemas.length;
  }

  @action async fetchStructure(){
    if (!this.isFetchingStructure) {
      this.isFetchingStructure = true;
      this.fetchStuctureError = null;
      try{
        const response = await API.axios.get(API.endpoints.structure());
        runInAction(() => {
          this.isFetchingStructure = false;
          this.structure = response.data;
          this.structure && this.structure.schemas && this.structure.schemas.length && this.structure.schemas.forEach(schema => {
            this.schemasMap.set(schema.id, schema);
          });
        });
      } catch(e) {
        const message = e.message?e.message:e;
        this.fetchStuctureError = `Error while fetching api structure (${message})`;
        this.isFetchingStructure = false;
      }
    }
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
    const json = {
      "@context": toJS(this.context)
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

  _processJsonSpecificationFields(parentField, jsonFields) {
    if (parentField && jsonFields && jsonFields.length) {
      jsonFields.forEach(jsonField => {
        const relativePath = jsonField["relative_path"];
        const isFlatten = !!relativePath && relativePath.length !== undefined && relativePath.length > 1;
        const flattenRelativePath = !isFlatten?null:(relativePath.length > 2?relativePath.slice(1):relativePath[1]);
        const id = relativePath && (isFlatten?(relativePath[0] && relativePath[0]["@id"]):relativePath["@id"]);
        if (relativePath && id
          && parentField.schema && parentField.schema.canBe && parentField.schema.canBe.length) {
          let property = null;
          parentField.schema.canBe.some(schemaId => {
            const schema = this.findSchemaById(schemaId);
            if (schema && schema.properties && schema.properties.length) {
              property = schema.properties.find(property => property.attribute === id);
              return !!property;
            }
            return false;
          });
          if (property) {
            if (!parentField.fields || parentField.fields.length === undefined) {
              parentField.fields = [];
            }
            const field = new Field(property, parentField);
            const reg = /^query:(.+)$/;
            const [ , alias] = reg.test(jsonField.fieldname)?jsonField.fieldname.match(reg):[null, null];
            if (alias && alias !== property.simpleAttributeName && alias !== property.simplePropertyName && alias !== property.label) {
              field.setOption("alias", alias);
            }
            if (jsonField.required) {
              field.setOption("required", true);
            }
            parentField.fields.push(field);
            if (isFlatten) {
              const childrenJsonFields = [
                {
                  "relative_path": flattenRelativePath,
                  fields: jsonField.fields
                }
              ];
              this._processJsonSpecificationFields(field, childrenJsonFields);
              if (flattenRelativePath.length || field.fields && field.fields.length === 1) {
                field.setOption("flatten", true);
              }
            } else {
              this._processJsonSpecificationFields(field, jsonField.fields);
            }
          } else {
            window.console.log(`"${id}" schema is not available in current api structure and will be ignored.`);
          }
        }
      });
    }
  }

  _processJsonSpecification(schemaId, fields) {
    const schema = this.findSchemaById(schemaId);
    if (!schema) {
      return null;
    }
    const rootField = new Field({
      id:schema.id,
      label:schema.label,
      canBe:[schema.id]
    });
    this._processJsonSpecificationFields(rootField, toJS(fields));
    return rootField;
  }

  @action
  selectQuery(query) {
    if (!this.isSaving
      && this.rootField && this.rootField.schema && this.rootField.schema.id
      && query && query.fields && query.fields.length && !query.isDeleting) {
      this.queryId = query.id + "-Copy";
      this.label = query.label;
      this.description = query.description;
      this.sourceQuery = query;
      this.context = toJS(query.context);
      this.rootField = this._processJsonSpecification(this.rootField.schema.id, query.fields);
      this.isSaving = false;
      this.saveError = null;
      this.isRunning = false;
      this.runError = null;
      this.saveAsMode = false;
      this.selectField(this.rootField);
    }
  }

  @action
  async executeQuery(){
    if (this.isValid && !this.isRunning && !this.runError) {
      this.isRunning = true;
      try{
        const payload = this.JSONQuery;
        const response = await API.axios.post(API.endpoints.performQuery(this.rootField.schema.id, this.runStripVocab?"https://schema.hbp.eu/myQuery/":undefined, this.resultSize, this.resultStart), payload);
        runInAction(()=>{
          this.tableViewRoot = ["results"];
          this.result = response.data;
          this.isRunning = false;
        });
      } catch(e){
        const message = e.message?e.message:e;
        this.result = null;
        this.runError = `Error while executing query (${message})`;
        this.isRunning = false;
      }
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

  @action
  cancelChanges() {
    if (this.sourceQuery) {
      this.selectQuery(this.sourceQuery);
    } else if (!this.isSaving) {
      this.rootField.fields = [];
    }
  }

  @action
  async saveQuery(){
    if (this.isValid && this.isQueryIdValid && !this.queryIdAlreadyInUse && !this.isSaving && !this.saveError && !(this.sourceQuery && this.sourceQuery.isDeleting)) {
      this.isSaving = true;
      if (this.sourceQuery && this.sourceQuery.deleteError) {
        this.sourceQuery.deleteError = null;
      }
      const queryId = this.queryId.trim();
      const label = this.label?this.label.trim():"";
      const description = this.description?this.description.trim():"";
      const payload = this.JSONQuery;
      if (label) {
        payload["label"] = label;
      }
      if (description) {
        payload["description"] = description;
      }
      try {
        await API.axios.put(API.endpoints.query(this.rootField.schema.id, queryId), payload);
        runInAction(()=>{
          if (!this.saveAsMode && this.sourceQuery && this.sourceQuery.user === authStore.user.id) {
            this.sourceQuery.label = label;
            this.sourceQuery.description = description;
            this.sourceQuery.context = this.JSONQuery["@context"];
            this.sourceQuery.fields = this.JSONQuery.fields;
          } else if (!this.saveAsMode && this.queryIdAlreadyExists) {
            this.sourceQuery = this.specifications.find(spec => spec.id === queryId);
            this.sourceQuery.label = label;
            this.sourceQuery.description = description;
            this.sourceQuery.specification = this.JSONQuery;
          } else {
            this.sourceQuery = {
              id: queryId,
              user: authStore.user.id,
              context: this.JSONQuery["@context"],
              fields: this.JSONQuery.fields,
              label: label,
              description: description,
              isDeleting: false,
              deleteError: null
            };
            this.specifications.push(this.sourceQuery);
          }
          this.saveAsMode = false;
          this.isSaving = false;
        });
      } catch(e){
        const message = e.message?e.message:e;
        this.saveError = `Error while saving query "${queryId}" (${message})`;
        this.isSaving = false;
      }
    }
  }

  @action
  cancelSaveQuery() {
    if (!this.isSaving) {
      this.saveError = null;
    }
  }

  @action
  async deleteQuery(query){
    if (query && !query.isDeleting && !query.deleteError && !(query === this.sourceQuery && this.isSaving)) {
      query.isDeleting = true;
      try{
        await API.axios.delete(API.endpoints.query(this.rootField.schema.id, query.id));
        runInAction(()=>{
          query.isDeleting = false;
          if (query === this.sourceQuery ) {
            this.sourceQuery = null;
          }
          const index = this.specifications.findIndex(spec => spec.id === query.id);
          if (index !== -1) {
            this.specifications.splice(index, 1);
          }
        });
      } catch(e){
        const message = e.message?e.message:e;
        query.deleteError = `Error while deleting query "${query.id}" (${message})`;
        query.isDeleting = false;
      }
    }
  }

  @action
  cancelDeleteQuery(query) {
    if (query && !query.isDeleting) {
      query.deleteError = null;
    }
  }

  _containsUnsupportedProperties = field => {
    const unsupportedProperties = ["merge", "filter", "sort", "ensure_order"];
    const unsupportedRelativePathProperties = [];
    if (!field) {
      return true;
    }
    if (unsupportedProperties.some(property => field[property] !== undefined)) {
      return true;
    }
    if (field.relative_path && unsupportedRelativePathProperties.some(property => field.relative_path[property] !== undefined)) {
      return true;
    }
    if (field.fields && field.fields.length) {
      return field.fields.some(this._containsUnsupportedProperties);
    }
    return false;
  }

  @action
  async fetchQueries(){
    if (!this.isFetchingQueries) {
      this.specifications = [];
      this.fetchQueriesError = null;
      if (this.rootField && this.rootField.schema && this.rootField.schema.id) {
        this.isFetchingQueries = true;
        try{
          const response = await API.axios.get(API.endpoints.listQueries(this.rootField.schema.id));
          runInAction(()=>{
            this.specifications = [];
            this.showMyQueries = true;
            this.showOthersQueries = true;
            const jsonSpecifications = response && response.data && response.data.length?response.data:[];
            //const reg = /^(.+)\/(.+)\/(.+)\/v(\d+)\.(\d+)\.(\d+)\/(.+)$/;
            const reg = /^specification_queries\/(.+)-(.+)-(.+)-v(\d+)_(\d+)_(\d+)-(.+)$/;
            jsonSpecifications.forEach(jsonSpec => {
              if (jsonSpec && jsonSpec["@context"] && jsonSpec.fields && jsonSpec.fields.length && reg.test(jsonSpec._id)) { //jsonSpec["http://schema.org/identifier"]
                const [ , org, domain, schemaName, vMn, vmn, vpn, queryId] = jsonSpec._id.match(reg);
                const schemaId = `${org}/${domain}/${schemaName}/v${vMn}.${vmn}.${vpn}`;
                if (schemaId === this.rootField.schema.id && !this._containsUnsupportedProperties(jsonSpec, queryId)) { //isQueryIdValid(queryId) &&
                  const fields = jsonSpec.fields;
                  this.specifications.push({
                    id: queryId,
                    user: jsonSpec._createdByUser,
                    context: jsonSpec["@context"],
                    fields: fields,
                    label: jsonSpec.label?jsonSpec.label:"",
                    description: jsonSpec.description?jsonSpec.description:"",
                    isDeleting: false,
                    deleteError: null
                  });
                }
              }
            });
            this.isFetchingQueries = false;
          });
        } catch(e) {
          this.specifications = [];
          const message = e.message?e.message:e;
          this.fetchQueriesError = `Error while fetching saved queries for "${this.rootField.id}" (${message})`;
          this.isFetchingQueries = false;
          window.console.log(e);
        }
      }
    }
  }
}

export default new QueryBuilderStore();