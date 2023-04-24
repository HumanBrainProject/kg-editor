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

class UnsupportedFieldStore extends FieldStore {
  value = null;

  constructor(definition, options, instance, transportLayer, rootStore) {
    super(definition, options, instance, transportLayer, rootStore);

    makeObservable(this, {
      value: observable,
      returnValue: computed,
      cloneWithInitialValue: computed,
      requiredValidationWarning: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      shouldCheckValidation: computed
    });
  }

  get returnValue() {
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    return false;
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: toJS(this.value)
    };
  }

  updateValue(value) {
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reset() {} //NOSONAR this class extends FieldStore which require that the reset methode should be implemented

  get hasChanged() {
    return false;
  }

  get shouldCheckValidation() {
    return false;
  }
}

export default UnsupportedFieldStore;