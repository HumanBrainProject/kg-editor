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

import { observable, computed, action } from "mobx";
import { union } from "lodash";
import { FormStore } from "hbp-quickfire";

class TextAreaStore extends FormStore.typesMapping.TextArea {
  @observable returnAsNull = false;
  @observable emptyToNull = false;
  @observable initialValue = "";

  static get properties(){
    return union(super.properties,["emptyToNull"]);
  }

  constructor(fieldData, store, path) {
    super(fieldData, store, path);
    this.injectValue(this.value);
  }

  @computed
  get hasChanged() {
    return this.getValue(true) !== this.initialValue;
  }

  @action
  injectValue(value) {
    this.returnAsNull = false;
    if (value !== null && value !== undefined) {
      this.value = value;
      this.initialValue = value;
    } else {
      this.value = this.__emptyValue();
      this.initialValue = this.__emptyValue();
    }
  }

  @action
  setValue(value) {
    if (value !== null && value !== undefined) {
      if (value !== this.__emptyValue() || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = value;
      }
    } else  {
      this.returnAsNull = true;
      this.value = this.__emptyValue();
    }
  }

  getValue(applyMapping = true) {
    const value = super.getValue(applyMapping);
    if (value === this.__emptyValue() && this.returnAsNull) {
      return null;
    }
    return value;
  }
}

export default TextAreaStore;