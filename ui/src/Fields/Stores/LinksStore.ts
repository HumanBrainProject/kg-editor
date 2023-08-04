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
import { observable, action, runInAction, computed, toJS, makeObservable } from 'mobx';

import FieldStore from './FieldStore';
import type { WidgetOptions } from '..';
import type API from '../../Services/API';
import type Instance from '../../Stores/Instance';
import type RootStore from '../../Stores/RootStore';
import type { FieldStoreDefinition, SimpleType, Suggestion } from '../../types';

const defaultNumberOfVisibleLinks = 10;

interface Messages {
  required?: string;
  numberOfItems?: string;
}

export interface Value {
  [key:string]: unknown;
}


class LinksStore extends FieldStore {
  value: Value[] = [];
  options: Suggestion[] = [];
  optionsResult: Suggestion[] = [];
  allowCustomValues = true;
  returnAsNull = false;
  optionsSearchActive = false;
  optionsSearchTerm = '';
  optionsPreviousSearchTerm?: string;
  optionsFrom = 0;
  optionsPageSize = 50;
  optionsSize = 0;
  optionsTotal = Infinity;
  fetchingCounter = 0;
  lazyShowLinks = false;
  visibleLinks = new Set();
  initialValue: Value[] = [];
  isLink = true; //TODO: could be removed after typscript complete refactoring
  targetTypes: SimpleType[] = [];
  targetType?: SimpleType;
  mappingValue = '@id';
  minItems?: number;
  maxItems?: number;
  sourceType = null;

  appStore = null;

  constructor(definition: FieldStoreDefinition, options: WidgetOptions, instance: Instance, api: API, rootStore: RootStore) {
    super(definition, options, instance, api, rootStore);
    this.minItems = definition.minItems;
    this.maxItems = definition.maxItems;
    this.targetTypes = Array.isArray(definition.targetTypes)?definition.targetTypes:[];
    this.targetType = this.targetTypes.length?this.targetTypes[0]:undefined;
    if (definition.defaultTargetType) {
      const defaultTargetType = this.targetTypes.find(type => type.name === definition.defaultTargetType);
      if (defaultTargetType) {
        this.targetType = defaultTargetType;
      }
    }
    this.sourceType = options && options.sourceType;
    if (definition.allowCustomValues !== undefined) {
      this.allowCustomValues = !!definition.allowCustomValues;
    }
    if (definition.lazyShowLinks !== undefined) {
      this.lazyShowLinks = !!definition.lazyShowLinks;
    } else if (options && options.lazyShowLinks !== undefined) {
      this.lazyShowLinks = !!options.lazyShowLinks;
    }

    makeObservable(this, {
      value: observable,
      options: observable,
      allowCustomValues: observable,
      returnAsNull: observable,
      optionsSearchActive: observable,
      optionsSearchTerm: observable,
      optionsPreviousSearchTerm: observable,
      optionsFrom: observable,
      optionsPageSize: observable,
      optionsTotal: observable,
      optionsSize: observable,
      fetchingOptions: computed,
      fetchingCounter: observable,
      lazyShowLinks: observable,
      visibleLinks: observable,
      initialValue: observable,
      minItems: observable,
      maxItems: observable,
      targetType: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      shouldCheckValidation: computed,
      requiredValidationWarning: computed,
      validationWarnings: computed,
      numberOfItemsWarning: computed,
      numberOfValues: computed,
      hasMoreOptions: computed,
      hasValidationWarnings: computed,
      insertValue: action,
      deleteValue: action,
      addValue: action,
      setValues: action,
      moveValueAfter: action,
      removeValue: action,
      removeAllValues: action,
      removeLastValue: action,
      links: computed,
      showLink: action,
      numberOfVisibleLinks: computed,
      performSearchOptions: action,
      searchOptions: action,
      resetOptionsSearch: action,
      loadMoreOptions: action,
      setTargetType: action
    });

  }

