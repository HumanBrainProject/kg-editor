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

import debounce from 'lodash/debounce';
import {
  observable,
  action,
  runInAction,
  computed,
  toJS,
  makeObservable
} from 'mobx';

import InputTextStore from '../Fields/Stores/InputTextStore';
import {
  ViewMode,
  type Stage,
  type StructureOfType,
  type UUID
} from '../types';
import { Instance as BaseInstance } from './Instance';
import type RootStore from './RootStore';
import type { APIError } from '../Services/API';
import type API from '../Services/API';
import type {
  PreviewInstanceOptions,
  PreviewInstance
} from '../types';

export class Instance extends BaseInstance {
  cancelChangesPending?: boolean;
  saveError?: string;
  hasSaveError = false;
  isSaving = false;

  store: InstanceStore;

  constructor(id: string, store: InstanceStore) {
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

  get linkedIds(): string[] {
    const ids = this.childrenIds.reduce(
      (acc, id) => {
        if (id !== this.id) {
          const instance = this.store.instances.get(id);
          if (instance && instance.linkedIds) {
            instance.linkedIds.forEach(child => acc.add(child));
          }
        }
        return acc;
      },
      this.id ? new Set<string>().add(this.id) : new Set<string>()
    );
    return Array.from(ids);
  }

  fetch(forceFetch = false) {
    if (
      !this.isFetching &&
      (!this.isFetched || this.fetchError || forceFetch)
    ) {
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
    if (
      !this.isRawFetching &&
      (!this.isRawFetched || this.rawFetchError || forceFetch)
    ) {
      this.isRawFetching = true;
      this.hasRawFetchError = false;
      this.rawFetchError = undefined;
      try {
        const { data, permissions } = await this.store.api.getRawInstance(this.id);
        this.initializeRawData(data, permissions);
      } catch (e) {
        const err = e as APIError;
        runInAction(() => {
          if (err.response && err.response.status === 404) {
            this.errorRawInstance(err, true);
          } else {
            this.errorRawInstance(err);
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
        const { data } = await this.store.api.createInstance(
          this.space,
          this.id,
          payload
        );
        runInAction(() => {
          const newId = data.id;
          this.isNew = false;
          this.saveError = undefined;
          this.hasSaveError = false;
          this.isSaving = false;
          this.rawData = undefined;
          this.rawFetchError = undefined;
          this.hasRawFetchError = false;
          this.isRawFetched = false;
          this.isRawFetching = false;
          if (newId !== this.id) {
            this.store.instances.set(newId, this);
            this.store.instances.delete(this.id);
            this.id = newId;
          }
          this.initializeData(this.store.api, this.store.rootStore, data);
        });
      } else {
        const { data } = await this.store.api.patchInstance(this.id, payload);
        runInAction(() => {
          this.saveError = undefined;
          this.hasSaveError = false;
          this.isSaving = false;
          this.rawData = undefined;
          this.rawFetchError = undefined;
          this.hasRawFetchError = false;
          this.isRawFetched = false;
          this.isRawFetching = false;
          this.initializeData(this.store.api, this.store.rootStore, data);
        });
      }
    } catch (e) {
      const err = e as APIError;
      runInAction(() => {
        const errorMessage =
          err.response && err.response.status !== 500 ? err.response.data : '';
        this.saveError = `Error while saving instance "${this.id}" (${err?.message}) ${errorMessage}`;
        this.hasSaveError = true;
        this.isSaving = false;
      });
    }
  }

  cancelSave() {
    this.saveError = undefined;
    this.hasSaveError = false;
  }

  cancelChanges() {
    Object.values(this.fields).forEach(field => field.reset());
    this.cancelChangesPending = false;
    this.saveError = undefined;
    this.hasSaveError = false;
  }
}

export class InstanceStore {
  stage?: Stage;
  instances: Map<UUID, Instance> = new Map();
  previewInstance?: PreviewInstance;

  instancesQueue: Set<UUID> = new Set();
  instanceLabelsQueue: Set<UUID> = new Set();
  isFetchingQueue = false;
  isFetchingLabelsQueue = false;
  queueThreshold = 1000;
  queueTimeout = 250;

  api: API;
  rootStore: RootStore;

  constructor(api: API, rootStore: RootStore, stage?: Stage) {
    makeObservable(this, {
      stage: observable,
      instances: observable,
      previewInstance: observable,
      togglePreviewInstance: action,
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
      fetchMoreIncomingLinks: action
    });

    this.stage = stage;

    this.api = api;
    this.rootStore = rootStore;
  }

  fetchInstance(instance: Instance) {
    if (!this.instancesQueue.has(instance.id)) {
      this.instancesQueue.add(instance.id);
      this.processQueue();
    }
  }

  fetchInstanceLabel(instance: Instance) {
    if (!this.instanceLabelsQueue.has(instance.id)) {
      this.instanceLabelsQueue.add(instance.id);
      this.processLabelsQueue();
    }
  }

  togglePreviewInstance(
    instanceId?: UUID,
    instanceName?: string,
    options?: PreviewInstanceOptions
  ) {
    if (
      !instanceId ||
      (this.previewInstance && this.previewInstance.id === instanceId)
    ) {
      this.previewInstance = undefined;
    } else {
      this.previewInstance = {
        id: instanceId,
        name: instanceName,
        options: options
      };
    }
  }

  getIncomingLinksOfType(instanceId: UUID, property: string, type: string) {
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

  async fetchMoreIncomingLinks(
    instanceId: UUID,
    property: string,
    type: string
  ) {
    const links = this.getIncomingLinksOfType(instanceId, property, type);
    if (links) {
      links.isFetching = true;
      links.fetchError = undefined;
      try {
        const data = await this.api.getMoreIncomingLinks(
          instanceId,
          property,
          type,
          links.from + links.size,
          50
        );
        runInAction(() => {
          links.isFetching = false;
          links.size += data.size;
          links.total = data.total;
          links.instances = [...links.instances, ...data.data];
        });
      } catch (e) {
        const err = e as APIError;
        runInAction(() => {
          const errorMessage =
            err.response && err.response.status !== 500
              ? err.response.data
              : '';
          links.fetchError = `Failed to retrieve more incoming links "(${err?.message}) ${errorMessage}"`;
          links.isFetching = false;
        });
      }
    }
  }

  get getUnsavedInstances() {
    return Array.from(this.instances.values())
      .filter(instance => instance.hasChanged)
      .reverse();
  }

  get hasUnsavedChanges() {
    return this.getUnsavedInstances.length > 0;
  }

  clearUnsavedChanges() {
    this.getUnsavedInstances.forEach(i => {
      const instance = this.instances.get(i.id);
      if(instance) {
        instance.cancelChanges();
        if (instance.isNew) {
          instance.isNew = false;
        }
      }
    });
  }

  processQueue() {
    if (this.instancesQueue.size <= 0) {
      this._debouncedFetchQueue.cancel();
    } else if (this.instancesQueue.size < this.queueThreshold) {
      this._debouncedFetchQueue();
    } else if (!this.isFetchingQueue) {
      this._debouncedFetchQueue.cancel();
      this.fetchQueue();
    }
  }

  processLabelsQueue() {
    if (this.instanceLabelsQueue.size <= 0) {
      this._debouncedFetchLabelsQueue.cancel();
    } else if (this.instanceLabelsQueue.size < this.queueThreshold) {
      this._debouncedFetchLabelsQueue();
    } else if (!this.isFetchingLabelsQueue) {
      this._debouncedFetchLabelsQueue.cancel();
      this.fetchLabelsQueue();
    }
  }

  _debouncedFetchQueue = debounce(() => {
    this.fetchQueue();
  }, this.queueTimeout);
  _debouncedFetchLabelsQueue = debounce(() => {
    this.fetchLabelsQueue();
  }, this.queueTimeout);

  async fetchQueue() {
    if (this.isFetchingQueue) {
      return;
    }
    this.isFetchingQueue = true;
    const toProcess = Array.from(this.instancesQueue).splice(
      0,
      this.queueThreshold
    );
    toProcess.forEach(identifier => {
      if (this.instances.has(identifier)) {
        const instance = this.instances.get(identifier);
        if (instance) {
          instance.cancelChangesPending = false;
          instance.isFetching = true;
          instance.isSaving = false;
          instance.isFetched = false;
          instance.fetchError = undefined;
          instance.hasFetchError = false;
          instance.saveError = undefined;
          instance.hasSaveError = false;
          instance.clearFieldsErrors();
        }
      }
    });
    try {
      const { data: response } = await this.api.getInstancesList(
        this.stage,
        toProcess
      );
      runInAction(() => {
        toProcess.forEach(identifier => {
          if (this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response ? response[identifier] : undefined;
            if (data) {
              if (data.error) {
                const code = data.error.code
                  ? ` [error ${data.error.code}]`
                  : '';
                const message = `Instance not found - it either could have been removed or it's not a recognized ressource${code}.`;
                if (instance) {
                  instance.errorInstance(message, data.error.code === 404);
                  instance.isFetching = false;
                  instance.isFetched = false;
                }
              } else {
                if (instance) {
                  instance.initializeData(
                    this.api,
                    this.rootStore,
                    data,
                    false
                  );
                  this.rootStore.appStore.syncInstancesHistory(
                    instance,
                    ViewMode.VIEW
                  );
                }
              }
            } else {
              const message = 'Unexpected error: no response returned.';
              if (instance) {
                instance.errorInstance(message, true);
                instance.isFetching = false;
                instance.isFetched = false;
              }
            }
          }
          this.instancesQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    } catch (e) {
      runInAction(() => {
        toProcess.forEach(identifier => {
          if (this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            if (instance) {
              instance.errorInstance(e as APIError);
              instance.isFetching = false;
              instance.isFetched = false;
            }
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
    const toProcess = Array.from(this.instanceLabelsQueue).splice(
      0,
      this.queueThreshold
    );
    toProcess.forEach(identifier => {
      if (this.instances.has(identifier)) {
        const instance = this.instances.get(identifier);
        if (instance) {
          instance.isLabelFetching = true;
          instance.isLabelFetched = false;
          instance.fetchLabelError = undefined;
          instance.hasLabelFetchError = false;
          instance.saveError = undefined;
        }
      }
    });
    try {
      const { data: response } = await this.api.getInstancesLabel(
        this.stage,
        toProcess
      );
      runInAction(() => {
        toProcess.forEach(identifier => {
          if (this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            const data = response ? response[identifier] : undefined;
            if (data) {
              if (data.error) {
                const code = data.error.code ? ` [${data.error.code}]` : '';
                const message = `Instance not found - it either could have been removed or it's not a recognized ressource${code}.`;
                if (instance) {
                  instance.errorLabelInstance(message, data.error.code === 404);
                  instance.isLabelFetching = false;
                  instance.isLabelFetched = false;
                }
              } else {
                instance?.initializeLabelData(data);
              }
            } else {
              const message = 'Unexpected error: no response returned.';
              if (instance) {
                instance.errorLabelInstance(message, true);
                instance.isLabelFetching = false;
                instance.isLabelFetched = false;
              }
            }
          }
          this.instanceLabelsQueue.delete(identifier);
        });
        this.isFetchingLabelsQueue = false;
        this.processLabelsQueue();
      });
    } catch (e) {
      runInAction(() => {
        toProcess.forEach(identifier => {
          if (this.instances.has(identifier)) {
            const instance = this.instances.get(identifier);
            if (instance) {
              instance.errorLabelInstance(e as APIError);
              instance.isLabelFetching = false;
              instance.isLabelFetched = false;
            }
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
  }

  createInstanceOrGet(instanceId: UUID) {
    if (!this.instances.has(instanceId)) {
      const instance = new Instance(instanceId, this);
      this.instances.set(instanceId, instance);
    }
    return this.instances.get(instanceId) as Instance;
  }

  createNewInstance(type: StructureOfType, id: UUID, name = '') {
    const instanceType = {
      name: type.name,
      label: type.label,
      color: type.color
    };
    const fields = toJS(type.fields);
    const data = {
      id: id,
      _name: type.labelField ? name : id,
      types: [instanceType],
      primaryType: instanceType,
      space: this.rootStore.appStore.currentSpace?.id,
      fields: toJS(fields),
      promotedFields: toJS(type.promotedFields),
      alternatives: {},
      permissions: toJS(this.rootStore.appStore.currentSpacePermissions),
      possibleIncomingLinks: type.incomingLinks,
      labelField: ''
    }; //TODO: Fix me!
    if (type.labelField) {
      data.labelField = type.labelField;
    }
    const instance = new Instance(id, this);
    instance.initializeData(this.api, this.rootStore, data, true);
    if (instance.labelField && instance.fields[instance.labelField] instanceof InputTextStore) {
      (instance.fields[instance.labelField] as InputTextStore).setValue(name);
    }
    this.instances.set(id, instance);
  }

  removeInstances(instanceIds: UUID[]) {
    instanceIds.forEach(id => this.instances.delete(id));
  }

  cancelInstanceChanges(instanceId: UUID) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.cancelChangesPending = true;
    }
  }

  confirmCancelInstanceChanges(instanceId: UUID) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.cancelChanges();
    }
  }

  abortCancelInstanceChange(instanceId: UUID) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.cancelChangesPending = false;
    }
  }
}

export const createInstanceStore = (
  api: API,
  rootStore: RootStore,
  stage?: Stage
) => new InstanceStore(api, rootStore, stage);

export default InstanceStore;
