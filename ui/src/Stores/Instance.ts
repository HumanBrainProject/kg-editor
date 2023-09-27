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

import { observable, action, computed, makeObservable } from 'mobx';

import { fieldsMapping } from '../Fields';
import LinkStore from '../Fields/Stores/LinkStore';
import LinksStore from '../Fields/Stores/LinksStore';
import type RootStore from './RootStore';
import type FieldStore from '../Fields/Stores/FieldStore';
import type { FieldStores, NestedInstanceStores } from '../Fields/Stores/FieldStore';
import type NestedFieldStore from '../Fields/Stores/NestedFieldStore';
import type SingleNestedFieldStore from '../Fields/Stores/SingleNestedFieldStore';
import type API from '../Services/API';
import type { APIError } from '../Services/API';
import type {
  Alternative,
  Alternatives,
  Fields,
  IncomingLink,
  InstanceFull,
  InstanceIncomingLink,
  InstanceIncomingLinkFull,
  InstanceRawData,
  Permissions,
  SimpleType,
  SourceType,
  StructureOfField,
  StructureOfIncomingLink,
  StructureOfIncomingLinkByFieldName,
  StructureOfType,
  UUID
} from '../types';

const compareAlternatives = (a: Alternative, b: Alternative) => {
  if (a.selected === b.selected) {
    return 0;
  }
  if (a.selected) {
    return -1;
  }
  return 1;
};

const normalizeAlternative = (
  name: string,
  alternatives?: Alternatives
): Alternative[] =>
  (alternatives && alternatives[name] ? alternatives[name] : [])
    .sort(compareAlternatives)
    .map(
      (alternative: Alternative) =>
        ({
          value: alternative.value === undefined ? null : alternative.value,
          users: alternative.users,
          selected: !!alternative.selected
        } as Alternative)
    );

const normalizeField = (field: StructureOfField) => {
  if (
    field instanceof Object &&
    !Array.isArray(field) &&
    (field.widget === 'Nested' || field.widget === 'SingleNested')
  ) {
    normalizeFields(field.fields);
  }
};

const normalizeFields = (
  fields: Fields,
  alternatives?: Alternatives
) => {
  if (fields instanceof Object && !Array.isArray(fields)) {
    Object.entries(fields).forEach(([name, field]) => {
      normalizeField(field);
      field.alternatives = normalizeAlternative(name, alternatives);
    });
  }
};

