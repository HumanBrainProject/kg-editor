/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import { observable, action, runInAction, computed, toJS, makeObservable } from "mobx";
import debounce from "lodash/debounce";
import _  from "lodash-uuid";

import { Instance as BaseInstance } from "./Instance";

class Instance extends BaseInstance {

  cancelChangesPending = null;
  saveError = null;
  hasSaveError = false;
  isSaving = false;

  store = null;

  constructor(id, store) {
    super(id);

    makeObservable(this, {
      cancelChangesPending: observable,
      saveError: observable,
      hasSaveError: observable,
      isSaving: observable,
      linkedIds: computed,
      fetch: action,
      fetchLabel: action,
      fetchRaw: action,
      save: action,
      cancelSave: action,
      cancelChanges: action
    });

    this.store = store;
  }

  get linkedIds() {
    const ids = this.childrenIds.reduce((acc, id) => {
      if (id !== this.id) {
        const instance = this.store.instances.get(id);
        if (instance && instance.linkedIds) {
          instance.linkedIds.forEach(child => acc.add(child));
        }
      }
      return acc;
    }, new Set().add(this.id));
    return Array.from(ids);
  }

  fetch(forceFetch = false) {
    if (!this.isFetching && (!this.isFetched || this.fetchError || forceFetch)) {
      this.store.fetchInstance(this);
    }
  }

  fetchLabel(forceFetch = false) {
    if (!this.isFetching && !this.isLabelFetching) {
      if (forceFetch || (!this.isFetched && !this.isLabelFetched)) {
        this.store.fetchInstanceLabel(this);
      }
    }
  }

  async fetchRaw(forceFetch = false) {
    if (!this.isRawFetching && (!this.isRawFetched || this.rawFetchError || forceFetch)) {
      this.isRawFetching = true;
      this.hasRawFetchError = false;
      this.rawFetchError = null;
      try {
        const { data } = await this.store.transportLayer.getRawInstance(this.id);
        this.initializeRawData(data && data.data, data && data.permissions);
      } catch (e) {
        runInAction(() => {
          if(e.response && e.response.status === 404){
            this.errorRawInstance(e, true);
          } else {
            this.errorRawInstance(e);
          }
        });
      }
    }
  }

