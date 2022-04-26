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
    space: "",
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
  if (data.space) {
    instance.space = data.space;
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
        value: alternative.value === undefined ? null : alternative.value,
        users: alternative.users,
        selected: !!alternative.selected
      }));
  };

  const normalizeField = (field, instanceId) => {
    if ((field.widget === "Nested" || field.widget === "SingleNested") && typeof field.fields === "object") {
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
  if (data.space) {
    instance.space = data.space;
  }
  if (data.name) {
    instance.name = data.name;
  }
  if (data.labelField) {
    instance.labelField = data.labelField;
  }
  if(data.incomingLinks) {
    const incomingLinks = Object.entries(data.incomingLinks).map(([property, field])=> {
      let label = "";
      let links = Object.entries(field).map(([typeName, type]) => {
        label = type.nameForReverseLink;
        return {
          instanceId: instance.id,
          property: property,
          type: {
            name: typeName,
            label: type.label,
            color: type.color
          },
          instances: type.data,
          from: type.from,
          size: type.size,
          total: type.total,
          isFetching: false,
          fetchError: null,
        };
      });
      return {
        property: property,
        label: label,
        links: links
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
      if (key === "lastUpdateAt" || key === "createdAt") {
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
    if(Array.isArray(values)) {
      return values.filter(obj => obj && obj[mappingValue]).map(obj => obj[mappingValue]).filter(id => showId(field, id));
    } else if (typeof values === "object" && values && values[mappingValue] && showId(field, values[mappingValue])) { 
      return [values[mappingValue]];
    }
    return [];
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
    } else if (field.widget === "SingleNested") {
      const nestedGroups = getSingleNestedFields(field.nestedFieldsStores);
      groups.push(...nestedGroups);
    } else if (field.isLink) {
      const group = getGroup(field);
      if (group) {
        groups.push(group);
      }
    }
    return groups;
  }

  function getSingleNestedFields(fields) {
    if (!fields) {
      return [];
    }
    return Object.values(fields.stores).reduce((acc, field) => {
      const groups = getGroups(field);
      acc.push(...groups);
      return acc;
    }, [])
  }

  function getNestedFields(fields) {
    return fields.reduce((acc, rowFields) => {
      acc.push(...Object.values(rowFields.stores).reduce((acc2, field) => {
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
  _initialJsonData = null;
  _name = null;
  types = [];
  isNew = false;
  labelField = null;
  _promotedFields = [];
  primaryType = { name: "", color: "", label: "" };
  space = "";
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

  rawData = null;
  rawFetchError = null;
  hasRawFetchError = false;
  isRawFetched = false;
  isRawFetching = false;

  constructor(id, transportLayer) {
    makeObservable(this, {
      id: observable,
      _name: observable,
      types: observable,
      isNew: observable,
      labelField: observable,
      _promotedFields: observable,
      primaryType: observable,
      space: observable,
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
      initializeRawData: action,
      errorLabelInstance: action,
      errorInstance: action,
      errorRawInstance: action,
      rawFetchError: observable,
      hasRawFetchError: observable,
      isRawFetched: observable,
      isRawFetching: observable
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
      space: this.space,
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
      if (Array.isArray(field.returnValue)) {
        if (field.returnValue.length) {
          acc[name] = field.returnValue;
        } 
      } else if (typeof field.returnValue === "string") {
          if (field.returnValue !== "") {
            acc[name] = field.returnValue;
          }
      } else if (field.returnValue !== null && field.returnValue !== undefined) {
        acc[name] = field.returnValue;
      }
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
          if (field.widget === "SingleNested") {
            const idsOfNestedFields = getChildrenIdsOfSingleNestedFields(field.nestedFieldsStores);
            idsOfNestedFields.forEach(id => {
              if (!acc.has(id)) {
                acc.add(id);
              }
            });
          } else if (field.widget === "Nested") {
            const idsOfNestedFields = getChildrenIdsOfNestedFields(field.nestedFieldsStores);
            idsOfNestedFields.forEach(id => {
              if (!acc.has(id)) {
                acc.add(id);
              }
            });
          } else if (field.isLink) {
            const values = field.returnValue;
            if (Array.isArray(values)) {
              values.forEach(obj => {
                const id = obj && obj[field.mappingValue];
                if (id && !acc.has(id)) {
                  acc.add(id);
                }
              });
            } else if (typeof values === "object" && values) { // field.widget === "SimpleDropdown"
              const id = values && values[field.mappingValue];
              if (id && !acc.has(id)) {
                acc.add(id);
              }
            }
          }
          return acc;
        }, new Set());
      return Array.from(ids);
    }

    function getChildrenIdsOfNestedFields(fields) {
      const ids = fields.reduce((acc, rowFields) => {
        const ids = getChildrenIds(rowFields.stores);
        ids.forEach(id => {
          if (!acc.has(id)) {
            acc.add(id);
          }
        });
        return acc;
      }, new Set());
      return Array.from(ids);
    }

    function getChildrenIdsOfSingleNestedFields(fields) {
      if (!fields) {
        return [];
      }
      const ids = new Set();
      const childrenIds = getChildrenIds(fields.stores);
      childrenIds.forEach(id => {
        if (!ids.has(id)) {
          ids.add(id);
        }
      });
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

  initializeJsonData(data) {
    this._initialJsonData = data;
    this.permissions = data.permissions;
    this.isFetching = false;
  }

  initializeLabelData(data) {
    const normalizedData = normalizeLabelInstanceData(data);
    this._name = normalizedData.name;
    this.space = normalizedData.space;
    this.types = normalizedData.types;
    this.primaryType = normalizedData.primaryType;
    this.isLabelFetching = false;
    this.isLabelFetched = true;
    this.fetchLabelError = null;
    this.isLabelNotFound = false;
    this.hasLabelFetchError = false;
  }


  initializeRawData(data, permissions) {
    this.rawData = data;
    this.rawFetchError = null;
    this.hasRawFetchError = false;
    this.isRawFetched = true;
    this.isRawFetching = false;
    if (typeof permissions === "object") {
      this.permissions = permissions;
    }
  }

  initializeData(transportLayer, rootStore, data, isNew = false) {
    const _initializeFields = _fields => {
      Object.entries(_fields).forEach(([name, field]) => {
        let warning = null;
        field.isPublic = name === this.labelField;
        if (field.widget === "DynamicDropdown" && Array.isArray(field.value) && field.value.length > 30) {
          field.widget = "DynamicTable";
        }
        //TODO: temporary fix to support invalid array value
        if ((field.widget === "SimpleDropdown" || field.widget === "SingleNested") && Array.isArray(field.value)) {
          if (field.value.length >= 1) {
            field.value = field.value[0];
          } else {
            delete field.value;
          }
          window.console.warn(`the field ${field.name} of instance ${this.id}  is a ${field.widget} which require an object as value but received an array.`, field.value);
        }
        //TODO: temporary fix to support invalid object value
        if ((field.widget === "DynamicDropdown" || field.widget === "DynamicTable" || field.widget === "Nested") && !Array.isArray(field.value) && field.value !== undefined && field.value !== null ) {
            window.console.warn(`The field ${field.name} of instance ${this.id} is a ${field.widget} which require an array as value but received an object.`, field.value);
            field.value = [field.value];
        }
        // TO TEST regexRules RULES
        // if ([
        //   "https://openminds.ebrains.eu/vocab/IRI",
        //   "https://openminds.ebrains.eu/vocab/keyword"
        // ].includes(field.fullyQualifiedName)) {
        //   field.validation = [
        //     {
        //       regex: "(https?|ftp|file):\\/\\/[\\-A-Za-z0-9+&@#\\/%?=~_|!:,.;]*[\\-A-Za-z0-9+&@#\\/%=~_|]",
        //       errorMessage: "This is not a valid IRI"
        //     }
        //   ]
        // }
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

    this._initialJsonData = null;
    const normalizedData = normalizeInstanceData(data);
    this._name = normalizedData.name;
    this.space = normalizedData.space;
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

  errorRawInstance(e, isNotFound=false) {
    this.rawData = null;
    this.isNotFound = isNotFound;
    this.rawFetchError = this.buildErrorMessage(e);
    this.hasRawFetchError = true;
    this.isRawFetched = false;
    this.isRawFetching = false;
  }
}

export default Instance;