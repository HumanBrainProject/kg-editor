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

import { observable, action, runInAction, computed, toJS } from "mobx";
import API from "../Services/API";
import appStore from "./AppStore";
import { fieldsMapping } from "../Fields";

import { normalizeInstanceData, normalizeLabelInstanceData, getChildrenIdsGroupedByField } from "../Helpers/InstanceHelper";

class instancesStore {
  @observable id = null;
  @observable _name = null;
  @observable types = [];
  @observable isNew = false;
  @observable labelField = null;
  @observable promotedFields = [];
  @observable primaryType = { name: "", color: "", label: "" };
  @observable workspace = "";
  @observable metadata = {};
  @observable permissions = {};
  @observable fields = {};

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

  constructor(id, store) {
    this.id = id;
    this.store = store;
  }

  @computed
  get hasChanged() {
    return this.isNew || Object.values(this.fields).reduce((acc, field) => acc || field.hasChanged, false);
  }

  @computed
  get hasFieldErrors() {
    return Object.values(this.fields).some(field => field.hasError);
  }

  @action
  clearFieldsErrors() {
    Object.values(this.fields).forEach(field => field.clearError);
  }


  @computed
  get name() {
    const field = this.isFetched && this.labelField && this.fields[this.labelField];
    if (field) {
      return (this.isNew && !field.value) ? `<New ${this.primaryType.label}>` : field.value;
    }
    return this._name ? this._name : this.id;
  }

  @computed
  get nonPromotedFields() {
    if (this.isFetched && !this.fetchError) {
      return Object.entries(this.fields)
        .filter(([key]) => !this.promotedFields.includes(key))
        .sort(([, a], [, b]) => a.label.localeCompare(b.label))
        .map(([key]) => key);
    }
    return [];
  }

  @computed
  get childrenIds() {
    if (this.isFetched && !this.fetchError && this.fields) {
      const ids = Object.values(this.fields)
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
        const instance = this.store.instances.get(id);
        if (instance) {
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
      return getChildrenIdsGroupedByField(Object.values(this.fields));
    }
    return [];
  }

  @computed
  get belongsToCurrentWorkspace() {
    return appStore.currentWorkspace && this.workspace !== appStore.currentWorkspace.id;
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
  initializeLabelData(data) {
    const normalizedData = normalizeLabelInstanceData(data);
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
  initializeData(data, isNew = false) {
    const normalizedData = normalizeInstanceData(data);
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
    Object.entries(normalizedData.fields).forEach(([name, field]) => {
      if (!this.fields[name]) {
        if(field.type === "InputTextMultiple" ||  field.type ==="CheckBox") {
          field.type = "InputText";
        }
        const fieldMapping = fieldsMapping[field.type];
        if (!fieldMapping) {
          throw `${field.type} type is not supported!`;
        }
        this.fields[name] = new fieldMapping.Store(field, fieldMapping.options, this);
      }
      const store = this.fields[name];
      const alternatives = normalizedData.fields[name].alternatives;
      store.update(field.value, alternatives);
    });
    this.fetchError = null;
    this.hasFetchError = false;
    this.isFetching = false;
    this.isFetched = true;
  }

  buildErrorMessage(e) {
    const message = e.message ? e.message : e;
    const errorMessage = e.response && e.response.status !== 500 ? e.response.data : "";
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
    const payload = {
      "@type": this.types.map(t => t.name)
    };
    return Object.entries(this.fields).reduce((acc, [name, field]) => {
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

export default instancesStore;