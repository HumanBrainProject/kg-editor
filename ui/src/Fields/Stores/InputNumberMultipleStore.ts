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

import { observable, action, computed, toJS, makeObservable } from 'mobx';
import FieldStore from './FieldStore';
import type { WidgetOptions } from '..';
import type API from '../../Services/API';
import type Instance from '../../Stores/Instance';
import type RootStore from '../../Stores/RootStore';
import type { FieldStoreDefinition } from '../../types';

const normalizeValues = (values: string[]|null|undefined) => {
  if (Array.isArray(values)) {
    return values;
  }
  if (values !== null && values !== undefined) {
    return [values];
  }
  return [];
};

interface Messages {
  required?: string;
  minMaxValues?: string;
  numberOfItems?: string;
}

class InputNumberMultipleStore extends FieldStore {
  value: string[] = [];
  options = [];
  returnAsNull = false;
  initialValue: string[] = [];
  maxLength?: number;
  regex?: string;
  minItems?: number;
  maxItems?: number;
  minValue?: number;
  maxValue?: number;

  constructor(definition: FieldStoreDefinition, options: WidgetOptions, instance: Instance, api: API, rootStore: RootStore) {
    super(definition, options, instance, api, rootStore);
    this.minItems = definition.minItems;
    this.maxItems = definition.maxItems;
    this.minValue = definition.minValue;
    this.maxValue = definition.maxValue;

    makeObservable(this, {
      options: observable,
      returnAsNull: observable,
      initialValue: observable,
      maxLength: observable,
      minItems: observable,
      maxItems: observable,
      minValue: observable,
      maxValue: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      requiredValidationWarning: computed,
      validationWarnings: computed,
      numberOfItemsWarning: computed,
      hasValidationWarnings: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      shouldCheckValidation: computed,
      insertValue: action,
      deleteValue: action,
      addValue: action,
      setValues: action,
      moveValueAfter: action,
      removeValue: action,
      removeAllValues: action,
      removeLastValue: action
    });
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: [...toJS(this.initialValue)]
    };
  }

  get returnValue() { //NOSONAR, by design spec it can return that specific string constant or a list of value
    if (!this.value.length && this.returnAsNull) {
      return 'https://core.kg.ebrains.eu/vocab/resetValue';
    }
    return this.value.map(v => parseFloat(v));
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    return this.value.length === 0;
  }

  updateValue(value: string[]|null|undefined) {
    this.returnAsNull = false;
    const values = normalizeValues(value);
    this.initialValue = [...values];
    this.value = values;
  }

  reset() {
    this.returnAsNull = false;
    this.value = [...this.initialValue];
  }

  get numberOfItemsWarning() {
    if(!this.minItems && !this.maxItems) {
      return false;
    }
    return this.minItems || this.maxItems;
  }

  get minMaxValueWarning() {
    if(!this.minValue && !this.maxValue) {
      return false;
    }
    return this.minValue || this.maxValue;
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
      if(this.minMaxValueWarning) {
        if(this.minValue && this.maxValue) {
          if (this.value.some(val => (this.minValue && parseInt(val) < this.minValue) || (this.maxValue && parseInt(val) > this.maxValue))) {
            messages.minMaxValues = `Values should be between ${this.minValue} and ${this.maxValue}`;
          }
        } else if (this.value.some(val => this.minValue && parseInt(val) < this.minValue)) {
          messages.minMaxValues = `Values should be bigger than ${this.minValue}`;
        } else if (this.value.some(val => this.maxValue && parseInt(val) > this.maxValue)) {
          messages.minMaxValues = `Values should be smaller than ${this.maxValue}`;
        }
      }
    }
    return messages;
  }

  get hasValidationWarnings() {
    return Object.keys(this.validationWarnings).length > 0;
  }

  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val !== this.initialValue[index]));
  }

  get shouldCheckValidation() {
    return !!this.initialValue.length || this.hasChanged;
  }

  insertValue(value: string, index?: number) {
    if(value !== undefined && value !== null && this.value.length !== undefined && this.value.indexOf(value) === -1){
      if(index !== undefined && index !== -1){
        this.value.splice(index, 0, value);
      } else {
        this.value.push(value);
      }
    }
  }

  deleteValue(value: string) {
    if(this.value.length !== undefined){
      this.value = this.value.filter(val => val !== value);
    }
  }

  addValue(value: string) {
    this.insertValue(value);
  }

  setValues(values: string[]|null|undefined) {
    if (values !== null && values !== undefined) {
      if (values.length  || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = values;
      }
    } else  {
      this.returnAsNull = true;
      this.value = [];
    }
  }

  moveValueAfter(value: string, afterValue: string) {
    if(value) {
      const index = this.value.indexOf(afterValue);
      this.deleteValue(value);
      this.insertValue(value, index);
    }
  }

  removeValue(value: string) {
    this.deleteValue(value);
  }

  removeAllValues() {
    this.setValues(null);
  }

  removeLastValue() {
    if (this.value.length) {
      this.deleteValue(this.value[this.value.length-1]);
    }
  }
}

export default InputNumberMultipleStore;