  get definition() {
    return {
      ...super.definition,
      allowCustomValues: this.allowCustomValues,
      lazyShowLinks: this.lazyShowLinks
    };
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: toJS(this.initialValue)
    };
  }

  get returnValue(): string | null | undefined | Value[] { //NOSONAR, by design spec it can return that specific string constant or a value
    if (!this.value.length && this.returnAsNull) {
      return 'https://core.kg.ebrains.eu/vocab/resetValue';
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    return this.value.length === 0;
  }

  get numberOfItemsWarning() {
    if(!this.minItems && !this.maxItems) {
      return false;
    }
    return this.minItems || this.maxItems;
  }

  get validationWarnings() {
    const messages: Messages = {};
    if (this.shouldCheckValidation) {
      if(this.requiredValidationWarning) {
        messages.required = 'This field is marked as required.';
      }
      if(this.numberOfItemsWarning) {
        if(this.minItems && this.maxItems) {
          if(this.value.length < this.minItems || this.value.length > this.maxItems) {
            messages.numberOfItems = `Number of values should be between ${this.minItems} and ${this.maxItems}`;
          }
        } else if(this.minItems && this.value.length < this.minItems) {
          messages.numberOfItems = `Number of values should be bigger than ${this.minItems}`;
        } else if(this.maxItems && this.value.length > this.maxItems) {
          messages.numberOfItems = `Number of values should be smaller than ${this.maxItems}`;
        }
      }
    }
    return messages;
  }

  get hasValidationWarnings() {
    return Object.keys(this.validationWarnings).length > 0;
  }

  getValues(value: Value | Value[] | null | undefined) {
    if(Array.isArray(value)) {
      return value;
    }
    if(value !== null && value !== undefined && typeof value === 'object') {
      return [value];
    }
    return [];
  }

  updateValue(value: Value | Value[] | null | undefined) {
    this.returnAsNull = false;
    const values = this.getValues(value);
    this.initialValue = [...values];
    this.value = values;
    if (this.lazyShowLinks) {
      this.visibleLinks.clear();
    }
    values.forEach((val, index) => {
      if (this.lazyShowLinks && index < defaultNumberOfVisibleLinks) {
        if (val[this.mappingValue]) {
          this.visibleLinks.add(val[this.mappingValue]);
        }
      }
    });
  }

  reset() {
    this.returnAsNull = false;
    this.value = [...this.initialValue];
  }

  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val[this.mappingValue] !== this.initialValue[index][this.mappingValue]));
  }

  get shouldCheckValidation() {
    return !!this.initialValue.length || this.hasChanged;
  }

  get numberOfValues() {
    return this.value.length;
  }

  get hasMoreOptions() {
    return !this.fetchingOptions && this.options.length < this.optionsTotal;
  }

  insertValue(value: Value, index?: number) {
    if(value && this.value.length !== undefined && this.value.indexOf(value) === -1){
      if(index !== undefined && index !== -1){
        this.value.splice(index, 0, value);
      } else {
        this.value.push(value);
      }
    }
  }

  deleteValue(value: Value) {
    if(this.value.length !== undefined){
      this.value = this.value.filter(val => val !== value);
    }
  }

  addValue(value: Value) {
    if(!this.value.some(v => v[this.mappingValue] === value[this.mappingValue])) {
      this.insertValue(value);
      if (this.lazyShowLinks) {
        const values = Array.isArray(value)?value:[value];
        values.forEach(v => this.visibleLinks.add(v[this.mappingValue]));
      }
      this.resetOptionsSearch();
    }
  }

  setValues(values: Value[] | null | undefined) {
    if (values !== null && values !== undefined) {
      if (values.length  || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = values;
        if (this.lazyShowLinks) {
          this.visibleLinks.clear();
          for (let i=0; i<defaultNumberOfVisibleLinks && i<values.length; i++) {
            this.visibleLinks.add(values[i][this.mappingValue]);
          }
        }
      }
    } else  {
      this.returnAsNull = true;
      this.value = [];
      if (this.lazyShowLinks) {
        this.visibleLinks.clear();
      }
    }
    this.resetOptionsSearch();
  }

  moveValueAfter(value: Value, afterValue: Value) {
    if(value) {
      const index = this.value.indexOf(afterValue);
      this.deleteValue(value);
      this.insertValue(value, index);
      this.resetOptionsSearch();
    }
  }

  removeValue(value: Value) {
    this.visibleLinks.delete(value[this.mappingValue]);
    this.deleteValue(value);
    this.resetOptionsSearch();
  }

  removeAllValues() {
    this.setValues(null);
  }

  removeLastValue() {
    if (this.value.length) {
      this.deleteValue(this.value[this.value.length-1]);
      this.resetOptionsSearch();
    }
  }

  get links() { // be aware that it may contains null values and null value are needed!
    return this.value.map(value => value && value[this.mappingValue]) as  (string|null)[];
  }

  showLink(id: string) {
    this.visibleLinks.add(id);
  }

  get numberOfVisibleLinks() {
    return this.visibleLinks.size;
  }

  get fetchingOptions() {
    return this.fetchingCounter > 0;
  }

  isLinkVisible = (id: string) => this.visibleLinks.has(id);

  triggerSearchOption(append: boolean) {
    if (!this.optionsSearchActive) {
      return;
    }
    if (this.optionsSearchTerm !== this.optionsPreviousSearchTerm) {
      append = false;
    }
    const from = append?this.optionsSize:0;
    if (this.optionsSearchTerm === this.optionsPreviousSearchTerm && from === this.optionsFrom) {
      return;
    }
    this.performSearchOptions(from);
  }

  async performSearchOptions(from: number) {
    this.fetchingCounter++;
    if (from === 0) {
      this.options = [];
      this.optionsSize = 0;
    }
    this.optionsFrom = from;
    this.optionsPreviousSearchTerm = this.optionsSearchTerm;
    const payload = this.instance.payload;
    payload['@type'] = this.instance.types.map(t => t.name);
    try{
      const { data: { suggestions: { data: values, total }, types }}  = await this.api.getSuggestions(this.instance.id, this.fullyQualifiedName, this.sourceType??undefined, this.targetType?.name??undefined, this.optionsFrom, this.optionsPageSize, this.optionsSearchTerm, payload);
      const newOptions = Array.isArray(values)?values:[];
      runInAction(()=>{
        if (this.optionsSearchActive) {
          const optionsResult = from === 0?newOptions:[...this.optionsResult, ...newOptions];
          const newValues: Suggestion[] = [];
          this.allowCustomValues && Object.values(types).forEach(type => {
            type.space.forEach(spaceId => {
              const space = this.rootStore.userProfileStore.getSpaceInfo(spaceId);
              const isExternal = spaceId !== this.rootStore.appStore.currentSpace?.id;
              if (!isExternal || space.permissions.canCreate) {
                newValues.push({
                  id: `${spaceId}-${type.name}`,
                  type: type as SimpleType,
                  space: spaceId,
                  isExternal: isExternal,
                  isNew: true
                } as Suggestion);
              }
            });
          });
          newValues.sort((a, b) => {
            if (!a.isExternal && b.isExternal) {
              return -1;
            }
            if (a.isExternal && !b.isExternal) {
              return 1;
            }
            return a.type.name.localeCompare(b.type.name);
          });
          this.optionsResult = optionsResult;
          this.options = [...newValues, ...optionsResult];
          this.optionsSize = optionsResult.length;
          this.optionsTotal = total;
        }
        this.fetchingCounter--;
      });
    } catch(e) {
      runInAction(()=>{
        this.optionsResult = [];
        this.options = [];
        this.optionsSize = 0;
        this.optionsTotal = 0;
        this.fetchingCounter--;
      });
    }
  }

  _debouncedSearchOptions = debounce(append=>{this.triggerSearchOption(append);}, 250);

  searchOptions(searchTerm: string) {
    this.optionsSearchActive = true;
    this.optionsSearchTerm = searchTerm;
    this._debouncedSearchOptions(false);
  }

  resetOptionsSearch() {
    this.optionsSearchActive = false;
    this.optionsSearchTerm = '';
    this.optionsPreviousSearchTerm = undefined;
    this.optionsFrom = 0;
    this.optionsTotal = Infinity;
    this.options = [];
  }

  loadMoreOptions() {
    if(this.hasMoreOptions){
      this._debouncedSearchOptions(true);
    }
  }

  setTargetType(type: SimpleType) {
    this.targetType = type;
    this.resetOptionsSearch();
  }
}

export default LinksStore;
