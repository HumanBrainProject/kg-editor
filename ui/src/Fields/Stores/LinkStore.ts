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
import type { Value } from './LinksStore';
import type { WidgetOptions } from '..';
import type API from '../../Services/API';
import type Instance from '../../Stores/Instance';
import type RootStore from '../../Stores/RootStore';
import type { FieldStoreDefinition, SimpleType, Space, Suggestion } from '../../types';


interface Messages {
  required?: string;
}

export interface Option {
  id: string;
  type: SimpleType;
  space: Space;
  isExternal: boolean;
  isNew: boolean;
}

class LinkStore extends FieldStore {
  value: Value | null | undefined;
  initialValue?: Value | null;
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
  targetTypes: SimpleType[] = [];
  targetType?: SimpleType;
  mappingValue = '@id';
  sourceType = null;

  appStore = null;

  constructor(definition: FieldStoreDefinition, options: WidgetOptions, instance: Instance, api: API, rootStore: RootStore) {
    super(definition, options, instance, api, rootStore);
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

    makeObservable(this, {
      value: observable,
      initialValue: observable,
      allowCustomValues: observable,
      returnAsNull: observable,
      fetchingCounter: observable,
      targetType: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      shouldCheckValidation: computed,
      requiredValidationWarning: computed,
      hasValidationWarnings: computed,
      validationWarnings: computed,
      deleteValue: action,
      removeValue: action,
      addValue: action,
      setTargetType: action,
      options: observable,
      optionsSearchActive: observable,
      optionsSearchTerm: observable,
      optionsPreviousSearchTerm: observable,
      optionsFrom: observable,
      optionsPageSize: observable,
      optionsTotal: observable,
      optionsSize: observable,
      performSearchOptions: action,
      searchOptions: action,
      resetOptionsSearch: action,
      loadMoreOptions: action,
      fetchingOptions: computed,
      hasMoreOptions: computed
    });

  }

  get definition() {
    return {
      ...super.definition,
      allowCustomValues: this.allowCustomValues
    };
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: toJS(this.initialValue)
    };
  }

  get returnValue() { //NOSONAR, by design spec it can return that specific string constant or a value
    if (!this.value && this.returnAsNull) {
      return 'https://core.kg.ebrains.eu/vocab/resetValue';
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    return this.value === null;
  }

  get validationWarnings() {
    const messages: Messages = {};
    if (this.shouldCheckValidation) {
      if(this.requiredValidationWarning) {
        messages.required = 'This field is marked as required.';
      }
    }
    return messages;
  }

  get hasValidationWarnings() {
    return Object.keys(this.validationWarnings).length > 0;
  }

  updateValue(value: Value | null | undefined) {
    this.returnAsNull = false;
    const v = (value !== null && value !== undefined && typeof value === 'object')?value:null;
    this.initialValue = v;
    this.value = v;
  }

  reset() {
    this.returnAsNull = false;
    this.value = this.initialValue;
  }

  get hasChanged() {
    return JSON.stringify(toJS(this.value)) !== JSON.stringify(toJS(this.initialValue)) || this.returnAsNull;
  }

  get shouldCheckValidation() {
    return this.initialValue !== null || this.hasChanged;
  }

  get hasMoreOptions() {
    return !this.fetchingOptions && this.options.length < this.optionsTotal;
  }

  deleteValue() {
    this.value = null;
    this.resetOptionsSearch();
  }

  removeValue() {
    this.returnAsNull = true;
    this.value = null;
    this.resetOptionsSearch();
  }

  addValue(value: Value) {
    if(!this.value || (this.value[this.mappingValue] !== value[this.mappingValue])) {
      this.value = value;
      this.resetOptionsSearch();
    }
  }

  get fetchingOptions() {
    return this.fetchingCounter > 0;
  }

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
    const payload = this.instance ? this.instance.payload: undefined;
    if(this.instance && payload) {
      payload['@type'] = this.instance.types.map(t => t.name);
    }
    try{
      const { data: { suggestions: { data: values, total }, types }} = await this.api.getSuggestions(this.instance.id, this.fullyQualifiedName, this.sourceType?this.sourceType:undefined, this.targetType?this.targetType.name:undefined, this.optionsFrom, this.optionsPageSize, this.optionsSearchTerm, payload);
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

export default LinkStore;
