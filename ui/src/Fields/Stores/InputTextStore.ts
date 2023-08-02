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
import type {
  FieldStoreDefinition,
  FieldStoreRegexRule,
  FieldStoreValidation
} from '../../types';

interface Message {
  required?: string;
  regex?: string;
  maxLength?: string;
}

const DEFAULT_REGEX = {
  // regex: /^(?!\s)(.|\n)*(?<!\s)$/, -> Negative lookout is not supported by safari
  regex: /^[^\s]([^]*[^\s])?$/,
  errorMessage: 'leading/trailling spaces are not allowed'
};

const getRegexRules = (
  validation?: FieldStoreValidation[]
): FieldStoreRegexRule[] => {
  const rules = Array.isArray(validation)
    ? validation.map(rule => ({
      regex: new RegExp(rule.regex),
      errorMessage: rule.errorMessage
    }))
    : [];
  rules.push(DEFAULT_REGEX);
  return rules;
};

class InputTextStore extends FieldStore {
  inputType = 'text';
  value = '';
  returnAsNull = false;
  initialValue = '';
  maxLength?: number;
  regexRules: FieldStoreRegexRule[] = [DEFAULT_REGEX];
  markdown = false;

  constructor(
    definition: FieldStoreDefinition,
    options: WidgetOptions,
    instance: Instance,
    api: API,
    rootStore: RootStore
  ) {
    super(definition, options, instance, api, rootStore);
    this.maxLength = definition.maxLength;
    this.markdown = !!definition.markdown;
    this.regexRules = getRegexRules(definition.validation);
    //TODO: remove backward compatibility for deprecated regex property
    if (
      definition.regex &&
      !(Array.isArray(definition.validation) && definition.validation.length)
    ) {
      this.regexRules = [
        {
          regex: new RegExp(definition.regex),
          errorMessage: 'this is not a valid value'
        },
        DEFAULT_REGEX
      ];
    }

    makeObservable(this, {
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
      validationWarnings: computed,
      hasValidationWarnings: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      shouldCheckValidation: computed,
      setValue: action
    });
  }

  get returnValue() {
    //NOSONAR, by design spec it can return that specific string constant or a value
    if (this.value === '' && this.returnAsNull) {
      return 'https://core.kg.ebrains.eu/vocab/resetValue';
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if (!this.isRequired) {
      return false;
    }
    return this.value === '';
  }

  get maxLengthWarning() {
    if (!this.maxLength) {
      return false;
    }
    return this.value.length > this.maxLength;
  }

  get regexWarning(): string | undefined {
    //NOSONAR by design return null when no warning
    return this.regexRules.reduce((message, rule) =>
      message || rule.regex.test(this.value) ? message : rule.errorMessage, //TODO: What is this code doing ?? It looks like a hack!
      undefined as string | undefined
    );
  }

  get hasRegexWarning() {
    return !!this.regexWarning;
  }

  get validationWarnings() {
    const messages: Message = {};
    if (this.shouldCheckValidation) {
      if (this.requiredValidationWarning) {
        messages.required = 'This field is marked as required.';
      }
      if (this.hasRegexWarning && !this.requiredValidationWarning) {
        messages.regex = this.regexWarning;
      }
      if (
        this.maxLengthWarning &&
        !this.requiredValidationWarning &&
        !this.hasRegexWarning
      ) {
        messages.maxLength = `Maximum characters allowed: ${this.maxLength}`;
      }
    }
    return messages;
  }

  get hasValidationWarnings() {
    return Object.keys(this.validationWarnings).length > 0;
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: toJS(this.initialValue)
    };
  }

  updateValue(value: string | null | undefined) {
    this.returnAsNull = false;
    this.initialValue = value !== null && value !== undefined ? value : '';
    this.value = this.initialValue;
  }

  reset() {
    this.returnAsNull = false;
    this.value = this.initialValue;
  }

  get hasChanged() {
    if (typeof this.initialValue === 'object') {
      return typeof this.returnValue !== 'object'; // user did not change the value
    }
    return this.returnValue !== this.initialValue;
  }

  get shouldCheckValidation() {
    return this.initialValue !== '' || this.hasChanged;
  }

  setValue(value: string | null | undefined) {
    if (value !== null && value !== undefined) {
      if (value !== '' || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = value;
      }
    } else {
      this.returnAsNull = true;
      this.value = '';
    }
  }
}

export default InputTextStore;
