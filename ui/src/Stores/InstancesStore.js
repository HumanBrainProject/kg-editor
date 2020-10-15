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
import { debounce } from "lodash";

import API from "../Services/API";
import appStore from "./AppStore";
import routerStore from "./RouterStore";
import InstanceStore from "./InstanceStore";

class Instance extends InstanceStore {

  @observable cancelChangesPending = null;
  @observable saveError = null;
  @observable hasSaveError = false;
  @observable isSaving = false;

  store = null;

  constructor(id, store) {
    super(id);
    this.store = store;
  }

  @computed
  get linkedIds() {
    const ids = this.childrenIds.reduce((acc, id) => {
      if (id !== this.id) {
        const instance = this.store.instances.get(id);
        if (instance) {
          instance.linkedIds.forEach(child => acc.add(child));
        }
      }
      return acc;
    }, new Set().add(this.id));
    return Array.from(ids);
  }

  @action
  fetch(forceFetch = false) {
    if (!this.isFetching && (!this.isFetched || this.fetchError || forceFetch)) {
      this.store.fetchInstance(this);
    }
  }

  @action
  fetchLabel(forceFetch = false) {
    if (!this.isFetching && !this.isLabelFetching) {
      if (forceFetch || (!this.isFetched && !this.isLabelFetched)) {
        this.store.fetchInstanceLabel(this);
      }
    }
  }

  @action
  async save() {

    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    const payload = this.returnValue;
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
            this.store.instances.set(newId, this);
            this.store.instance.delete(this.id);
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
        const message = e.message ? e.message : e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data : "";
        this.saveError = `Error while saving instance "${this.id}" (${message}) ${errorMessage}`;
        this.hasSaveError = true;
        this.isSaving = false;
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  cancelSave() {
    this.saveError = null;
    this.hasSaveError = false;
  }

  @action
  cancelChanges() {
    Object.values(this.fields).forEach(field => field.reset());
    this.cancelChangesPending = false;
    this.saveError = null;
    this.hasSaveError = false;
  }

}

class InstancesStore {
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
        instance.initializeData(data && data.data);
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
        instance.clearFieldsErrors();
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
              instance.initializeData(data, false);
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
    const instance  = new Instance(id, this);
    instance.initializeData(data, true);
    instance.fields[instance.labelField].setValue(name);
    this.instances.set(id, instance);
  }

  @action
  removeInstances(instanceIds) {
    instanceIds.forEach(id => this.instances.delete(id));
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
  return new InstancesStore(stage);
};

export default new InstancesStore();
