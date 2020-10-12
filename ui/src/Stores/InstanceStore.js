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

import {observable, action, runInAction, computed, toJS, values, entries} from "mobx";
import { debounce } from "lodash";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";
import appStore from "./AppStore";
import routerStore from "./RouterStore";

import { normalizeInstanceData, normalizeLabelInstanceData, getChildrenIdsGroupedByField } from "../Helpers/InstanceHelper";

class ReadModeFormStore {
  constructor(store) {
    this.store = store;
    this.readMode = true;
  }

  getGeneratedKey =  (item, namespace) => this.store.getGeneratedKey(item, namespace);

  getValues = (fields, applyMapping) => this.store.getValues(fields, applyMapping);

  @computed
  get structure() {
    return this.store.structure;
  }

  get values(){
    return this.store.values;
  }

  @action
  injectValues = (values, merge, fields) => this.store.injectValues(values, merge, fields);

  set values(values){
    this.store.values(values);
  }

  @action
  reset = fields => this.store.reset(fields)

  getField = path => this.store.getField(path)

  @action
  update = (path, updated) => this.store.update(path, updated)

  parentPath = field => this.store.parentPath(field)

  genSiblingPath = (field, name) => this.store.genSiblingPath(field, name)

  isURL = str => this.store.isUrl(str)

  async resolveURL(url, cacheResult) {
    return this.store.resolveURL(url, cacheResult);
  }

  @action
  async validate() {
    return this.store.validate();
  }

  registerCustomValidationFunction = (name, func, errorMessage) => this.store.registerCustomValidationFunction(name, func, errorMessage);

  registerAxiosInstance = axiosInstance => this.registerAxiosInstance(axiosInstance);

  toggleReadMode = () => {}
}

class Instance {
  @observable id = null;
  @observable _name = null;
  @observable types = [];
  @observable isNew = false;
  @observable alternatives = {};
  @observable labelField = null;
  @observable promotedFields = [];
  @observable primaryType = {name: "", color: "", label: ""};
  @observable workspace = "";
  @observable metadata = {};
  @observable permissions = {};
  @observable form = null;

  @observable isLabelFetching = false;
  @observable isLabelFetched = false;
  @observable fetchLabelError = null;
  @observable hasLabelFetchError = false;

  @observable isFetching = false;
  @observable isFetched = false;
  @observable fetchError = null;
  @observable hasFetchError = false;

  @observable cancelChangesPending = null;
  @observable saveError = null;
  @observable hasSaveError = false;
  @observable isSaving = false;

  @observable fieldErrorsMap = new Map();

  constructor(id, instanceStore) {
    this.id = id;
    this.instanceStore = instanceStore;
  }

  memorizeInstanceInitialValues() {
    this.initialValues = this.form.getValues();
  }

  @computed
  get hasChanged() {
    //return this.form && JSON.stringify(this.initialValues) !== JSON.stringify(this.form.getValues());
    return this.isNew || (this.form && values(this.form.structure.fields).reduce((acc, field) => acc || field.hasChanged, false));
  }