const initializeStores = (instance: Instance, fields: Fields, api: API, rootStore: RootStore): FieldStores => {
  const stores = {} as FieldStores;
  Object.entries(fields).forEach(([name, field]) => {
    let warning = null;
    field.isPublic = name === instance.labelField;
    if (field.widget === 'DynamicDropdown' && Array.isArray(field.value) && field.value.length > 30) {
      field.widget = 'DynamicTable';
    }
    //TODO: temporary fix to support invalid array value
    if (
      (field.widget === 'SimpleDropdown' || field.widget === 'SingleNested') && Array.isArray(field.value)) {
      if (field.value.length >= 1) {
        field.value = field.value[0];
      } else {
        field.value = undefined;
      }
      window.console.warn(
        `the field ${field.name} of instance ${instance.id}  is a ${field.widget} which require an object as value but received an array.`,
        field.value
      );
    }
    //TODO: temporary fix to support invalid object value
    if (
      (field.widget === 'DynamicDropdown' ||
        field.widget === 'DynamicTable' ||
        field.widget === 'Nested') &&
      !Array.isArray(field.value) &&
      field.value !== undefined &&
      field.value !== null
    ) {
      window.console.warn(
        `The field ${field.name} of instance ${instance.id} is a ${field.widget} which require an array as value but received an object.`,
        field.value
      );
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
    if (!stores[name]) {
      if (!field.widget) {
        warning = `no widget defined for field "${name}" of type "${instance.primaryType.name}"!`;
        field.widget = 'UnsupportedField';
      } else if (!fieldsMapping[field.widget]) {
        warning = `widget "${field.widget}" defined in field "${name}" of type "${instance.primaryType.name}" is not supported!`;
        field.widget = 'UnsupportedField';
      }
      const fieldMapping = fieldsMapping[field.widget];
      stores[name] =  new fieldMapping.Store(
        field,
        fieldMapping.options,
        instance,
        api,
        rootStore
      ) as FieldStore;
    }
    const store = stores[name];
    store.updateValue(field.value);
    store.setAlternatives(field.alternatives);
    if (warning) {
      store.setWarning(warning);
    }
  });
  return stores;
};

const getChildrenIds = (fields: FieldStores): Set<UUID> => {
  if (!(fields instanceof Object) || Array.isArray(fields)) {
    return new Set();
  }
  return Object.values(fields).reduce((acc, field) => {
    if (field.widget === 'SingleNested') {
      //const singleNestedField = field as fieldsMapping["SingleNested"].Store;
      const singleNestedField = field as SingleNestedFieldStore;
      const idsOfNestedFields = getChildrenIdsOfSingleNestedFields(
        singleNestedField.nestedFieldsStores
      );
      idsOfNestedFields.forEach(id => acc.add(id));
    } else if (field.widget === 'Nested') {
      //const nestedField = field as fieldsMapping["Nested"].Store;
      const nestedField = field as NestedFieldStore;
      const idsOfNestedFields = getChildrenIdsOfNestedFields(
        nestedField.nestedFieldsStores
      );
      idsOfNestedFields.forEach(id => acc.add(id));
    } else if (field instanceof LinksStore) {
      const values = field.returnValue;
      if (Array.isArray(values)) {
        values
          .map(obj => obj?.[field.mappingValue])
          .filter(id => !!id && typeof id === 'string')
          .forEach(id => acc.add(id as UUID));
      }
    } else if (field instanceof LinkStore) {
      const value = field.returnValue;
      const id = !!value && typeof value !== 'string' ? value[field.mappingValue]:undefined;
      if (id && typeof id === 'string') {
        acc.add(id);
      }
    }
    return acc;
  }, new Set<UUID>());
};

const getChildrenIdsOfNestedFields = (fields: NestedInstanceStores[]): Set<UUID> => {
  if (!Array.isArray(fields)) {
    return new Set();
  }
  return fields.reduce((acc, rowFields) => {
    const ids = getChildrenIds(rowFields.stores);
    ids.forEach(id => acc.add(id));
    return acc;
  }, new Set<UUID>());
};

const getChildrenIdsOfSingleNestedFields = (
  fields?: NestedInstanceStores
): Set<UUID> => {
  if (!(fields instanceof Object) || Array.isArray(fields)) {
    return new Set();
  }
  return getChildrenIds(fields.stores);
};

export const compareField = (a: FieldStore, b: FieldStore, ignoreName = false) => {
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

export const normalizeLabelInstance = (data: NormalizedInstance): NormalizedInstance => ({
  id: data.id,
  name: data.name,
  types: Array.isArray(data.types)?data.types:[],
  primaryType: (Array.isArray(data.types) && data.types.length > 0)?data.types[0]:({ name: '', color: '', label: '' } as SimpleType),
  space: data.space??'',
  error: data.error instanceof Error?data.error:undefined,
  fields: {} as Fields,
  promotedFields: [],
  incomingLinks: []
});

interface NonNormalizedIncomingLinksByType {
  color: string;
  label: string;
  nameForReverseLink: string;
  data: IncomingLink[];
  from: number;
  size: number;
  total: number;
}

type NonNormalizedIncomingLinksForField = Record<string,NonNormalizedIncomingLinksByType>; // by typeName

interface NonNormalizedIncomingLinks {
  [fieldName: string]: NonNormalizedIncomingLinksForField;
}


const normalizeIncomingLinksForField = (instanceId: UUID, fieldName: string, typeName: string, type: NonNormalizedIncomingLinksByType): InstanceIncomingLink => ({
  instanceId: instanceId,
  property: fieldName,
  type: {
    name: typeName,
    label: type.label,
    color: type.color
  } as SimpleType,
  instances: type.data,
  from: type.from,
  size: type.size,
  total: type.total,
  isFetching: false,
  fetchError: undefined
});

const normalizeIncomingLinksFieldLabel = (field: NonNormalizedIncomingLinksForField): string => {
  const type = Object.values(field).find(type => !!type.nameForReverseLink);
  return type?type.nameForReverseLink:'';
};

const normalizeIncomingLinks = (instanceId?: UUID, nonNormalizedIncomingLinks?: unknown): InstanceIncomingLinkFull[] => {
  if (!instanceId || !(nonNormalizedIncomingLinks instanceof Object)) {
    return [];
  }
  return Object.entries(nonNormalizedIncomingLinks as NonNormalizedIncomingLinks).map(
    ([fieldName, field]) => ({
      property: fieldName,
      label: normalizeIncomingLinksFieldLabel(field),
      links:  Object.entries(field).map(([typeName, type]) => normalizeIncomingLinksForField(instanceId, fieldName, typeName, type))
    }));
};

const normalizePossibleIncomingLinks = (incomingLinksFromType?: StructureOfIncomingLinkByFieldName): SourceType[]|undefined => {
  if (!incomingLinksFromType) {
    return undefined;
  }

  return (Object.values(incomingLinksFromType)
    .flatMap((link: StructureOfIncomingLink) => link.sourceTypes)
    .reduce((acc, current) => {
      if (
        !acc.some(
          (obj: SourceType) =>
            obj.type.name === current.type.name &&
            JSON.stringify(obj.spaces) === JSON.stringify(current.spaces)
        )
      ) {
        acc.push(current);
      }
      return acc;
    }, [] as SourceType[]));
};

const normalizeInstance = (data: any, typeFromStore?: StructureOfType): NormalizedInstance => {
  const labelInstance = normalizeLabelInstance(data);
  const instance = {
    ...labelInstance,
    fields: {} as Fields,
    name: data.name??undefined,
    labelField: data.labelField??undefined,
    promotedFields: Array.isArray(data?.promotedFields)?data.promotedFields:[],
    permissions: (data?.permissions) instanceof Object ? data.permissions: undefined,
    incomingLinks: normalizeIncomingLinks(labelInstance.id, data?(data as InstanceFull).incomingLinks:[]),
    possibleIncomingLinks: normalizePossibleIncomingLinks(typeFromStore?.incomingLinks)
  } as NormalizedInstance;

  if (data.fields instanceof Object) {
    normalizeFields((data as InstanceFull).fields, data.alternatives);
    instance.fields = data.fields;
  }
  return instance;
};

interface Pagination {
  count: number;
  total: number;
}

const getPagination = (field: FieldStore): Pagination | undefined => {
  if (field instanceof LinksStore && field.lazyShowLinks) {
    const total = field.numberOfValues;
    if (total) {
      return {
        count: field.numberOfVisibleLinks,
        total: total
      } as Pagination;
    }
  }
  return undefined;
};

const showId = (field: FieldStore, id: string) => {
  if (id) {
    if (field instanceof LinksStore && field.lazyShowLinks) {
      return field.isLinkVisible(id);
    }
    return true;
  }
  return false;
};

const getIds = (field: FieldStore) => {
  const values = field.returnValue;
  if (field instanceof LinksStore || field instanceof LinkStore) {
    const mappingValue = field.mappingValue;
    if (Array.isArray(values)) {
      return values
        .filter(obj => obj && obj[mappingValue])
        .map(obj => obj[mappingValue])
        .filter(id => id !== field.instance?.id)
        .filter(id => showId(field, id));
    } else if (
      typeof values === 'object' &&
      values &&
      values[mappingValue] &&
      showId(field, values[mappingValue])
    ) {
      return [values[mappingValue]];
    }
  }
  return [];
};

export interface Group {
  label: string;
  ids: UUID[];
  pagination?: Pagination;
}

const getGroup = (field: FieldStore) => {
  const ids = getIds(field);
  if (ids.length) {
    const group = {
      label: field.label,
      ids: ids,
      pagination: undefined
    } as Group;
    const pagination = getPagination(field);
    if (pagination) {
      group.pagination = pagination;
    }
    return group;
  }
  return null;
};

const getGroupsForFields = (fields: FieldStore[]) => {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.reduce((acc, field) => {
    const groups = getGroupsForField(field);
    acc.push(...groups);
    return acc;
  }, [] as Group[]);
};

const getGroupsForField = (field: FieldStore): Group[] => {
  const groups = [];
  if (field.widget === 'Nested') {
    const nestedGroups = getNestedFields(
      (field as NestedFieldStore).nestedFieldsStores
    );
    groups.push(...nestedGroups);
  } else if (field.widget === 'SingleNested') {
    const nestedGroups = getSingleNestedFields(
      (field as SingleNestedFieldStore).nestedFieldsStores
    );
    groups.push(...nestedGroups);
  } else if (field instanceof LinksStore || field instanceof LinkStore) {
    const group = getGroup(field);
    if (group) {
      groups.push(group);
    }
  }
  return groups;
};

const getSingleNestedFields = (fields?: NestedInstanceStores): Group[] => {
  if (!fields) {
    return [];
  }
  const nestedFields = Object.values(fields.stores);
  return getGroupsForFields(nestedFields);
};

const getNestedFields = (fields: NestedInstanceStores[]): Group[] => {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.reduce((acc, rowFields) => {
    const nestedFields = Object.values(rowFields.stores);
    const groups = getGroupsForFields(nestedFields);
    acc.push(...groups);
    return acc;
  }, [] as Group[]);
};

const getChildrenIdsGroupedByField = (fields: FieldStore[]): Group[] => {
  const list = getGroupsForFields(fields);
  return Object.entries(
    list.reduce((acc, group) => {
      if (!acc[group.label]) {
        acc[group.label] = [];
      }
      acc[group.label].push(...group.ids);
      return acc;
    }, {} as { [key: string]: string[] })
  )
    .map(([label, ids]) => ({ label: label, ids: ids }))
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
};

export interface NormalizedInstance {
  error?: Error;
  id?: UUID;
  name?: string;
  types: StructureOfType[];
  primaryType: SimpleType;
  space: string;
  fields: Fields;
  promotedFields: string[];
  permissions?: Permissions;
  incomingLinks: InstanceIncomingLinkFull[];
  possibleIncomingLinks?: SourceType[];
  labelField?: string;
}

export class Instance {
  id: UUID;
  _name?: string; // name is computed from _name
  types: StructureOfType[] = [];
  isNew = false;
  labelField?: string;
  _promotedFields: string[] = [];  // promotedFields is computed from _promotedFields
  primaryType: SimpleType = { name: '', color: '', label: '', description: '' };
  space = '';
  permissions?: Permissions;
  fields: FieldStores = {};
  incomingLinks: InstanceIncomingLinkFull[] = [];
  possibleIncomingLinks?: SourceType[] = [];
  alternatives: Alternatives = {};

  isLabelFetching = false;
  isLabelFetched = false;
  fetchLabelError = undefined;
  isLabelNotFound = false;
  hasLabelFetchError = false;

  isFetching = false;
  isFetched = false;
  fetchError?: string;
  isNotFound = false;
  hasFetchError = false;

  rawData?: InstanceRawData;
  rawFetchError?: string;
  hasRawFetchError = false;
  isRawFetched = false;
  isRawFetching = false;

  constructor(id: UUID) {
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
  }

  get cloneInitialData(): NormalizedInstance {
    return {
      id: this.id,
      name: this.name,
      types: this.types.map(t => ({ ...t })),
      primaryType: { ...this.primaryType },
      space: this.space,
      fields: Object.entries(this.fields).reduce((acc, [name, field]) => {
        acc[name] = field.cloneWithInitialValue;
        return acc;
      }, {} as Fields),
      labelField: this.labelField,
      promotedFields: [...this._promotedFields],
      permissions: this.permissions?{ ...this.permissions }:undefined,
      incomingLinks: []
    };
  }

  get returnValue(): { [key: string]: any } {
    const obj = {
      '@type': this.types.map(t => t.name)
    } as { [key: string]: any };
    return Object.entries(this.fields).reduce((acc, [name, field]) => {
      if (field.hasChanged) {
        acc[name] = field.returnValue;
      }
      return acc;
    }, obj);
  }

  get payload(): { [key: string]: any } {
    const payload = {
      '@type': this.types.map(t => t.name)
    } as { [key: string]: any };
    return Object.entries(this.fields).reduce((acc, [name, field]) => {
      if (Array.isArray(field.returnValue)) {
        if (field.returnValue.length) {
          acc[name] = field.returnValue;
        }
      } else if (typeof field.returnValue === 'string') {
        if (field.returnValue !== '') {
          acc[name] = field.returnValue;
        }
      } else if (
        field.returnValue !== null &&
        field.returnValue !== undefined
      ) {
        acc[name] = field.returnValue;
      }
      return acc;
    }, payload);
  }

  get hasChanged(): boolean {
    return (
      this.isNew || Object.values(this.fields).some(field => field.hasChanged)
    );
  }

  get hasFieldErrors(): boolean {
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
    const field =
      this.isFetched && this.labelField
        ? this.fields[this.labelField]
        : undefined;
    if (field) {
      return (this.isNew && !field.value)?`<New ${this.primaryType.label}>`:field.value as string;
    }
    return this._name ? this._name : this.id;
  }

  get promotedFields() {
    if (this.isFetched && !this.fetchError) {
      return this._promotedFields
        .map(name => [name, this.fields[name]])
        .sort(([, a], [, b]) => compareField(a as FieldStore, b as FieldStore, true))
        .map(([key]) => key as string);
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

  initializeLabelData(data: any) {
    const normalizedData = normalizeLabelInstance(data);
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

  initializeRawData(data: InstanceRawData, permissions?: Permissions) {
    this.rawData = data;
    this.rawFetchError = undefined;
    this.hasRawFetchError = false;
    this.isRawFetched = true;
    this.isRawFetching = false;
    this.permissions = permissions instanceof Object ? permissions : undefined;
    this.space = data['https://core.kg.ebrains.eu/vocab/meta/space'] as string;
  }

  get typeNames() {
    if (this.isFetched || this.isLabelFetched) {
      return this.types.map(t => t.name).filter(t => t !== null);
    }
    if (
      this.isRawFetched &&
      this.rawData &&
      Array.isArray(this.rawData?.['@type'])
    ) {
      return this.rawData['@type'];
    }
    return [];
  }

  initializeData(api: API, rootStore: RootStore, data: any, isNew = false) {
    const typeFromStore = (Array.isArray(data.types) && data.types.length)? rootStore.typeStore.typesMap.get(data.types[0].name): undefined;
    const normalizedData = normalizeInstance(data, typeFromStore);
    this._name = normalizedData.name;
    this.space = normalizedData.space;
    this.types = normalizedData.types;
    this.isNew = isNew;
    this.labelField = normalizedData.labelField;
    this.primaryType = normalizedData.primaryType;
    this._promotedFields = normalizedData.promotedFields;
    this.permissions = normalizedData.permissions;
    this.incomingLinks = normalizedData.incomingLinks;
    this.possibleIncomingLinks = normalizedData.possibleIncomingLinks;
    this.fields = initializeStores(this, normalizedData.fields, api, rootStore);
    this.fetchError = undefined;
    this.isNotFound = false;
    this.hasFetchError = false;
    this.isFetching = false;
    this.isFetched = true;
  }

  buildErrorMessage(e: APIError) {
    const message = e.message ? e.message : e;
    const errorMessage =
      e.response && e.response.status !== 500 ? e.response.data : '';
    if (e.response && e.response.status === 404) {
      return `The instance "${this.id}" can not be found - it either could have been removed or it is not accessible by your user account.`;
    }
    return `Error while retrieving instance "${this.id}" (${message}) ${errorMessage}`;
  }

  buildErrorMessageFromString(message: string) {
    return `Error while retrieving instance "${this.id}" (${message})}`;
  }

  errorLabelInstance(e: APIError | string, isNotFound = false) {
    this.isLabelNotFound = isNotFound;
    this.fetchError =
      typeof e === 'string'
        ? this.buildErrorMessageFromString(e)
        : this.buildErrorMessage(e);
    this.hasLabelFetchError = true;
    this.isLabelFetched = false;
    this.isLabelFetching = false;
  }

  errorInstance(e: APIError | string, isNotFound = false) {
    this.isNotFound = isNotFound;
    this.fetchError =
      typeof e === 'string'
        ? this.buildErrorMessageFromString(e)
        : this.buildErrorMessage(e);
    this.hasFetchError = true;
    this.isFetched = false;
    this.isFetching = false;
  }

  errorRawInstance(e: APIError, isNotFound = false) {
    this.rawData = undefined;
    this.isNotFound = isNotFound;
    this.rawFetchError = this.buildErrorMessage(e);
    this.hasRawFetchError = true;
    this.isRawFetched = false;
    this.isRawFetching = false;
  }
}

export default Instance;
