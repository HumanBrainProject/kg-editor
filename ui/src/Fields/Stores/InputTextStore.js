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

const DEFAULT_REGEX = {
  regex: new RegExp("^(?! ).*(?<! )$"),
  errorMessage: "leading/trailling spaces are not allowed"
};

const getRegexRules = validation => {
  const rules = Array.isArray(validation)?
  validation.map(rule => ({
      regex: new RegExp(rule.regex),
      errorMessage: rule.errorMessage
    })):[];
  rules.push(DEFAULT_REGEX);
  return rules;
};
class InputTextStore extends FieldStore {
  value = "";
  returnAsNull = false;
  initialValue = "";
  maxLength = null;
  regexRules = [DEFAULT_REGEX];

  constructor(definition, options, instance, transportLayer, rootStore) {
    super(definition, options, instance, transportLayer, rootStore);
    this.maxLength = definition.maxLength;
    this.regexRules = getRegexRules(definition.validation);
    //TODO: remove backward compatibility for deprecated regex property
    if (definition.regex && !(Array.isArray(definition.validation) && definition.validation.length)) {
      this.regexRules = [
        {
          regex: new RegExp(definition.regex),
          errorMessage: "this is not a valid value"
        },
        DEFAULT_REGEX
      ];
    }

    makeObservable(this, {
      value: observable,
      returnAsNull: observable,
      initialValue: observable,
      maxLength: observable,
      regexRules: observable,
      regexWarning: computed,
      hasRegexWarning: computed,
      returnValue: computed,
      requiredValidationWarning: computed,
      maxLengthWarning: computed,
      cloneWithInitialValue: computed,
      warningMessages: computed,
      hasWarningMessages: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      setValue: action
    });
  }

  get returnValue() {
    if (this.value === "" && this.returnAsNull) {
      return "https://core.kg.ebrains.eu/vocab/resetValue";
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    if(this.value === "") {
      return true;
    }
    return false;
  }

  get maxLengthWarning() {
    if(!this.maxLength) {
      return false;
    }
    if(this.value.length > this.maxLength) {
      return true;
    }
    return false;
  }

  get regexWarning() {
    return this.regexRules.reduce((message, rule) => (message || rule.regex.test(this.value))?message:rule.errorMessage, null);
  }

  get hasRegexWarning() {
    return !!this.regexWarning;
  }

  get warningMessages() {
    const messages = {};
    if (this.hasChanged) {
      if(this.requiredValidationWarning) {
        messages.required = "This field is marked as required.";
      }
      if(this.maxLengthWarning) {
        messages.maxLength = `Maximum characters allowed: ${this.maxLength}`;
      }
      if(this.hasRegexWarning) {
        messages.regex = this.regexWarning;
      }
    }
    return messages;
  }

  get hasWarningMessages() {
    return Object.keys(this.warningMessages).length > 0;
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

export default InputTextStore;