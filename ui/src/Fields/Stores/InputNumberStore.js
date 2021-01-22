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
import { observable, toJS, makeObservable, action, computed } from "mobx";

import FieldStore from "./FieldStore";

class InputNumberStore extends FieldStore {
  value = "";
  returnAsNull = false;
  initialValue = "";
  inputType = "number";
  minValue = null;
  maxValue = null;

  constructor(definition, options, instance, transportLayer) {
    super(definition, options, instance, transportLayer);
    makeObservable(this, {
      value: observable,
      returnAsNull: observable,
      initialValue: observable,
      minValue: observable,
      maxValue: observable,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      setValue: action,
      returnValue: computed,
      minMaxValueWarning: computed,
      warningMessages: computed,
      requiredValidationWarning: computed,
      hasWarningMessages: computed
    });
    this.minValue = 2; //definition.minValue;
    this.maxValue = definition.maxValue;
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
      if(this.minMaxValueWarning) {
        if(this.minValue && this.maxValue) {
          if(this.value < this.minValue || this.value > this.maxValue) {
            messages.minMaxValue = `Value should be between ${this.minValue} and ${this.maxValue}`;
          }
        } else if(this.value < this.minValue) {
          messages.minMaxValue = `Value should be bigger than ${this.minValue}`;
        } else if(this.value.length > this.maxValue) {
          messages.minMaxValue = `Value should be smaller than ${this.maxValue}`;
        }
      }
    }
    return messages;
  }

  get hasWarningMessages() {
    return Object.keys(this.warningMessages).length > 0;
  }

  get returnValue() {
    if (this.value === null && this.returnAsNull) {
      return null;
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    if(this.value === null) {
      return true;
    }
    return false;
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: toJS(this.initialValue)
    };
  }

  updateValue(value) {
    this.returnAsNull = false;
    this.initialValue = (value !== null && value !== undefined)?value:"";
    this.value = this.initialValue;
  }

  reset() {
    this.returnAsNull = false;
    this.value = this.initialValue;
  }

  get hasChanged() {
    if (typeof this.initialValue  === "object") {
      return typeof this.returnValue !== "object"; // user did not change the value
    }
    return this.returnValue !== this.initialValue;
  }

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
}

export default InputNumberStore;