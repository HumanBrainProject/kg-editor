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

import { observable, action, computed, makeObservable } from "mobx";

class FieldStore {
  label = null;
  labelTooltip = null;
  fullyQualifiedName = null;
  alternatives = [];
  errorMessage = null;
  errorInfo = null;
  instance = null;
  type = null;

  instance = null;
  transportLayer = null;

  constructor(definition, options, instance, transportLayer) {
    makeObservable(this, {
      label: observable,
      labelTooltip: observable,
      fullyQualifiedName: observable,
      alternatives: observable,
      errorMessage: observable,
      errorInfo: observable,
      setError: action,
      clearError: action,
      hasError: computed,
      setAlternatives: action
    });

    this.type = definition.type;
    this.label = definition.label;
    this.labelTooltip = definition.labelTooltip;
    this.fullyQualifiedName = definition.fullyQualifiedName;
    this.instance = instance;

    this.transportLayer = transportLayer;
  }

  get returnValue() {
    throw `returnValue getter is not implemented for ${this.type} store`;
  }

  /**
   * @param {any} value field value
   */
  updateValue() {
    throw `update method is not implemented for ${this.type} store`;
  }

  reset() {
    throw `reset method is not implemented for ${this.type} store`;
  }

  get hasChanged() {
    throw `hasChanged getter is not implemented for ${this.type} store`;
  }

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

  setError(message, info) {
    this.errorMessage = message;
    this.errorInfo = info;
  }

  clearError() {
    this.setError(null, null);
  }

  get hasError() {
    return this.errorMessage || this.errorInfo;
  }

  setAlternatives(alternatives) {
    this.alternatives = alternatives;
  }
}

export default FieldStore;