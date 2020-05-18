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

import { observable, action } from "mobx";
import { union } from "lodash";
import { FormStore } from "hbp-quickfire";

export default class KgAnnotatedInputTextStore extends FormStore.typesMapping.Default{
  @observable value = null;
  @observable defaultValue = [];
  @observable max = Infinity;
  @observable useVirtualClipboard = false;
  @observable test = ""

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties, ["value", "defaultValue", "useVirtualClipboard", "max"]);
  }

  constructor(fieldData, store, path){
    super(fieldData, store, path);
    this.injectValue(this.value);
  }

  getValue(){
    return this.value.map(i=> ({"@id": i}));
  }

  @action
  injectValue(value){
    if(value !== undefined){
      this.registerProvidedValue(value, true);
    }
    this.value = this.__emptyValue();

    const providedValue = this.getProvidedValue();
    providedValue.forEach(value => {
      if(!value || !value["@id"] || this.value.length >= this.max){
        return;
      }
      this.value.push(value["@id"]);
    });
  }
}