/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import {observable, action, runInAction, computed, toJS} from "mobx";
import { uniqueId, debounce, isEqual } from "lodash";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";
import appStore from "./AppStore";

import { normalizeInstanceData } from "../Helpers/InstanceHelper";

class Instance {
  @observable id = null;
  @observable types = [];
  @observable isNew = false;
  @observable fields = {};
  @observable alternatives = {};
  @observable labelField = null;
  @observable promotedFields = [];
  @observable primaryType = {name: "", color: "", label: ""};
  @observable workspace = "";
  @observable metadata = {};
  @observable permissions = {};
  @observable form = null;
  @observable cancelChangesPending = null;
  @observable fetchError = null;
  @observable hasFetchError = false;
  @observable saveError = null;
  @observable hasSaveError = false;
  @observable isSaving = false;
  @observable hasChanged = false;
  @observable isFetching = false;
  @observable isFetched = false;
  @observable highlight = null;
  @observable fieldsToSetAsNull = [];
  @observable fieldErrorsMap = new Map();

  constructor(id, instanceStore) {
    this.id = id;
    this.instanceStore = instanceStore;
  }

  memorizeInstanceInitialValues() {
    this.initialValues = this.form.getValues();
  }

  @computed
  get hasFieldErrors() {
    return this.fieldErrors.length;
  }

  @computed
  get fieldErrors() {
    return Array.from(this.fieldErrorsMap.values());
  }

  @computed
  get promotedFieldsWithMarkdown() {
    return this.promotedFields.filter(name => this.fields[name].markdown);
  }

  @computed
  get nonPromotedFields() {
    if (this.isFetched && !this.fetchError && this.fields) {
      return Object.keys(this.fields).filter(key => !this.promotedFields.includes(key));
    }
    return [];
  }

  @computed
  get linkedIds() {
    let linkKeys = [];
    if(this.isFetched && !this.fetchError && this.fields){
      linkKeys = Object.keys(this.fields).filter(fieldKey => {
        return this.form.getField(fieldKey).isLink && this.form.getField(fieldKey).getValue().length > 0;
      });
    }

    let ids = [];
    linkKeys.map(fieldKey => {
      let fieldObj = this.form.getField(fieldKey);
      if(fieldObj.isLink && fieldObj.value.length > 0){
        fieldObj.value.map(value => {
          ids.push(value[fieldObj.mappingValue]);
        });
      }
    });

    let allIds = [this.id];
    ids.forEach(i=> {
      if(this.instanceStore.instances.has(i)) {
        const inst = this.instanceStore.instances.get(i);
        allIds = [...allIds, ...inst.linkedIds];
      }
    });
    return Array.from(new Set(allIds));
  }

  @computed
  get isReadMode() {
    return !this.isFetched || (this.form && this.form.readMode);
  }

  @action
  setReadMode(readMode){
    if (this.isFetched) {
      this.form.toggleReadMode(!!readMode || (appStore.currentWorkspace && this.workspace !== appStore.currentWorkspace.id));
    }
  }

  @computed
  get readModeFormStore() {
    if (this._readModeFormStore) {
      return this._readModeFormStore;
    }
    this._readModeFormStore = new FormStore(toJS(this.form.structure));
    this._readModeFormStore.toggleReadMode(true);
    return this._readModeFormStore;
  }

  @action
  setFieldError(field) {
    this.fieldErrorsMap.set(field.path.substr(1), field);
  }

  @action
  setFieldAsNull(id) {
    !this.fieldsToSetAsNull.includes(id) && this.fieldsToSetAsNull.push(id);
    this.hasChanged = true;
  }
  @action
  fetch(forceFetch=false) {
    if(!this.isFetching && (!this.isFetched || this.fetchError || forceFetch)) {
      this.instanceStore.fetchInstance(this);
    }
  }

