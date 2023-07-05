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

import { observable, action, computed, makeObservable } from "mobx";
import API from "../../Services/API";
import RootStore from "../../Stores/RootStore";
import { FieldStoreDefinition } from "../../types";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { WidgetOptions } from "..";
import Instance from "../../Stores/Instance";

class FieldStore {
  value: any;
  label?:string;
  labelTooltip?: string;
  labelTooltipIcon?: IconProp;
  isPublic = false;
  fullyQualifiedName?: string;
  alternatives = [];
  warning?: string;
  errorMessage?: string;
  errorInfo?: string;
  type = null;
  order?: number;
  widget?: string;
  isRequired = false;
  isReadOnly = false;
  instance?: Instance;
  api: API;
  rootStore: RootStore;

  constructor(definition: FieldStoreDefinition, _options: WidgetOptions, instance: Instance, api:API, rootStore: RootStore) {
    makeObservable(this, {
      value: observable,
      label: observable,
      labelTooltip: observable,
      labelTooltipIcon: observable,
      isPublic:observable,
      fullyQualifiedName: observable,
      alternatives: observable,
      warning: observable,
      errorMessage: observable,
      errorInfo: observable,
      isRequired: observable,
      isReadOnly: observable,
      setError: action,
      clearError: action,
      hasError: computed,
      setAlternatives: action,
      setWarning: action,
      clearWarning: action,
      hasWarning: computed
    });

    this.widget = definition.widget;
    this.label = definition.label;
    this.labelTooltip = definition.labelTooltip;
    this.labelTooltipIcon = definition.labelTooltipIcon;
    this.isPublic = !!definition.isPublic;
    this.fullyQualifiedName = definition.fullyQualifiedName;
    this.instance = instance;
    this.order = definition.order;
    this.isRequired = definition.isRequired;
    this.isReadOnly = definition.isReadOnly;
    this.warning = definition.warning;
    this.type = definition.type; // TODO: Check if this is still valid
    this.api = api;
    this.rootStore = rootStore;
  }

  get returnValue(): any {
    throw new Error(`returnValue getter is not implemented for ${this.widget} store`);
  }

  /**
   * @param {any} value field value
   */
  updateValue(value: any): void {
    throw new Error(`update method is not implemented for ${this.widget} store`);
  }

  reset() {
    throw new Error(`reset method is not implemented for ${this.widget} store`);
  }

  get hasChanged(): boolean {
    throw new Error(`hasChanged getter is not implemented for ${this.widget} store`);
  }

  get shouldCheckValidation(): boolean {
    throw new Error(`shouldCheckValidation getter is not implemented for ${this.widget} store`);
  }

  get cloneWithInitialValue(): any {
    throw new Error(`cloneWithInitialValue getter is not implemented for ${this.widget} store`);
  }

  get requiredValidationWarning(): boolean {
    throw new Error(`requiredValidationWarning getter is not implemented for ${this.widget} store`);
  }

  get definition() {
    return {
      widget: this.widget,
      label: this.label,
      fullyQualifiedName: this.fullyQualifiedName,
      isRequired: this.isRequired,
      isReadOnly: this.isReadOnly
    };
  }

  setWarning(message?: string) {
    this.warning = message;
  }

  clearWarning() {
    this.setWarning(undefined);
  }

  get hasWarning() {
    return !!this.warning;
  }

  setError(message?: string, info?: string) {
    this.errorMessage = message;
    this.errorInfo = info;
  }

  clearError() {
    this.setError(undefined, undefined);
  }

  get hasError() {
    return this.errorMessage || this.errorInfo;
  }

  setAlternatives(alternatives) {
    this.alternatives = alternatives;
  }
}

export default FieldStore;