  @computed
  get name() {
    const field = this.isFetched && this.labelField && this.form && this.form.getField(this.labelField);
    if (field) {
      return (this.isNew && !field.value)?`<New ${this.primaryType.label}>`:field.value;
    }
    return this._name?this._name:this.id;
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
  get nonPromotedFields() {
    if (this.isFetched && !this.fetchError && this.form && this.form.structure.fields) {
      return entries(this.form.structure.fields)
        .filter(([key]) => !this.promotedFields.includes(key))
        .sort(([, a], [, b]) => a.label.localeCompare(b.label))
        .map(([key]) => key);
    }
    return [];
  }

  @computed
  get childrenIds() {
    if(this.isFetched && !this.fetchError && this.form.structure.fields){
      const ids = values(this.form.structure.fields)
        .reduce((acc, field) => {
          if (field.type === "Nested") {
            //TODO
          } else if (field.isLink) {
            const values = toJS(field.value);
            Array.isArray(values) && values.map(obj => {
              const id = obj[field.mappingValue];
              if (!acc.has(id)) {
                acc.add(id);
              }
            });
          }
          return acc;
        }, new Set());
      return Array.from(ids);
    }
    return [];
  }

  @computed
  get linkedIds() {
    const ids = this.childrenIds.reduce((acc, id) => {
      if (id !== this.id) {
        const instance = this.instanceStore.instances.get(id);
        if(instance) {
          instance.linkedIds.forEach(child => acc.add(child));
        }
      }
      return acc;
    }, new Set().add(this.id));
    return Array.from(ids);
  }

  @computed
  get childrenIdsGroupedByField() {
    if (this.isFetched && !this.fetchError) {
      return getChildrenIdsGroupedByField(values(this.form.structure.fields));
    }
    return [];
  }

  @computed
  get isReadMode() {
    return !this.isFetched || (this.form && this.form.readMode);
  }

  @computed
  get belongsToCurrentWorkspace() {
    return appStore.currentWorkspace && this.workspace !== appStore.currentWorkspace.id;
  }

  @action
  setReadMode(readMode){
    if (this.isFetched) {
      this.form.toggleReadMode(!!readMode || this.belongsToCurrentWorkspace);
    }
  }

  @computed
  get readModeFormStore() {
    if (!this.form) {
      return null;
    }
    if (this._readModeFormStore) {
      return this._readModeFormStore;
    }
    this._readModeFormStore = new ReadModeFormStore(this.form);
    return this._readModeFormStore;
  }

  @action
  setFieldError(field) {
    this.fieldErrorsMap.set(field.path.substr(1), field);
  }

  @action
  fetch(forceFetch=false) {
    if(!this.isFetching && (!this.isFetched || this.fetchError || forceFetch)) {
      this.instanceStore.fetchInstance(this);
    }
  }

  @action
  fetchLabel(forceFetch=false) {
    if (!this.isFetching && !this.isLabelFetching) {
      if (forceFetch || (!this.isFetched && !this.isLabelFetched)) {
        this.instanceStore.fetchInstanceLabel(this);
      }
    }
  }

  @action
  initializeLabelData(data) {
    const normalizedData =  normalizeLabelInstanceData(data);
    this._name = normalizedData.name,
    this.workspace = normalizedData.workspace;
    this.types = normalizedData.types;
    this.primaryType = normalizedData.primaryType;
    this.isLabelFetching = false;
    this.isLabelFetched = true;
    this.fetchLabelError = null;
    this.hasLabelFetchError = false;
  }

  @action
  initializeData(data, readMode=false, isNew=false) {
    const normalizedData =  normalizeInstanceData(data);
    this._readModeFormStore = null;
    this._name = normalizedData.name,
    this.workspace = normalizedData.workspace;
    this.types = normalizedData.types;
    this.isNew = isNew;
    this.labelField = normalizedData.labelField;
    this.primaryType = normalizedData.primaryType;
    this.promotedFields = normalizedData.promotedFields;
    this.alternatives = normalizedData.alternatives;
    this.metadata = normalizedData.metadata;
    this.permissions = normalizedData.permissions;
    if (this.form) {
      Object.entries(normalizedData.fields).forEach(([key, field]) => {
        const target = this.form.structure.fields[key];
        target.injectValue(field.value);
        const alternatives = normalizedData.fields[key].alternatives;
        target.alternatives = alternatives ? alternatives:[];
      });
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

  buildErrorMessage(e) {
    const message = e.message?e.message:e;
    const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
    if (e.response && e.response.status === 404) {
      return `The instance "${this.id}" can not be found - it either could have been removed or it is not accessible by your user account.`;
    }
    return `Error while retrieving instance "${this.id}" (${message}) ${errorMessage}`;
  }

  @action
  errorLabelInstance(e) {
    this.fetchLabelError = this.buildErrorMessage(e);
    this.hasLabelFetchError = true;
    this.isLabelFetched = false;
    this.isLabelFetching = false;
  }

  @action
  errorInstance(e) {
    this.fetchError = this.buildErrorMessage(e);
    this.hasFetchError = true;
    this.isFetched = false;
    this.isFetching = false;
  }

  constructPayloadToSave = () => {
    if (!this.form) {
      return null;
    }
    const payload = {
      "@type": this.types.map(t => t.name)
    };
    return entries(this.form.structure.fields).reduce((acc, [name, field]) => {
      if (field.hasChanged) {
        acc[name] = field.getValue(true);
      }
      return acc;
    }, payload);
  }

  @action
  async save() {

    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    const payload = this.constructPayloadToSave();
    try {
      if (this.isNew) {
        const { data } = await API.axios.post(API.endpoints.createInstance(this.id), payload);
        runInAction(() => {
          const newId = data.data.id;
          this.isNew = false;
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          if (newId !== this.id) {
            this.instanceStore.instances.set(newId, this);
            this.instanceStore.instance.delete(this.id);
            this.id = newId;
          }
          this.initializeData(data.data);
        });
      } else {
        const { data } = await API.axios.patch(API.endpoints.instance(this.id), payload);
        runInAction(() => {
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
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
    this.cancelChangesPending = false;
    this.saveError = null;
    this.hasSaveError = false;
  }

}

class InstanceStore {
  @observable stage = null;
  @observable instances = new Map();
  @observable previewInstance = null;
  @observable instanceIdAvailability = new Map();

  instancesQueue = new Set();
  instanceLabelsQueue = new Set();
  isFetchingQueue = false;
  isFetchingLabelsQueue = false;
  queueThreshold = 1000;
  queueTimeout = 250;

  constructor(stage=null) {
    this.stage = stage?stage:null;
  }

  fetchInstance(instance){
    if(!this.instancesQueue.has(instance.id)){
      this.instancesQueue.add(instance.id);
      this.processQueue();
    }
  }

  fetchInstanceLabel(instance){
    if(!this.instanceLabelsQueue.has(instance.id)){
      this.instanceLabelsQueue.add(instance.id);
      this.processLabelsQueue();
    }
  }

  @action
  togglePreviewInstance(instanceId, instanceName, options) {
    if (!instanceId || (this.previewInstance && this.previewInstance.id === instanceId)) {
      this.previewInstance = null;
    } else {
      this.previewInstance = {id: instanceId, name: instanceName, options: options};
    }
  }

  @action
  resetInstanceIdAvailability() {
    this.instanceIdAvailability.clear();
  }

  @action
  async checkInstanceIdAvailability(instanceId, mode) {
    this.instanceIdAvailability.set(instanceId, {
      isAvailable: false,
      isChecking: true,
      error: null
    });
    try{
      const { data } = await API.axios.get(API.endpoints.instance(instanceId));
      runInAction(() => {
        const resolvedId = data && data.data && data.data.id;
        if (!resolvedId) {
          throw `${API.endpoints.instance(instanceId)} response is invalid" (${data})`;
        }
        this.instanceIdAvailability.delete(instanceId);
        const instance = this.createInstanceOrGet(resolvedId);
        instance.initializeData(data && data.data, mode !== "edit" && mode !== "create");

        if (mode === "create") {
          routerStore.history.replace(`/instance/edit/${resolvedId}`);
        }
      });
    } catch(e){
      runInAction(() => {
        const status =  this.instanceIdAvailability.get(instanceId);
        if (e.response && e.response.status === 404) {
          status.isAvailable = true;
          status.isChecking = false;
        } else {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          status.error = `Failed to fetch instance "${instanceId}" (${message}) ${errorMessage}`;
          status.isAvailable = false;
          status.isChecking = false;
        }
      });
    }
  }

  @computed
  get getUnsavedInstances() {
    return Array.from(this.instances.values()).filter(instance => instance.hasChanged).reverse();
  }

  @computed
  get hasUnsavedChanges(){
    return this.getUnsavedInstances.length > 0;
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

  @action
  processLabelsQueue(){
    if(this.instanceLabelsQueue.size <= 0){
      this._debouncedFetchLabelsQueue.cancel();
    } else if(this.instanceLabelsQueue.size < this.queueThreshold){
      this._debouncedFetchLabelsQueue();
    } else if(!this.isFetchingLabelsQueue){
      this._debouncedFetchLabelsQueue.cancel();
      this.fetchLabelsQueue();
    }
  }

  _debouncedFetchQueue = debounce(()=>{this.fetchQueue();}, this.queueTimeout);
  _debouncedFetchLabelsQueue = debounce(()=>{this.fetchLabelsQueue();}, this.queueTimeout);

  @action
  async fetchQueue(){
    if(this.isFetchingQueue){
      return;
    }
    this.isFetchingQueue = true;
    const toProcess = Array.from(this.instancesQueue).splice(0, this.queueThreshold);
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
      const response = await API.axios.post(API.endpoints.instancesList(this.stage), toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response && response.data && response.data.data && response.data.data[identifier];
            if(data){
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
  async fetchLabelsQueue(){
    if(this.isFetchingLabelsQueue){
      return;
    }
    this.isFetchingLabelsQueue = true;
    const toProcess = Array.from(this.instanceLabelsQueue).splice(0, this.queueThreshold);
    toProcess.forEach(identifier => {
      if(this.instances.has(identifier)) {
        const instance = this.instances.get(identifier);
        instance.isLabelFetching = true;
        instance.isLabelFetched = false;
        instance.labelFetchError = null;
        instance.hasLabelFetchError = false;
        instance.saveError = null;
      }
    });
    try{
      let response = await API.axios.post(API.endpoints.instancesLabel(this.stage), toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response && response.data && response.data.data && response.data.data[identifier];
            if(data){
              instance.initializeLabelData(data);
            } else if (response && response.data && response.data.error && response.data.error[identifier]) {
              const error = response.data.error[identifier];
              const message = JSON.stringify(error); // TODO: check and handle properly error object
              instance.errorLabelInstance(message);
              instance.isLabelFetching = false;
              instance.isLabelFetched = false;
            } else {
              const message = "This instance can not be found - it either could have been removed or it is not accessible by your user account.";
              instance.errorLabelInstance(message);
              instance.isLabelFetching = false;
              instance.isLabelFetched = false;
            }
            this.instanceLabelsQueue.delete(identifier);
          }
        });
        this.isFetchingLabelsQueue = false;
        this.processLabelsQueue();
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            instance.errorLabelInstance(e);
            instance.isLabelFetching = false;
            instance.isLabelFetched = false;
            this.instanceLabelsQueue.delete(identifier);
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
    this.resetInstanceIdAvailability();
  }

  @action
  createInstanceOrGet(instanceId){
    if (!this.instances.has(instanceId)) {
      const instance = new Instance(instanceId, this);
      this.instances.set(instanceId, instance);
    }
    return this.instances.get(instanceId);
  }

  @action
  createNewInstance(type, id, name=""){
    const instanceType = {name: type.name, label: type.label, color: type.color};
    const fields = toJS(type.fields);
    const data = {
      id: id,
      _name: name,
      types: [instanceType],
      primaryType: instanceType,
      workspace: appStore.currentWorkspace.id,
      fields: toJS(fields),
      labelField: type.labelField,
      promotedFields: toJS(type.promotedFields),
      alternatives: {},
      metadata: {},
      permissions: { canRead: true, canCreate: true, canWrite: true }
    };
    if (name && data.labelField && data.fields && data.fields[data.labelField]) {
      data.fields[data.labelField].value = name;
    }
    const instance  = new Instance(id, this);
    instance.initializeData(data, false, true);
    this.instances.set(id, instance);
  }

  @action
  removeInstances(instanceIds) {
    instanceIds.forEach(id => this.instances.delete(id));
  }

  @action
  setReadMode(readMode){
    this.instances.forEach(instance => instance.setReadMode(readMode));
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
