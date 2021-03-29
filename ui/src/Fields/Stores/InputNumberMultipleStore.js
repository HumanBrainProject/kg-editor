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

import { observable, action, computed, toJS, makeObservable } from "mobx";
import FieldStore from "./FieldStore";

class InputNumberMultipleStore extends FieldStore {
  value = [];
  options = [];
  returnAsNull = false;
  initialValue = [];
  maxLength = null;
  regex = null;
  minItems = null;
  maxItems = null;
  minValue = null;
  maxValue = null;

  constructor(definition, options, instance, transportLayer, rootStore) {
    super(definition, options, instance, transportLayer, rootStore);
    this.minItems = definition.minItems;
    this.maxItems = definition.maxItems;
    this.minValue = definition.minValue;
    this.maxValue = definition.maxValue;

    makeObservable(this, {
      value: observable,
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
      warningMessages: computed,
      numberOfItemsWarning: computed,
      hasWarningMessages: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
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

  get returnValue() {
    if (!this.value.length && this.returnAsNull) {
      return null;
    }
    const val = this.value.map(v => parseFloat(v));
    return val;
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    if(this.value.length === 0) {
      return true;
    }
    return false;
  }

  updateValue(value) {
    this.returnAsNull = false;
    const values = Array.isArray(value)?value:(value !== null && value !== undefined?[value]:[]);
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
    if(this.minItems || this.maxItems) {
      return true;
    }
    return false;
  }

  get minMaxValueWarning() {
    if(!this.minValue && !this.maxValue) {
      return false;
    }
    if(this.minValue || this.maxValue) {
      return true;
    }
    return false;
  }

  get warningMessages() {
    const messages = {};
    if (this.hasChanged) {
      if(this.numberOfItemsWarning) {
        if(this.minItems && this.maxItems) {
          if(this.value.length < this.minItems || this.value.length > this.maxItems) {
            messages.numberOfItems = `Number of values should be between ${this.minItems} and ${this.maxItems}`;
          }
        } else if(this.value.length < this.minItems) {
          messages.numberOfItems = `Number of values should be bigger than ${this.minItems}`;
        } else if(this.value.length > this.maxItems) {
          messages.numberOfItems = `Number of values should be smaller than ${this.minItems}`;
        }
      }
      if(this.minMaxValueWarning) {
        if(this.minValue && this.maxValue) {
          if (this.value.some(val => val < this.minValue || val > this.maxValue)) {
            messages.minMaxValues = `Values should be between ${this.minValue} and ${this.maxValue}`;
          }
        } else if (this.value.some(val => val < this.minValue)) {
          messages.minMaxValues = `Values should be bigger than ${this.minValue}`;
        } else if (this.value.some(val => val > this.maxValue)) {
          messages.minMaxValues = `Values should be smaller than ${this.maxValue}`;
        }
      }
    }
    return messages;
  }

  get hasWarningMessages() {
    return Object.keys(this.warningMessages).length > 0;
  }

  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val !== this.initialValue[index]));
  }

  insertValue(value, index) {
    if(value && this.value.length !== undefined && this.value.indexOf(value) === -1){
      if(index !== undefined && index !== -1){
        this.value.splice(index, 0, value);
      } else {
        this.value.push(value);
      }
    }
  }

  deleteValue(value) {
    if(this.value.length !== undefined){
      this.value = this.value.filter(val => val !== value);
    }
  }

  addValue(value) {
    this.insertValue(value);
  }

  setValues(values) {
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

  moveValueAfter(value, afterValue) {
    if(value) {
      this.deleteValue(value);
      this.insertValue(value, this.value.indexOf(afterValue));
    }
  }

  removeValue(value) {
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
