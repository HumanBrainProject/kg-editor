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

import { observable, action, computed, toJS, makeObservable } from "mobx";

import FieldStore from "./FieldStore";

class UnsupportedFieldStore extends FieldStore {
  value = null;

  constructor(definition, options, instance, transportLayer) {
    super(definition, options, instance, transportLayer);

    makeObservable(this, {
      value: observable,
      returnValue: computed,
      cloneWithInitialValue: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed
    });
  }

  get returnValue() {
    return toJS(this.value);
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

  reset() {}

  get hasChanged() {
    return false;
  }

}

export default UnsupportedFieldStore;