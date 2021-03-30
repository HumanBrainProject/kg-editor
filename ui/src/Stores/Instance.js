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

import { observable, action, computed, makeObservable } from "mobx";

import { fieldsMapping } from "../Fields";

export const compareField = (a, b, ignoreName=false) => {
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return 1;
  }
  if (!b) {
    return -1;
  }
  if (!a.order && !b.order) {
    if (ignoreName) {
      return 0;
    }
    if (!a.label && !b.label) {
      return 0;
    }
    if (!a.label) {
      return 1;
    }
    if (!b.label) {
      return -1;
    }
    return a.label.localeCompare(b.label);
  }
  if (!a.order) {
    return 1;
  }
  if (!b.order) {
    return -1;
  }
  return a.order - b.order;
};

export const normalizeLabelInstanceData = data => {
  const instance = {
    id: null,
    name: null,
    types: [],
    primaryType: { name: "", color: "", label: "" },
    workspace: "",
    error: null
  };

  if (!data) {
    return instance;
  }
  if (data.id) {
    instance.id = data.id;
  }
  if (data.types instanceof Array) {
    instance.types = data.types;
    if (instance.types.length) {
      instance.primaryType = instance.types[0];
    }
  }
  if (data.workspace) {
    instance.workspace = data.workspace;
  }
  if (data.name) {
    instance.name = data.name;
  }
  if (typeof data.error === "object") {
    instance.error = data.error;
  }
  return instance;
};

export const normalizeInstanceData = data => {

  const normalizeAlternative = (name, field, alternatives) => {
    field.alternatives = ((alternatives && alternatives[name])?alternatives[name]:[])
      .sort((a, b) => a.selected === b.selected?0:(a.selected?-1:1))
      .map(alternative => ({
        value: alternative.value,
        users: alternative.users,
        selected: !!alternative.selected
      }));
  };

  const normalizeField = (field, instanceId) => {
    if (field.widget === "Nested" && typeof field.fields === "object") {
      normalizeFields(field.fields, instanceId);
    }
  };

  const normalizeFields = (fields, instanceId, alternatives) => {
    Object.entries(fields).forEach(([name, field]) => {
      normalizeField(field, instanceId);
      normalizeAlternative(name, field, alternatives);
    });
  };

  const instance = {
    ...normalizeLabelInstanceData(data),
    fields: {},
    labelField: null,
    promotedFields: [],
    alternatives: {},
    metadata: {},
    permissions: {},
    incomingLinks: []
  };

  if (!data) {
    return instance;
  }
  if (data.id) {
    instance.id = data.id;
  }
  if (data.types instanceof Array) {
    instance.types = data.types;
    if (instance.types.length) {
      instance.primaryType = instance.types[0];
    }
  }
  if (data.workspace) {
    instance.workspace = data.workspace;
  }
  if (data.name) {
    instance.name = data.name;
  }
  if (data.labelField) {
    instance.labelField = data.labelField;
  }
  if(data.incomingLinks) {
    const incomingLinks = Object.values(data.incomingLinks).map(links => {
      const groupedLinks = links.reduce((acc,link) => {
        const types = link.types.map(t => t.name).join("/");
        if (!acc[types]) {
          acc[types] = {
            space: link.space,
            types: link.types,
            instances: []
          };
        }
        acc[types].instances.push({
          id: link.id,
          label: link.instanceLabel
        });
        return acc;
      }, {});
      return {
        label: links[0].label,
        links: Object.values(groupedLinks)
      };
    });
    instance.incomingLinks = incomingLinks;
  }
  if(data.possibleIncomingLinks) {
    instance.possibleIncomingLinks = Object.values(data.possibleIncomingLinks)
      .flatMap(link => link.sourceTypes)
      .reduce((acc, current) => {
        if(!acc.some(obj => obj.type.name === current.type.name && JSON.stringify(obj.spaces) === JSON.stringify(current.spaces))) {
          acc.push(current);
        }
        return acc;
      }, []);
  }
  if (data.promotedFields instanceof Array) {
    instance.promotedFields = data.promotedFields;
  }
  if (typeof data.fields === "object") {
    normalizeFields(data.fields, instance.id, data.alternatives);
    instance.fields = data.fields;
  }
  if (typeof data.metadata === "object") {
    const metadata = data.metadata;
    instance.metadata = Object.keys(metadata).map(key => {
      if (key == "lastUpdateAt" || key == "createdAt") {
        const d = new Date(metadata[key].value);
        metadata[key].value = d.toLocaleString();
      }
      return metadata[key];
    });
  }
  if (typeof data.permissions === "object") {
    instance.permissions = data.permissions;
  }
  return instance;
};