  async save() {
    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    const payload = this.returnValue;
    try {
      if (this.isNew) {
        const { data } = await this.store.transportLayer.createInstance(this.space, this.id, payload);
        runInAction(() => {
          const newId = data.data.id;
          this.isNew = false;
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          this._initialJsonData = null;
          this.rawData = null;
          this.rawFetchError = null;
          this.hasRawFetchError = false;
          this.isRawFetched = false;
          this.isRawFetching = false;
          if (newId !== this.id) {
            this.store.instances.set(newId, this);
            this.store.instance.delete(this.id);
            this.id = newId;
          }
          this.initializeData(this.store.transportLayer, this.store.rootStore, data.data);
        });
      } else {
        const { data } = await this.store.transportLayer.patchInstance(this.id, payload);
        runInAction(() => {
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          this._initialJsonData = null;
          this.rawData = null;
          this.rawFetchError = null;
          this.hasRawFetchError = false;
          this.isRawFetched = false;
          this.isRawFetching = false;
          this.initializeData(this.store.transportLayer, this.store.rootStore, data.data);
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
    }
  }

  cancelSave() {
    this.saveError = null;
    this.hasSaveError = false;
  }

  cancelChanges() {
    Object.values(this.fields).forEach(field => field.reset());
    this.cancelChangesPending = false;
    this.saveError = null;
    this.hasSaveError = false;
  }

}

export class InstanceStore {
  stage = null;
  instances = new Map();
  previewInstance = null;
  instanceIdAvailability = new Map();

  instancesQueue = new Set();
  instanceLabelsQueue = new Set();
  isFetchingQueue = false;
  isFetchingLabelsQueue = false;
  queueThreshold = 1000;
  queueTimeout = 250;

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore, stage=null) {
    makeObservable(this, {
      stage: observable,
      instances: observable,
      previewInstance: observable,
      instanceIdAvailability: observable,
      togglePreviewInstance: action,
      resetInstanceIdAvailability: action,
      checkInstanceIdAvailability: action,
      checkRawInstanceIdAvailability: action,
      checkNonRawInstanceIdAvailability: action,
      getUnsavedInstances: computed,
      hasUnsavedChanges: computed,
      processQueue: action,
      processLabelsQueue: action,
      fetchQueue: action,
      fetchLabelsQueue: action,
      flush: action,
      createInstanceOrGet: action,
      createNewInstance: action,
      removeInstances: action,
      cancelInstanceChanges: action,
      confirmCancelInstanceChanges: action,
      abortCancelInstanceChange: action,
      clearUnsavedChanges: action,
      fetchMoreIncomingLinks: action,
    });

    this.stage = stage?stage:null;

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
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

  togglePreviewInstance(instanceId, instanceName, options) {
    if (!instanceId || (this.previewInstance && this.previewInstance.id === instanceId)) {
      this.previewInstance = null;
    } else {
      this.previewInstance = {id: instanceId, name: instanceName, options: options};
    }
  }


  getIncomingLinksOfType(instanceId, property, type) {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return null;
    }
    const prop = instance.incomingLinks.find(p => p.property === property);
    if (!prop) {
      return null;
    }
    return prop.links.find(lk => lk.type.name === type);
  }

  async fetchMoreIncomingLinks(instanceId, property, type) {
    const links = this.getIncomingLinksOfType(instanceId, property, type);
    if (links) {
      links.isFetching = true;
      links.fetchError = null;
      try {
        const { data } = await this.transportLayer.getMoreIncomingLinks(instanceId, property, type, links.from + links.size, 50);
        runInAction(() => {
          links.isFetching = false;
          links.size += data.size;
          links.total = data.total;
          links.instances = [...links.instances, ...data.data];
        });
      } catch(e){
        runInAction(() => {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          links.fetchError = `Failed to retrieve more incoming links "(${message}) ${errorMessage}"`;
          links.isFetching = false;
        });
      }
    }
  }

  resetInstanceIdAvailability() {
    this.instanceIdAvailability.clear();
  }

  async checkRawInstanceIdAvailability(instanceId) {
    try{
      const { data } = await this.transportLayer.getRawInstance(instanceId);
      runInAction(() => {
        const resolvedfullId = data && data.data && data.data["@id"];
        const path = typeof resolvedfullId === "string" && resolvedfullId.split("/");
        const resolvedId = (path && path.length)?path[path.length -1]:null;
        if (!resolvedId) {
          throw new Error(`Failed to fetch instance "${instanceId}" (Invalid response) (${data})`);
        }
        this.instanceIdAvailability.delete(instanceId);
        const instance = this.createInstanceOrGet(resolvedId);
        instance.initializeRawData(data && data.data, data && data.permissions);
        const view = this.rootStore.viewStore.views.get(resolvedId);
        if(view) {
          view.setNameAndColor(instance.name, instance.primaryType.color);
          this.rootStore.viewStore.syncStoredViews();
        }
      });
    } catch(e){
      runInAction(() => {
        const status =  this.instanceIdAvailability.get(instanceId);
        if (e.response && e.response.status === 404) {
          if(status.type) {
            this.createNewInstance(status.type, instanceId);
            this.resetInstanceIdAvailability();
          } else {
            status.isAvailable = true;
            status.isChecking = false;
          }
        } else {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          status.error = `Failed to fetch instance "${instanceId}" (${message}) ${errorMessage}`;
          status.isAvailable = false;
          status.isChecking = false;
        }
      });
    }
  };

  async checkNonRawInstanceIdAvailability(instanceId, mode, navigate) {
    try{
      const { data } = await this.transportLayer.getInstance(instanceId);
      runInAction(() => {
        const resolvedId = data && data.data && data.data.id;
        if (!resolvedId) {
          throw new Error(`Failed to fetch instance "${instanceId}" (Invalid response) (${data})`);
        }
        this.instanceIdAvailability.delete(instanceId);
        const instance = this.createInstanceOrGet(resolvedId);
        instance.initializeData(this.transportLayer, this.rootStore, data && data.data);
        const view = this.rootStore.viewStore.views.get(resolvedId);
        if(view) {
          view.setNameAndColor(instance.name, instance.primaryType.color);
          this.rootStore.viewStore.syncStoredViews();
        }
        if (mode === "create") {
          navigate(`/instances/${resolvedId}/edit`, {replace:true});
        }
      });
    } catch(e){
      runInAction(() => {
        const status =  this.instanceIdAvailability.get(instanceId);
        if (e.response && e.response.status === 404) {
          if(status.type) {
            this.createNewInstance(status.type, instanceId);
            this.resetInstanceIdAvailability();
          } else {
            status.isAvailable = true;
            status.isChecking = false;
          }
        } else {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          status.error = `Failed to fetch instance "${instanceId}" (${message}) ${errorMessage}`;
          status.isAvailable = false;
          status.isChecking = false;
        }
      });
    }
  };

  checkInstanceIdAvailability(instanceId, mode, navigate) {
    const rawMode = mode === "raw";
    const instance = this.instances.get(instanceId);
    if (instance && ((rawMode && instance.isRawFetched) || (!rawMode && instance.isFetched))) {
      this.instanceIdAvailability.delete(instanceId);
    } else {
      const status = this.instanceIdAvailability.get(instanceId);
      if(status) {
        status.isAvailable = false;
        status.isChecking = true;
        status.error = null;
      } else {
        this.instanceIdAvailability.set(instanceId, {
          isAvailable: false,
          isChecking: true,
          error: null
        });
      }
      if (rawMode) {
        if (instance && instance.store.rootStore.typeStore.isFetched && instance._initialJsonData) {
          instance.initializeData(instance.store.transportLayer, instance.store.rootStore, instance._initialJsonData);
        }
        this.checkRawInstanceIdAvailability(instanceId);
      } else {
        if (instance && instance.store.rootStore.typeStore.isFetched && instance._initialJsonData) {
          instance.initializeData(instance.store.transportLayer, instance.store.rootStore, instance._initialJsonData);
        } else {
          this.checkNonRawInstanceIdAvailability(instanceId, mode, navigate);
        }
      }
    }
  }

  get getUnsavedInstances() {
    return Array.from(this.instances.values()).filter(instance => instance.hasChanged).reverse();
  }

  get hasUnsavedChanges() {
    return this.getUnsavedInstances.length > 0;
  }

  clearUnsavedChanges() {
    this.getUnsavedInstances.forEach(i => {
      const instance = this.instances.get(i.id);
      instance.cancelChanges();
      if(instance.isNew) {
        instance.isNew = false;
      }
    });
  }

  processQueue() {
    if(this.instancesQueue.size <= 0){
      this._debouncedFetchQueue.cancel();
    } else if(this.instancesQueue.size < this.queueThreshold){
      this._debouncedFetchQueue();
    } else if(!this.isFetchingQueue){
      this._debouncedFetchQueue.cancel();
      this.fetchQueue();
    }
  }

  processLabelsQueue() {
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

  async fetchQueue() {
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
    try {
      const response = await this.transportLayer.getInstancesList(this.stage, toProcess);
      runInAction(() => {
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response && response.data && response.data.data && response.data.data[identifier];
            if (data) {
              if (data.error) {
                const code = data.error.code?` [error ${data.error.code}]`:"";
                const message = `Instance not found - it either could have been removed or it's not a recognized ressource${code}.`;
                instance.errorInstance(message, data.error.code === 404);
                instance.isFetching = false;
                instance.isFetched = false;
              } else {
                instance.initializeData(this.transportLayer, this.rootStore, data, false);
                this.rootStore.appStore.syncInstancesHistory(instance, "viewed");
              }
            } else {
              const message = "Unexpected error: no response returned.";
              instance.errorInstance(message);
              instance.isFetching = false;
              instance.isFetched = false;
            }
          }
          this.instancesQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if (this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            instance.errorInstance(e);
            instance.isFetching = false;
            instance.isFetched = false;
          }
          this.instancesQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    }
  }

  async fetchLabelsQueue() {
    if (this.isFetchingLabelsQueue) {
      return;
    }
    this.isFetchingLabelsQueue = true;
    const toProcess = Array.from(this.instanceLabelsQueue).splice(0, this.queueThreshold);
    toProcess.forEach(identifier => {
      if (this.instances.has(identifier)) {
        const instance = this.instances.get(identifier);
        instance.isLabelFetching = true;
        instance.isLabelFetched = false;
        instance.labelFetchError = null;
        instance.hasLabelFetchError = false;
        instance.saveError = null;
      }
    });
    try {
      const response = await this.transportLayer.getInstancesLabel(this.stage, toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if (this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response && response.data && response.data.data && response.data.data[identifier];
            if (data) {
              if (data.error) {
                const code = data.error.code?` [${data.error.code}]`:"";
                const message = `Instance not found - it either could have been removed or it's not a recognized ressource${code}.`;
                instance.errorLabelInstance(message, data.error.code === 404);
                instance.isLabelFetching = false;
                instance.isLabelFetched = false;
              } else {
                instance.initializeLabelData(data);
              }
            } else {
              const message = "Unexpected error: no response returned.";
              instance.errorLabelInstance(message);
              instance.isLabelFetching = false;
              instance.isLabelFetched = false;
            }
          }
          this.instanceLabelsQueue.delete(identifier);
        });
        this.isFetchingLabelsQueue = false;
        this.processLabelsQueue();
      });
    } catch (e) {
      runInAction(() =>{
        toProcess.forEach(identifier => {
          if(this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            instance.errorLabelInstance(e);
            instance.isLabelFetching = false;
            instance.isLabelFetched = false;
          }
          this.instanceLabelsQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    }
  }

  flush() {
    this.instances.clear();
    this.resetInstanceIdAvailability();
  }

  createInstanceOrGet(instanceId) {
    if (!this.instances.has(instanceId)) {
      const instance = new Instance(instanceId, this);
      this.instances.set(instanceId, instance);
    }
    return this.instances.get(instanceId);
  }

  createNewInstance(type, id, name="") {
    const instanceType = {name: type.name, label: type.label, color: type.color};
    const fields = toJS(type.fields);
    const data = {
      id: id,
      _name: type.labelField?name:id,
      types: [instanceType],
      primaryType: instanceType,
      space: this.rootStore.appStore.currentSpace.id,
      fields: toJS(fields),
      promotedFields: toJS(type.promotedFields),
      alternatives: {},
      metadata: {},
      permissions: { canRead: true, canCreate: true, canWrite: true },
      possibleIncomingLinks: type.incomingLinks
    };
    if (type.labelField) {
      data.labelField = type.labelField;
    }
    const instance  = new Instance(id, this);
    instance.initializeData(this.transportLayer, this.rootStore, data, true);
    if (instance.labelField) {
      instance.fields[instance.labelField].setValue(name);
    }
    this.instances.set(id, instance);
  }

  createNewInstanceOfType = (type, navigate) => {
    const uuid = _.uuid();
    this.instanceIdAvailability.set(uuid, {
      isAvailable: false,
      isChecking: true,
      error: null,
      type: type
    });
    navigate(`/instances/${uuid}/create`);
  }

  removeInstances(instanceIds) {
    instanceIds.forEach(id => this.instances.delete(id));
  }

  cancelInstanceChanges(instanceId) {
    this.instances.get(instanceId).cancelChangesPending = true;
  }

  confirmCancelInstanceChanges(instanceId) {
    this.instances.get(instanceId).cancelChanges();
  }

  abortCancelInstanceChange(instanceId) {
    this.instances.get(instanceId).cancelChangesPending = false;
  }
}

export const createInstanceStore = (transportLayer, rootStore, stage=null) => {
  return new InstanceStore(transportLayer, rootStore, stage);
};

export default InstanceStore;
