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

export default class InputTextStore extends FormStore.typesMapping.Default{
  @observable value = "";
  @observable defaultValue = "";
  @observable inputType = "text";
  @observable autoComplete = false;
  @observable useVirtualClipboard = false;

  __emptyValue = () => "";

  static get properties(){
    return union(super.properties, ["value", "defaultValue", "inputType", "useVirtualClipboard"]);
  }

  @action
  getValue(applyMapping){
    let value = this.value;
    if (this.inputType === "number") {
      if (value !== "") {
        value = parseFloat(value);
      } else {
        value = null;
      }
    }
    return applyMapping? this.mapReturnValue(value): value;
  }
}