  @action
  initializeData(data, readMode=false, isNew=false) {
    const normalizedData =  normalizeInstanceData(data);
    this._readModeFormStore = null;
    this.workspace = normalizedData.workspace;
    this.types = normalizedData.types;
    this.isNew = isNew;
    this.fields = normalizedData.fields;
    this.labelField = normalizedData.labelField;
    this.primaryType = normalizedData.primaryType;
    this.promotedFields = normalizedData.promotedFields;
    this.alternatives = normalizedData.alternatives;
    this.metadata = normalizedData.metadata;
    this.permissions = normalizedData.permissions;
    if (this.form) {
      this.form.structure.workspace = normalizedData.workspace;
      this.form.structure.types = normalizedData.types;
      this.form.structure.name = normalizedData.name;
      this.form.structure.primaryType = normalizedData.primaryType;
      this.form.structure.promotedFields = normalizedData.promotedFields;
      this.form.structure.alternatives = normalizedData.alternatives;
      this.form.structure.metadata = normalizedData.metadata;
      this.form.structure.permissions = normalizedData.permissions;
    } else {
      this.form = new FormStore(normalizedData);
    }
    this.fetchError = null;
    this.hasFetchError = false;
    this.isFetching = false;
    this.isFetched = true;
    this.memorizeInstanceInitialValues();
    this.setReadMode(readMode);
  }

  @action
  errorInstance(e) {
    const message = e.message?e.message:e;
    const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
    if(e.response && e.response.status === 404){
      this.fetchError = "This instance can not be found - it either could have been removed or it is not accessible by your user account.";
    }
    else {
      this.fetchError = `Error while retrieving instance "${this.id}" (${message}) ${errorMessage}`;
    }
    this.hasFetchError = true;
    this.isFetched = false;
    this.isFetching = false;
  }

