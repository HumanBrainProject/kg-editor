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

import { observable, action, computed } from "mobx";

class FieldStore {
  @observable label = null;
  @observable fullyQualifiedName = null;
  @observable alternatives = [];
  @observable errorMessage = null;
  @observable errorInfo = null;
  instance = null;
  type = null;
  initialValue = "";

  constructor(definition, options, instance) {
    this.type = definition.type;
    this.label = definition.label;
    this.fullyQualifiedName = definition.fullyQualifiedName;
    this.instance = instance;
  }

  @computed
  get returnValue() {
    throw `returnValue getter is not implemented for ${this.type} store`;
  }

  @action
  /**
   * @param {any} value field value
   */
  updateValue() {
    throw `update method is not implemented for ${this.type} store`;
  }

  @action
  reset() {
    throw `reset method is not implemented for ${this.type} store`;
  }

  @computed
  get hasChanged() {
    throw `hasChanged getter is not implemented for ${this.type} store`;
  }

  @computed
  get cloneWithInitialValue() {
    throw `cloneWithInitialValue getter is not implemented for ${this.type} store`;
  }

  get definition() {
    return {
      type: this.type,
      label: this.label,
      fullyQualifiedName: this.fullyQualifiedName
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
  setAlternatives(alternatives) {
    this.alternatives = alternatives;
  }
}

export default FieldStore;