const getChildrenIdsGroupedByField = fields => {
  function getPagination(field) {
    if (field.lazyShowLinks) {
      const total = field.numberOfValues;
      if (total) {
        return {
          count: field.numberOfVisibleLinks,
          total: total
        };
      }
    }
    return null;
  }

  function showId(field, id) {
    if (id) {
      if (field.lazyShowLinks) {
        return field.isLinkVisible(id);
      }
      return true;
    }
    return false;
  }

  function getIds(field) {
    const values = field.returnValue;
    const mappingValue = field.mappingValue;
    return Array.isArray(values) ? values.filter(obj => obj && obj[mappingValue]).map(obj => obj[mappingValue]).filter(id => showId(field, id)) : [];
  }

  function getGroup(field) {
    const ids = getIds(field);
    if (ids.length) {
      const group = {
        //name: field.name,
        label: field.label,
        ids: ids
      };
      const pagination = getPagination(field);
      if (pagination) {
        group.pagination = pagination;
      }
      return group;
    }
    return null;
  }

  function getGroups(field) {
    const groups = [];
    if (field.widget === "Nested") {
      const nestedGroups = getNestedFields(field.nestedFieldsStores);
      groups.push(...nestedGroups);
    } else if (field.isLink) {
      const group = getGroup(field);
      if (group) {
        groups.push(group);
      }
    }
    return groups;
  }

  function getNestedFields(fields) {
    return fields.reduce((acc, rowFields) => {
      acc.push(...Object.values(rowFields).reduce((acc2, field) => {
        const groups = getGroups(field);
        acc2.push(...groups);
        return acc2;
      }, []));
      return acc;
    }, []);
  }

  function getUniqueGroups(fields) {
    const list = fields.reduce((acc, field) => {
      const groups = getGroups(field);
      acc.push(...groups);
      return acc;
    }, []);
    return Object.entries(list.reduce((acc, group) => {
      if (!acc[group.label]) {
        acc[group.label] = [];
      }
      acc[group.label].push(...group.ids);
      return acc;
    }, {}))
      .map(([label, ids]) => ({label: label, ids: ids}))
      .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  const groups = getUniqueGroups(fields);
  return groups;
};
export class Instance {
  id = null;
  _rawData = null;
  _name = null;
  types = [];
  isNew = false;
  labelField = null;
  _promotedFields = [];
  primaryType = { name: "", color: "", label: "" };
  workspace = "";
  metadata = {};
  permissions = {};
  fields = {};
  incomingLinks=[];
  possibleIncomingLinks=[];

  isLabelFetching = false;
  isLabelFetched = false;
  fetchLabelError = null;
  isLabelNotFound = false;
  hasLabelFetchError = false;

  isFetching = false;
  isFetched = false;
  fetchError = null;
  isNotFound = false
  hasFetchError = false;

  constructor(id, transportLayer) {
    makeObservable(this, {
      id: observable,
      _rawData: observable,
      _name: observable,
      types: observable,
      isNew: observable,
      labelField: observable,
      _promotedFields: observable,
      primaryType: observable,
      workspace: observable,
      metadata: observable,
      permissions: observable,
      fields: observable,
      incomingLinks: observable,
      possibleIncomingLinks: observable,
      isLabelFetching: observable,
      isLabelFetched: observable,
      fetchLabelError: observable,
      isLabelNotFound: observable,
      hasLabelFetchError: observable,
      isFetching: observable,
      isFetched: observable,
      fetchError: observable,
      isNotFound: observable,
      hasFetchError: observable,
      cloneInitialData: computed,
      returnValue: computed,
      payload: computed,
      hasChanged: computed,
      hasFieldErrors: computed,
      reset: action,
      clearFieldsErrors: action,
      name: computed,
      promotedFields: computed,
      nonPromotedFields: computed,
      childrenIds: computed,
      childrenIdsGroupedByField: computed,
      initializeLabelData: action,
      initializeData: action,
      errorLabelInstance: action,
      errorInstance: action
    });

    this.id = id;
    this.transportLayer = transportLayer;
  }

  get cloneInitialData() {
    return {
      id: this.id,
      name: this.name,
      types: this.types.map(t => ({...t})),
      primaryType: {...this.primaryType},
      workspace: this.workspace,
      fields: Object.entries(this.fields).reduce((acc, [name, field]) => {
        acc[name] = field.cloneWithInitialValue;
        return acc;
      }, {}),
      labelField: this.labelField,
      promotedFields: [...this._promotedFields],
      metadata: {},
      permissions: {...this.permissions}
    };
  }

  get returnValue() {
    const payload = {
      "@type": this.types.map(t => t.name)
    };
    return Object.entries(this.fields).reduce((acc, [name, field]) => {
      if (field.hasChanged) {
        acc[name] = field.returnValue;
      }
      return acc;
    }, payload);
  }

  get payload() {
    const payload = {
      "@type": this.types.map(t => t.name)
    };
    return Object.entries(this.fields).reduce((acc, [name, field]) => {
      acc[name] = field.returnValue;
      return acc;
    }, payload);
  }

  get hasChanged() {
    return this.isNew || Object.values(this.fields).some(field => field.hasChanged);
  }

  get hasFieldErrors() {
    return Object.values(this.fields).some(field => field.hasError);
  }

  reset() {
    Object.values(this.fields).forEach(field => field.reset());
  }

  clearFieldsErrors() {
    Object.values(this.fields).forEach(field => {
      field.clearError();
      field.clearWarning();
    });
  }

  get name() {
    const field = this.isFetched && this.labelField && this.fields[this.labelField];
    if (field) {
      return (this.isNew && !field.value) ? `<New ${this.primaryType.label}>` : field.value;
    }
    return this._name ? this._name : this.id;
  }

  get promotedFields() {
    if (this.isFetched && !this.fetchError) {
      return this._promotedFields.map(name => [name, this.fields[name]])
        .sort(([, a], [, b]) => compareField(a, b, true))
        .map(([key]) => key);
    }
    return this._promotedFields;
  }

  get nonPromotedFields() {
    if (this.isFetched && !this.fetchError) {
      return Object.entries(this.fields)
        .filter(([key]) => !this.promotedFields.includes(key))
        .sort(([, a], [, b]) => compareField(a, b))
        .map(([key]) => key);
    }
    return [];
  }

  get childrenIds() {

    function getChildrenIds(fields) {
      const ids = Object.values(fields)
        .reduce((acc, field) => {
          if (field.widget === "Nested") {
            const idsOfNestedFields = getChildrenIdsOfNestedFields(field.nestedFieldsStores);
            idsOfNestedFields.forEach(id => {
              if (!acc.has(id)) {
                acc.add(id);
              }
            });
          } else if (field.isLink) {
            const values = field.returnValue;
            Array.isArray(values) && values.forEach(obj => {
              const id = obj && obj[field.mappingValue];
              if (id && !acc.has(id)) {
                acc.add(id);
              }
            });
          }
          return acc;
        }, new Set());
      return Array.from(ids);
    }

    function getChildrenIdsOfNestedFields(fields) {
      const ids = fields.reduce((acc, rowFields) => {
        const ids = getChildrenIds(rowFields);
        ids.forEach(id => {
          if (!acc.has(id)) {
            acc.add(id);
          }
        });
        return acc;
      }, new Set());
      return Array.from(ids);
    }

    if (this.isFetched && !this.fetchError && this.fields) {
      return getChildrenIds(this.fields);
    }
    return [];
  }

  get childrenIdsGroupedByField() {
    if (this.isFetched && !this.fetchError) {
      return getChildrenIdsGroupedByField(Object.values(this.fields));
    }
    return [];
  }

  initializeLabelData(data) {
    const normalizedData = normalizeLabelInstanceData(data);
    this._name = normalizedData.name;
    this.workspace = normalizedData.workspace;
    this.types = normalizedData.types;
    this.primaryType = normalizedData.primaryType;
    this.isLabelFetching = false;
    this.isLabelFetched = true;
    this.fetchLabelError = null;
    this.isLabelNotFound = false;
    this.hasLabelFetchError = false;
  }

  initializeRawData(data) {
    this._rawData = data;
    this.isFetching = false;
  }

  initializeData(transportLayer, rootStore, data, isNew = false) {
    const _initializeFields = _fields => {
      Object.entries(_fields).forEach(([name, field]) => {
        let warning = null;
        if(name === this.labelField) {
          field.globalLabelTooltip = "This field will be publicly accessible for every user. (Even for users without read access)";
          field.globalLabelTooltipIcon = "globe";
        }
        if (!this.fields[name]) {
          if (!field.widget) {
            warning = `no widget defined for field "${name}" of type "${this.primaryType.name}"!`;
            field.widget = "UnsupportedField";
          } else if (!fieldsMapping[field.widget]) {
            warning = `widget "${field.widget}" defined in field "${name}" of type "${this.primaryType.name}" is not supported!`;
            field.widget = "UnsupportedField";
          }
          const fieldMapping = fieldsMapping[field.widget];
          this.fields[name] = new fieldMapping.Store(field, fieldMapping.options, this, transportLayer, rootStore);
        }
        const store = this.fields[name];
        store.updateValue(field.value);
        store.setAlternatives(field.alternatives);
        if (warning) {
          store.setWarning(warning);
        }
      });
    };

    this._rawData = null;
    const normalizedData = normalizeInstanceData(data);
    this._name = normalizedData.name;
    this.workspace = normalizedData.workspace;
    this.types = normalizedData.types;
    this.isNew = isNew;
    this.labelField = normalizedData.labelField;
    this.primaryType = normalizedData.primaryType;
    this._promotedFields = normalizedData.promotedFields;
    this.alternatives = normalizedData.alternatives;
    this.metadata = normalizedData.metadata;
    this.permissions = normalizedData.permissions;
    this.incomingLinks = normalizedData.incomingLinks;
    this.possibleIncomingLinks = normalizedData.possibleIncomingLinks;
    _initializeFields(normalizedData.fields);
    this.fetchError = null;
    this.isNotFound = false;
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

  errorLabelInstance(e, isNotFound=false) {
    this.isLabelNotFound = isNotFound;
    this.fetchLabelError = this.buildErrorMessage(e);
    this.hasLabelFetchError = true;
    this.isLabelFetched = false;
    this.isLabelFetching = false;
  }

  errorInstance(e, isNotFound=false) {
    this.isNotFound = isNotFound;
    this.fetchError = this.buildErrorMessage(e);
    this.hasFetchError = true;
    this.isFetched = false;
    this.isFetching = false;
  }
}

export default Instance;