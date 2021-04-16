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
  labelTooltipIcon = null;
  globalLabelTooltip = null;
  globalLabelTooltipIcon = null;
  fullyQualifiedName = null;
  alternatives = [];
  warning = null;
  errorMessage = null;
  errorInfo = null;
  type = null;
  order = null;
  widget = null;
  isRequired = false;
  instance = null;
  transportLayer = null;
  rootStore = null;

  constructor(definition, options, instance, transportLayer, rootStore) {
    makeObservable(this, {
      label: observable,
      labelTooltip: observable,
      labelTooltipIcon: observable,
      globalLabelTooltip:observable,
      globalLabelTooltipIcon: observable,
      fullyQualifiedName: observable,
      alternatives: observable,
      warning: observable,
      errorMessage: observable,
      errorInfo: observable,
      isRequired: observable,
      setError: action,
      clearError: action,
      hasError: computed,
      setAlternatives: action
    });

    this.widget = definition.widget;
    this.label = definition.label;
    this.labelTooltip = definition.labelTooltip;
    this.labelTooltipIcon = definition.labelTooltipIcon;
    this.globalLabelTooltip = definition.globalLabelTooltip;
    this.globalLabelTooltipIcon = definition.globalLabelTooltipIcon;
    this.fullyQualifiedName = definition.fullyQualifiedName;
    this.instance = instance;
    this.order = definition.order;
    this.isRequired = definition.isRequired;
    this.type = definition.type;
    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  get returnValue() {
    throw new Error(`returnValue getter is not implemented for ${this.widget} store`);
  }

  /**
   * @param {any} value field value
   */
  updateValue() {
    throw new Error(`update method is not implemented for ${this.widget} store`);
  }

  reset() {
    throw new Error(`reset method is not implemented for ${this.widget} store`);
  }

  get hasChanged() {
    throw new Error(`hasChanged getter is not implemented for ${this.widget} store`);
  }

  get cloneWithInitialValue() {
    throw new Error(`cloneWithInitialValue getter is not implemented for ${this.widget} store`);
  }

  get requiredValidationWarning() {
    throw new Error(`requiredValidationWarning getter is not implemented for ${this.widget} store`);
  }

  get definition() {
    return {
      widget: this.widget,
      label: this.label,
      fullyQualifiedName: this.fullyQualifiedName,
      isRequired: this.isRequired
    };
  }

  setWarning(message) {
    this.warning = message;
  }

  clearWarning() {
    this.setWarning(null);
  }

  get hasWarning() {
    return this.warning;
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