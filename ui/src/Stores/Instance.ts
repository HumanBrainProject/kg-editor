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
import { Alternative, Alternatives, Permissions, StructureOfField, StructureOfType, UUID } from "../types";
import API, { APIError } from "../Services/API";
import RootStore from "./RootStore";
import FieldStore from "../Fields/Stores/FieldStore";
import NestedFieldStore from "../Fields/Stores/NestedFieldStore";
import SingleNestedFieldStore from "../Fields/Stores/SingleNestedFieldStore";

const compareAlternatives = (a: Alternative, b: Alternative) => {
  if (a.selected === b.selected) {
    return 0;
  }
  if (a.selected) {
    return -1;
  }
  return 1;
};

const normalizeAlternative = (name: string, field: StructureOfField, alternatives?: Alternatives) => {
  field.alternatives = ((alternatives && alternatives[name])?alternatives[name]:[])
    .sort(compareAlternatives)
    .map((alternative: Alternative) => ({
      value: alternative.value === undefined ? null : alternative.value,
      users: alternative.users,
      selected: !!alternative.selected
    }));
};

const normalizeField = (field: StructureOfField, instanceId: UUID) => {
  if (field instanceof Object && !Array.isArray(field) && (field.widget === "Nested" || field.widget === "SingleNested")) {
    normalizeFields(field.fields, instanceId);
  }
};

const normalizeFields = (fields: Map<string, StructureOfField>, instanceId: UUID, alternatives?: Alternatives) => {
  if (fields instanceof Object && !Array.isArray(fields)) {
    Object.entries(fields).forEach(([name, field]) => {
      normalizeField(field, instanceId);
      normalizeAlternative(name, field, alternatives);
    });
  }
};

const getChildrenIds = (fields: InstanceFields): Set<UUID> => {
  if (!(fields instanceof Object) || Array.isArray(fields)) {
    return new Set();
  }
  return Object.values(fields).reduce((acc, field) => {
    if (field.widget === "SingleNested") {
      //const singleNestedField = field as fieldsMapping["SingleNested"].Store;
      const singleNestedField = field as SingleNestedFieldStore;
      const idsOfNestedFields = getChildrenIdsOfSingleNestedFields(singleNestedField.nestedFieldsStores);
      idsOfNestedFields.forEach(id => acc.add(id));
    } else if (field.widget === "Nested") {
      //const nestedField = field as fieldsMapping["Nested"].Store;
      const nestedField = field as NestedFieldStore;
      const idsOfNestedFields = getChildrenIdsOfNestedFields(nestedField.nestedFieldsStores);
      idsOfNestedFields.forEach(id => acc.add(id));
    } else if (field.isLink) {
      const values = field.returnValue;
      if (Array.isArray(values)) {
        values.map(obj => obj && obj[field.mappingValue]).filter(id => !!id).forEach(id => acc.add(id));
      } else if (values instanceof Object && !Array.isArray(values)) { // field.widget === "SimpleDropdown"
        const id = values[field.mappingValue];
        if (id) {
          acc.add(id);
        }
      }
    }
    return acc;
  }, new Set<UUID>());
};

const getChildrenIdsOfNestedFields = (fields: InstanceFields): Set<UUID> => {
  if (!Array.isArray(fields)) {
    return new Set();
  }
  return fields.reduce((acc, rowFields) => {
    const ids = getChildrenIds(rowFields.stores);
    ids.forEach(id => acc.add(id));
    return acc;
  }, new Set<UUID>());
};

const getChildrenIdsOfSingleNestedFields = (fields:InstanceFields): Set<UUID> => {
  if (!(fields instanceof Object) || Array.isArray(fields)) {
    return new Set();
  }
  return getChildrenIds(fields.stores);
};

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

