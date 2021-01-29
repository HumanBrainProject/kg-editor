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

import { observable, action, computed, makeObservable, toJS } from "mobx";
import FieldStore from "./FieldStore";
import { fieldsMapping } from "../../Fields";

class NestedFieldStore extends FieldStore {
  fieldsTemplate = {};
  nestedFieldsStores = [];

  constructor(definition, options, instance, transportLayer) {
    super(definition, options, instance, transportLayer);
    this.fieldsTemplate = definition.fields;

    makeObservable(this, {
      nestedFieldsStores: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
    });
  }

  get cloneWithInitialValue() {
    // get cloneWithInitialValue from fields
    return {};
  }

  get returnValue() {
    return this.nestedFieldsStores.map(row => {
      return Object.values(row).reduce((acc, store) => {
        acc[store.fullyQualifiedName] = store.returnValue;
        return acc;
      }, {});
    });
  }

  updateValue(values) {
    this.nestedFieldsStores = [];
    if(values) {
      values.forEach(value => {
        const rowFieldStores = {};
        Object.entries(this.fieldsTemplate).forEach(([name, fieldTemplate]) => {
          const field = JSON.parse(JSON.stringify(toJS(fieldTemplate)));
          let warning = null;
          if(name === this.labelField) {
            field.labelTooltip = "This field will be publicly accessible for every user. (Even for users without read access)";
            field.labelTooltipIcon = "globe";
          }
          if (!rowFieldStores[name]) {
            if (!field.widget) {
              warning = `no widget defined for field "${name}" of type "${this.primaryType.name}"!`;
              field.widget = "UnsupportedField";
            } else if (!fieldsMapping[field.widget]) {
              warning = `widget "${field.widget}" defined in field "${name}" of type "${this.primaryType.name}" is not supported!`;
              field.widget = "UnsupportedField";
            }
            const fieldMapping = fieldsMapping[field.widget];
            rowFieldStores[name] = new fieldMapping.Store(field, fieldMapping.options, this.instance, this.transportLayer);
          }
          const store = rowFieldStores[name];
          store.updateValue(value[name]);
          if (warning) {
            store.setWarning(warning);
          }
        });
        this.nestedFieldsStores.push(rowFieldStores);
      });
    }
  }

  addValue() {
    const values = this.returnValue;
    values.push({});
    this.updateValue(values);
  }

  reset() {
    // call fields reset
  }

  get hasChanged() {
    // call fields hasChanged
    return false;
  }

}

export default NestedFieldStore;