  @action
  async save() {

    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    try {
      if (this.isNew) {
        const payload = this.form.getValues();
        payload["@type"] = this.types.map(t => t.name);
        const { data } = await API.axios.post(API.endpoints.createInstance(this.id), payload);
        runInAction(() => {
          const newId = data.data.id;
          this.isNew = false;
          this.hasChanged = false;
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          this.fieldsToSetAsNull = [];
          if (newId !== this.id) {
            this.instanceStore.instances.set(newId, this);
            this.instanceStore.instance.delete(this.id);
            this.id = newId;
          }
          this.initializeData(data.data);
        });
      } else {
        const values = this.form.getValues();
        if (this.fieldsToSetAsNull.length > 0) {
          this.fieldsToSetAsNull.forEach(key=> values[key] = null);
        }
        const payload = Object.entries(values).reduce((result, [key, value]) => {
          const previous = this.initialValues[key];
          if (!isEqual(value, previous)) {
            result[key] = value;
          }
          return result;
        }, {});
        payload["@type"] = this.types.map(t => t.name);
        const { data } = await API.axios.patch(API.endpoints.instance(this.id), payload);
        runInAction(() => {
          this.hasChanged = false;
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          this.fieldsToSetAsNull = [];
          this.initializeData(data.data);
        });
      }
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
        this.saveError = `Error while saving instance "${this.id}" (${message}) ${errorMessage}`;
        this.hasSaveError = true;
        this.isSaving = false;
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  cancelSave(){
    this.saveError = null;
    this.hasSaveError = false;
  }

  @action
  cancelChanges(){
    this.form && this.form.injectValues(this.initialValues);
    this.hasChanged = false;
    this.cancelChangesPending = false;
    this.saveError = null;
    this.hasSaveError = false;
    this.fieldsToSetAsNull = [];
  }

}

class InstanceStore {
  @observable stage = null;
  @observable instances = new Map();

  instancesQueue = new Map();
  queueThreshold = 1000;
  queueTimeout = 250;

  generatedKeys = new WeakMap();

  constructor(stage=null) {
    this.stage = stage?stage:null;
  }

  fetchInstance(instance){
    if(!this.instancesQueue.has(instance.id)){
      this.instancesQueue.set(instance.id, instance);
      this.processQueue();
    }
  }

  @computed
  get hasUnsavedChanges(){
    return Array.from(this.instances.entries()).filter(([, instance]) => instance.hasChanged).length > 0;
  }

  @action
  processQueue(){
    if(this.instancesQueue.size <= 0){
      this._debouncedFetchQueue.cancel();
    } else if(this.instancesQueue.size < this.queueThreshold){
      this._debouncedFetchQueue();
    } else if(!this.isFetchingQueue){
      this._debouncedFetchQueue.cancel();
      this.fetchQueue();
    }
  }

  _debouncedFetchQueue = debounce(()=>{this.fetchQueue();}, this.queueTimeout);

  @action
  async fetchQueue(){
    if(this.isFetchingQueue){
      return;
    }
    this.isFetchingQueue = true;
    let toProcess = Array.from(this.instancesQueue.keys()).splice(0, this.queueThreshold);
    toProcess.forEach(identifier => {
      if(this.instances.has(identifier)) {
        const instance = this.instances.get(identifier);
        instance.cancelChangesPending = false;
        instance.isFetching = true;
        instance.isSaving = false;
        instance.isFetched = false;
        instance.fetchError = null;
        instance.hasFetchError = false;
        instance.saveError = null;
        instance.hasSaveError = false;
        instance.fieldErrorsMap.clear();
      }
    });
    try{
      let response = await API.axios.post(API.endpoints.instancesList(this.stage), toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response && response.data && response.data.data && response.data.data[identifier];
            if(data){
              // TODO: Remove the mockup, this is just a test for embedded
              // data.fields["http://schema.org/address"] = {
              //   type: "Nested",
              //   fullyQualifiedName: "http://schema.org/address",
              //   name: "address",
              //   label: "Address",
              //   min:0,
              //   max: Number.POSITIVE_INFINITY,
              //   value: [
              //     {
              //       "http://schema.org/addressLocality": "Springfield",
              //       "http://schema.org/streetAddress": "742 Evergreen Terrace",
              //       "http://schema.org/country" : [
              //         {id: "5763cbd4-7f92-4adb-98ea-1b6a26b61932"},
              //         {id: "88743735-88ad-45e9-acff-e67b5c407820"},
              //         {id: "7dec739f-ac25-4bcc-a255-39753013304d"}
              //       ],
              //       "http://schema.org/zipCode": [
              //         { "http://schema.org/test": "Testing...",
              //           "http://schema.org/region":  [
              //             {id: "5763cbd4-7f92-4adb-98ea-1b6a26b61932"},
              //             {id: "88743735-88ad-45e9-acff-e67b5c407820"},
              //             {id: "7dec739f-ac25-4bcc-a255-39753013304d"}
              //           ]
              //         }
              //       ]
              //     }
              //   ],
              //   fields: {
              //     "http://schema.org/addressLocality": {
              //       fullyQualifiedName: "http://schema.org/addressLocality",
              //       name: "addressLocality",
              //       label: "Address Locality",
              //       type: "InputText"
              //     },
              //     "http://schema.org/streetAddress": {
              //       fullyQualifiedName: "http://schema.org/streetAddress",
              //       name: "streetAddress",
              //       label: "Street Address",
              //       type: "InputText"
              //     },
              //     "http://schema.org/country" : {
              //       fullyQualifiedName: "http://schema.org/country",
              //       name: "country",
              //       label: "Country",
              //       type: "DropdownSelect",
              //       isLink: true,
              //       allowCustomValues: true
              //     },
              //     "http://schema.org/zipCode": {
              //       type: "Nested",
              //       fullyQualifiedName: "http://schema.org/zipCode",
              //       name: "zipCode",
              //       label: "Zip Code",
              //       min:0,
              //       max: Number.POSITIVE_INFINITY,
              //       fields: {
              //         "http://schema.org/test": {
              //           fullyQualifiedName: "http://schema.org/test",
              //           name: "test",
              //           label: "Test",
              //           type: "InputText"
              //         },
              //         "http://schema.org/region" :{
              //           fullyQualifiedName: "http://schema.org/region",
              //           name: "region",
              //           label: "Region",
              //           type: "DropdownSelect",
              //           isLink: true,
              //           allowCustomValues: true
              //         }
              //       }
              //     }
              //   }
              // };
              // data.fields["http://schema.org/origin"] = {
              //   fullyQualifiedName: "http://schema.org/origin",
              //   name: "origin",
              //   label: "Origin",
              //   type: "DropdownSelect",
              //   isLink: true,
              //   allowCustomValues: true,
              //   value: [{id: "5763cbd4-7f92-4adb-98ea-1b6a26b61932"},
              //     {id: "88743735-88ad-45e9-acff-e67b5c407820"},
              //     {id: "7dec739f-ac25-4bcc-a255-39753013304d"}
              //   ]
              // };
              // END of TODO
              instance.initializeData(data, appStore.getReadMode(), false);
              appStore.syncInstancesHistory(instance, "viewed");
            } else if (response && response.data && response.data.error && response.data.error[identifier]) {
              const error = response.data.error[identifier];
              const message = JSON.stringify(error); // TODO: check and handle properly error object
              instance.errorInstance(message);
              instance.isFetching = false;
              instance.isFetched = false;
            } else {
              const message = "This instance can not be found - it either could have been removed or it is not accessible by your user account.";
              instance.errorInstance(message);
              instance.isFetching = false;
              instance.isFetched = false;
            }
            this.instancesQueue.delete(identifier);
          }
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            instance.errorInstance(e);
            instance.isFetching = false;
            instance.isFetched = false;
            this.instancesQueue.delete(identifier);
          }
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  flush(){
    this.instances.clear();
  }

  @action
  createInstanceOrGet(instanceId){
    if (!this.instances.has(instanceId)) {
      const instance = new Instance(instanceId, this);
      this.instances.set(instanceId, instance);
      return instance;
    }
    return this.instances.get(instanceId);
  }

  @action
  createNewInstance(workspace, type, id, name=""){
    const instanceType = {name: type.name, label: type.label, color: type.color};
    const fields = toJS(type.fields);
    const data = {
      workspace: workspace,
      id: id,
      types: [instanceType],
      fields: toJS(fields),
      primaryType: instanceType,
      labelField: (Array.isArray(type.labelField) && type.labelField.length)?type.labelField[0]:null,
      promotedFields: toJS(type.promotedFields),
      alternatives: {},
      metadata: {},
      permissions: {}
    };
    if (name && data.labelField && data.fields && data.fields[data.labelField]) {
      data.fields[data.labelField].value = name;
    }
    const instance  = new Instance(id, this);
    instance.initializeData(data, false, true);
    this.instances.set(id, instance);
  }

  @action
  async createNewInstanceAsOption(workspace, field, name){
    try{
      const newInstanceId = await this.createNewInstance(workspace. field.instancesPath, name);
      field.options.push({
        [field.mappingValue]: newInstanceId,
        [field.mappingLabel]: name
      });
      field.addValue(field.options[field.options.length-1]);
      return newInstanceId;
    } catch(e){
      appStore.captureSentryException(e);
      return false;
    }
  }

  @action
  removeInstances(instanceIds) {
    instanceIds.forEach(id => this.instances.delete(id));
  }

  @action
  setInstanceHighlight(instanceId, provenence) {
    if (this.instances.has(instanceId)) {
      this.instances.get(instanceId).highlight = provenence;
    }
  }

  getGeneratedKey(from, namespace){
    if(!this.generatedKeys.has(from)){
      this.generatedKeys.set(from, uniqueId(namespace));
    }
    return this.generatedKeys.get(from);
  }

  @action
  setReadMode(readMode){
    this.instances.forEach(instance => instance.setReadMode(readMode));
  }

  @action
  instanceHasChanged(instanceId){
    const instance = this.instances.get(instanceId);
    if(!instance.hasChanged){
      instance.hasChanged = true;
    }
  }

  @action
  cancelInstanceChanges(instanceId){
    this.instances.get(instanceId).cancelChangesPending = true;
  }

  @action
  confirmCancelInstanceChanges(instanceId){
    this.instances.get(instanceId).cancelChanges();
  }

  @action
  abortCancelInstanceChange(instanceId){
    this.instances.get(instanceId).cancelChangesPending = false;
  }

}

export const createInstanceStore = (stage=null) => {
  return new InstanceStore(stage);
};

export default new InstanceStore();
