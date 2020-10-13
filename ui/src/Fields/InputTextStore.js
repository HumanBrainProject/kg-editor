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

class InputTextStore {
  @observable value = "";
  @observable label = null;
  @observable returnAsNull = false;
  @observable alternatives = {};
  @observable errorMessage = null;
  @observable errorInfo = null;
  instance = null;
  type = null;
  initialValue = "";

  constructor(definition, instance) {
    this.type = definition.type;
    this.type = definition.type;
    this.instance = instance;
  }

  get definition() {
    return {
      type: this.type,
      label: this.label
    };
  }

  get clone() {
    return {
      ...this.definition,
      value: toJS(this.value)
    };
  }

  @action
  setError(message, info) {
    this.errorMessage = message;
    this.errorInfo = info;
  }

  @action
  clearError() {
    this.setError(null, null);
  }

  @computed
  get hasError() {
    return this.errorMessage || this.errorInfo;
  }

  @action
  update(value, alternatives) {
    this.initialValue = value;
    this.value = value;
    this.alternatives = alternatives;
  }

  @action
  reset() {
    this.value = this.initialValue;
  }

  @computed
  get hasChanged() {
    //window.console.log("instance: " + this.instance.id + ", field=" + this.label +  " hasChanged=" + (this.getValue(true) !== this.initialValue )+ ", value=" + this.getValue(true) + ", value=" + this.initialValue);
    if (typeof this.initialValue  === "object") {
      return typeof this.returnValue !== "object"; // user did not change the value
    }
    return this.returnValue !== this.initialValue;
  }

  @action
  injectValue(value) {
    this.returnAsNull = false;
    if (value !== null && value !== undefined) {
      this.value = value;
    } else {
      this.value = "";
    }
    this.initialValue = this.value;
  }

  @action
  setValue(value) {
    if (value !== null && value !== undefined) {
      if (value !== "" || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = value;
      }
    } else  {
      this.returnAsNull = true;
      this.value = "";
    }
  }

  get returnValue() {
    if (this.value === "" && this.returnAsNull) {
      return null;
    }
    return toJS(this.value);
  }
}

export default InputTextStore;