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

class AnnotatedInputTextStore extends FieldStore {
  value = [];
  options = [];
  returnAsNull = false;
  initialValue = [];
  mappingValue = "@id";

  constructor(definition, options, instance, transportLayer) {
    super(definition, options, instance, transportLayer);

    makeObservable(this, {
      value: observable,
      options: observable,
      returnAsNull: observable,
      initialValue: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      requiredValidationWarning: computed,
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
      removeLastValue: action,
      resources: computed
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
    return toJS(this.value);
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
    const values = Array.isArray(value)?value:(value !== null && value !== undefined && typeof value === "object"?[value]:[]);
    this.initialValue = [...values];
    this.value = values;
  }

  reset() {
    this.returnAsNull = false;
    this.value = [...this.initialValue];
  }

  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val[this.mappingValue] !== this.initialValue[index][this.mappingValue]));
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
    if (this.value.length !== undefined) {
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

  get resources() { // be aware that it may contains null values and null value are needed!
    return this.value.map(value => (value && value[this.mappingValue])?value[this.mappingValue]:"Unknown ressource");
  }
}

export default AnnotatedInputTextStore;