export const normalizeInstanceData = (data, typeFromStore: StructureOfType) => {

  const instance = {
    ...normalizeLabelInstanceData(data),
    fields: {},
    labelField: null,
    promotedFields: [],
    alternatives: {},
    metadata: {},
    permissions: {},
    incomingLinks: [],
    possibleIncomingLinks: []
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
      const links = Object.entries(field).map(([typeName, type]) => {
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
          fetchError: null
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
  if(typeFromStore?.incomingLinks) {
    instance.possibleIncomingLinks = Object.values(typeFromStore.incomingLinks)
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
  if (data.fields instanceof Object) {
    normalizeFields(data.fields, instance.id, data.alternatives);
    instance.fields = data.fields;
  }
  if (data.metadata instanceof Object) {
    const metadata = data.metadata;
    instance.metadata = Object.keys(metadata).map(key => {
      if (key === "lastUpdateAt" || key === "createdAt") {
        const d = new Date(metadata[key].value);
        metadata[key].value = d.toLocaleString();
      }
      return metadata[key];
    });
  }
  if (data.permissions instanceof Object) {
    instance.permissions = data.permissions;
  }
  return instance;
};

const getPagination = field => {
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
};

const showId = (field, id: string) => {
  if (id) {
    if (field.lazyShowLinks) {
      return field.isLinkVisible(id);
    }
    return true;
  }
  return false;
};

const getIds = field => {
  const values = field.returnValue;
  const mappingValue = field.mappingValue;
  if(Array.isArray(values)) {
    return values.filter(obj => obj && obj[mappingValue]).map(obj => obj[mappingValue]).filter(id => id !== field.instance.id).filter(id => showId(field, id));
  } else if (typeof values === "object" && values && values[mappingValue] && showId(field, values[mappingValue])) { 
    return [values[mappingValue]];
  }
  return [];
};

const getGroup = field => {
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
};

const getGroupsForFields = fields => {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.reduce((acc, field) => {
    const groups = getGroupsForField(field);
    acc.push(...groups);
    return acc;
  }, [])
};

const getGroupsForField = field => {
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
};

const getSingleNestedFields = fields => {
  if (!fields) {
    return [];
  }
  const nestedFields = Object.values(fields.stores);
  return getGroupsForFields(nestedFields);
};

const getNestedFields = fields => {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.reduce((acc, rowFields) => {
    const nestedFields = Object.values(rowFields.stores);
    const groups = getGroupsForFields(nestedFields);
    acc.push(...groups);
    return acc;
  }, []);
};

const getUniqueGroups = fields => {
  const list = getGroupsForFields(fields);
  return Object.entries(list.reduce((acc, group) => {
    if (!acc[group.label]) {
      acc[group.label] = [];
    }
    acc[group.label].push(...group.ids);
    return acc;
  }, {}))
    .map(([label, ids]) => ({label: label, ids: ids}))
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
};

const getChildrenIdsGroupedByField = fields => getUniqueGroups(fields);

interface InstanceFields {
  [name: string]: FieldStore;
}

export class Instance {
  id?: UUID;
  _name = null;
  types: StructureOfType[] = [];
  isNew = false;
  labelField = null;
  _promotedFields = [];
  primaryType = { name: "", color: "", label: "", description: "" };
  space = "";
  metadata = {};
  permissions?: Permissions;
  fields: InstanceFields = {};
  incomingLinks=[];
  possibleIncomingLinks=[];
  alternatives = {};

  isLabelFetching = false;
  isLabelFetched = false;
  fetchLabelError = undefined;
  isLabelNotFound = false;
  hasLabelFetchError = false;

  isFetching = false;
  isFetched = false;
  fetchError?:string;
  isNotFound = false
  hasFetchError = false;

  rawData = null;
  rawFetchError?: string;
  hasRawFetchError = false;
  isRawFetched = false;
  isRawFetching = false;

  api: API;

  constructor(id: UUID, api: API) {
    makeObservable(this, {
      id: observable,
      alternatives: observable,
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
      sortedFieldNames: computed,
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
      isRawFetching: observable,
      typeNames: computed
    });

    this.id = id;
    this.api = api;
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
    const field = (this.isFetched && this.labelField)?this.fields[this.labelField]:undefined;
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

  get sortedFieldNames() {
    if (this.isFetched && !this.fetchError) {
      return Object.entries(this.fields)
        .sort(([, a], [, b]) => compareField(a, b))
        .map(([key]) => key);
    }
    return [];
  }

  get childrenIds() {
    if (this.isFetched && !this.fetchError && this.fields) {
      return Array.from(getChildrenIds(this.fields));
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
    this.space = normalizedData.space;
    this.types = normalizedData.types;
    this.primaryType = normalizedData.primaryType;
    this.isLabelFetching = false;
    this.isLabelFetched = true;
    this.fetchLabelError = undefined;
    this.isLabelNotFound = false;
    this.hasLabelFetchError = false;
  }


  initializeRawData(data, permissions: Permissions) {
    this.rawData = data;
    this.rawFetchError = undefined;
    this.hasRawFetchError = false;
    this.isRawFetched = true;
    this.isRawFetching = false;
    this.permissions = (permissions instanceof Object)?permissions:{};
    this.space = data["https://core.kg.ebrains.eu/vocab/meta/space"];
  }

  get typeNames() {
    if (this.isFetched || this.isLabelFetched) {
      return this.types
        .map(t => t.name)
        .filter(t => t !== null);
    }
    if (this.isRawFetched && Array.isArray(this.rawData?.["@type"])) {
      return this.rawData["@type"];
    }
    return [];
  }

  initializeData(api: API, rootStore: RootStore, data, isNew = false) {
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
          this.fields[name] = new fieldMapping.Store(field, fieldMapping.options, this, api, rootStore) as FieldStore;
        }
        const store = this.fields[name];
        store.updateValue(field.value);
        store.setAlternatives(field.alternatives);
        if (warning) {
          store.setWarning(warning);
        }
      });
    };

    const typeFromStore = (Array.isArray(data.types) && data.types.length) ? rootStore.typeStore.typesMap.get(data.types[0].name):undefined; 

    const normalizedData = normalizeInstanceData(data, typeFromStore);
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
    this.fetchError = undefined;
    this.isNotFound = false;
    this.hasFetchError = false;
    this.isFetching = false;
    this.isFetched = true;
  }

  buildErrorMessage(e: APIError) {
    const message = e.message ? e.message : e;
    const errorMessage = e.response && e.response.status !== 500 ? e.response.data : "";
    if (e.response && e.response.status === 404) {
      return `The instance "${this.id}" can not be found - it either could have been removed or it is not accessible by your user account.`;
    }
    return `Error while retrieving instance "${this.id}" (${message}) ${errorMessage}`;
  }

  buildErrorMessageFromString(message: string) {
    return `Error while retrieving instance "${this.id}" (${message})}`;
  }

  errorLabelInstance(e: APIError|string, isNotFound=false) {
    this.isLabelNotFound = isNotFound;
    this.fetchError = typeof e === "string" ? this.buildErrorMessageFromString(e):this.buildErrorMessage(e);
    this.hasLabelFetchError = true;
    this.isLabelFetched = false;
    this.isLabelFetching = false;
  }

  errorInstance(e: APIError|string, isNotFound=false) {
    this.isNotFound = isNotFound;
    this.fetchError = typeof e === "string" ? this.buildErrorMessageFromString(e):this.buildErrorMessage(e);
    this.hasFetchError = true;
    this.isFetched = false;
    this.isFetching = false;
  }

  errorRawInstance(e: APIError, isNotFound=false) {
    this.rawData = null;
    this.isNotFound = isNotFound;
    this.rawFetchError = this.buildErrorMessage(e);
    this.hasRawFetchError = true;
    this.isRawFetched = false;
    this.isRawFetching = false;
  }
}

export default Instance;