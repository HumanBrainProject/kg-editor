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

import { observable, action, computed, toJS } from "mobx";
import FieldStore from "./FieldStore";
import { remove } from "lodash";

class InputTextMultipleStore extends FieldStore {
  @observable value = [];
  @observable options = [];
  @observable alternatives = [];
  @observable returnAsNull = false;
  @observable initialValue = [];

  @computed
  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: [...toJS(this.initialValue)]
    };
  }

  @computed
  get returnValue() {
    if (!this.value.length && this.returnAsNull) {
      return null;
    }
    return toJS(this.value);
  }

  @action
  updateValue(value) {
    this.returnAsNull = false;
    const values = Array.isArray(value)?value:(value !== null && value !== undefined && typeof value === "object"?[value]:[]);
    this.initialValue = [...values];
    this.value = values;
  }

  @action
  reset() {
    this.returnAsNull = false;
    this.value = [...this.initialValue];
  }

  @computed
  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val !== this.initialValue[index]));
  }

  @action
  insertValue(value, index) {
    if(value && this.value.length !== undefined && this.value.indexOf(value) === -1){
      if(index !== undefined && index !== -1){
        this.value.splice(index, 0, value);
      } else {
        this.value.push(value);
      }
    }
  }

  @action
  deleteValue(value) {
    if(this.value.length !== undefined){
      remove(this.value, val=>val === value);
    }
  }

  @action
  addValue(value) {
    this.insertValue(value);
  }

  @action
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

  @action
  moveValueAfter(value, afterValue) {
    if(value) {
      this.deleteValue(value);
      this.insertValue(value, this.value.indexOf(afterValue));
    }
  }

  @action
  removeValue(value) {
    this.deleteValue(value);
  }

  @action
  removeAllValues() {
    this.setValues(null);
  }

  @action
  removeLastValue() {
    if (this.value.length) {
      this.deleteValue(this.value[this.value.length-1]);
    }
  }
}

export default InputTextMultipleStore;
