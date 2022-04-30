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

import { observable, action, computed, toJS, makeObservable } from "mobx";

import FieldStore from "./FieldStore";

const getRegexRules = validation => Array.isArray(validation)?
  validation.map(rule => ({
      regex: new RegExp(rule.regex),
      errorMessage: rule.errorMessage
  }))
  :[];
    
class InputTextMultipleStore extends FieldStore {
  value = [];
  options = [];
  returnAsNull = false;
  initialValue = [];
  maxLength = null;
  minItems = null;
  maxItems = null;
  regexRules = [];

  constructor(definition, options, instance, transportLayer, rootStore) {
    super(definition, options, instance, transportLayer, rootStore);
    this.minItems = definition.minItems;
    this.maxItems = definition.maxItems;
    this.maxLength = definition.maxLength;
    this.regexRules = getRegexRules(definition.validation);
    //TODO: remove backward compatibility for deprecated regex property
    if (definition.regex && !(Array.isArray(definition.validation) && definition.validation.length)) {
      this.regexRules = [
        {
          regex: definition.regex,
          errorMessage: "this is not a valid value"
        }
      ];
    }

    makeObservable(this, {
      value: observable,
      options: observable,
      returnAsNull: observable,
      initialValue: observable,
      maxLength: observable,
      minItems: observable,
      maxItems: observable,
      regexRules: observable,
      regexWarning: computed,
      hasRegexWarning: computed,
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
      return "https://core.kg.ebrains.eu/vocab/resetValue";
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    return this.value.length === 0;
  }

  get maxLengthWarning() {
    return !!this.maxLength;
  }

  get regexWarning() {
    return this.regexRules.reduce((message, rule) => {
      !message && Array.isArray(this.value) && this.value.some(val => {
        if (!rule.regex.test(val)) {
          message = rule.errorMessage;
          return true;
        }
        return false;
      });
      return message;
    }, null);
  }

  get hasRegexWarning() {
    return !!this.regexWarning;
  }

  get numberOfItemsWarning() {
    if(!this.minItems && !this.maxItems) {
      return false;
    }
    return this.minItems || this.maxItems;
  }

  get validationWarnings() {
    const messages = {};
    if (this.shouldCheckValidation) {
      if(this.requiredValidationWarning) {
        messages.required = "This field is marked as required.";
      }
      if(this.numberOfItemsWarning) {
        if(this.minItems && this.maxItems) {
          if(this.value.length < this.minItems || this.value.length > this.maxItems) {
            messages.numberOfItems = `Number of values should be between ${this.minItems} and ${this.maxItems}`;
          }
        } else if(this.value.length < this.minItems) {
          messages.numberOfItems = `Number of values should be bigger than ${this.minItems}`;
        } else if(this.value.length > this.maxItems) {
          messages.numberOfItems = `Number of values should be smaller than ${this.maxItems}`;
        }
      }
      if(this.maxLengthWarning) {
        if (this.value.some(val => val.length > this.maxLength)) {
          messages.maxValues = `Maximum characters allowed per value: ${this.maxLength}`;
        }
      }
      if(this.hasRegexWarning) {
        messages.regex = this.regexWarning;
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
    return !!this.value.length || this.hasChanged;
  }

  getValues(value) {
    if(Array.isArray(value)) {
      return value;
    }
    if(value !== null && value !== undefined) {
      return [value];
    }
    return []; 
  }

  updateValue(value) {
    this.returnAsNull = false;
    const values = this.getValues(value);
    this.initialValue = [...values];
    this.value = values;
  }

  reset() {
    this.returnAsNull = false;
    this.value = [...this.initialValue];
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
      const index = this.value.indexOf(afterValue);
      this.deleteValue(value);
      this.insertValue(value, index);
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

export default InputTextMultipleStore;
