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
import { observable, toJS, makeObservable, action, computed } from 'mobx';

import FieldStore from './FieldStore';
import type { WidgetOptions } from '..';
import type API from '../../Services/API';
import type Instance from '../../Stores/Instance';
import type RootStore from '../../Stores/RootStore';
import type { FieldStoreDefinition } from '../../types';

interface Messages {
  minMaxValue?: string;
}

class InputNumberStore extends FieldStore {
  value: string | null = '';
  returnAsNull = false;
  initialValue: string | null = null;
  inputType = 'number';
  minValue?: number;
  maxValue?: number;

  constructor(definition: FieldStoreDefinition, options: WidgetOptions, instance: Instance, api: API, rootStore: RootStore) {
    super(definition, options, instance, api, rootStore);
    makeObservable(this, {
      returnAsNull: observable,
      initialValue: observable,
      minValue: observable,
      maxValue: observable,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      shouldCheckValidation: computed,
      setValue: action,
      returnValue: computed,
      minMaxValueWarning: computed,
      validationWarnings: computed,
      requiredValidationWarning: computed,
      hasValidationWarnings: computed
    });
    this.minValue = definition.minValue;
    this.maxValue = definition.maxValue;
  }

  get minMaxValueWarning() {
    if(!this.minValue && !this.maxValue) {
      return false;
    }
    return (this.minValue || this.maxValue);
  }

  get validationWarnings() {
    const messages: Messages = {};
    if (this.shouldCheckValidation) {
      if(this.minMaxValueWarning && this.value !== '') {
        if(this.value) {
          const v = parseInt(this.value);
          if(this.minValue && this.maxValue) {
            if(v < this.minValue || v > this.maxValue) {
              messages.minMaxValue = `Value should be between ${this.minValue} and ${this.maxValue}`;
            }
          } else if(this.minValue && v < this.minValue) {
            messages.minMaxValue = `Value should be bigger than ${this.minValue}`;
          } else if(this.maxValue && v > this.maxValue) {
            messages.minMaxValue = `Value should be smaller than ${this.maxValue}`;
          }
        }
      }
    }
    return messages;
  }

  get hasValidationWarnings() {
    return Object.keys(this.validationWarnings).length > 0;
  }

  get returnValue() { //NOSONAR, by design spec it can return that specific string constant or a value
    if (this.value === null && this.returnAsNull) {
      return 'https://core.kg.ebrains.eu/vocab/resetValue';
    }
    if (this.value === '' || this.value === null) {
      return null;
    }
    const value = parseFloat(toJS(this.value));
    if (isNaN(value)) {
      return null;
    }
    return value;
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    return this.value === null;
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: toJS(this.initialValue)
    };
  }

  updateValue(value: string | null | undefined) {
    this.returnAsNull = false;
    this.initialValue = (value !== null && value !== undefined)?value:null;
    this.value = this.initialValue;
  }

  reset() {
    this.returnAsNull = false;
    this.value = this.initialValue;
  }

  get hasChanged() {
    if (this.initialValue !== null && typeof this.initialValue === 'object') {
      return typeof this.returnValue !== 'object'; // user did not change the value
    }
    return this.returnValue !== this.initialValue;
  }

  get shouldCheckValidation() {
    return this.initialValue !== null || this.hasChanged;
  }

  setValue(value: string | null | undefined) {
    if (value !== null && value !== undefined) {
      if (value !== '' || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = value;
      }
    } else  {
      this.returnAsNull = true;
      this.value = '';
    }
  }
}

export default InputNumberStore;