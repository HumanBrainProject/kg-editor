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
  initialValue = [];
  returnAsNull = false;
  nestedFieldsStores = [];
  targetTypes = [];

  constructor(definition, options, instance, transportLayer) {
    super(definition, options, instance, transportLayer);
    this.fieldsTemplate = definition.fields;
    this.targetTypes = definition.targetTypes;
    makeObservable(this, {
      initialValue: observable,
      returnAsNull: observable,
      nestedFieldsStores: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      addValue: action,
      deleteItemByIndex: action,
      moveItemUpByIndex: action,
      moveItemDownByIndex: action
    });
  }

  get definition() {
    return {
      ...super.definition,
      fields: this.fieldsTemplate
    };
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: [...toJS(this.initialValue)]
    };
  }

  get returnValue() {
    return this.nestedFieldsStores.map(row => {
      return Object.values(row.stores).reduce((acc, store) => {
        acc[store.fullyQualifiedName] = store.returnValue;
        return acc;
      }, {"@type": row["@type"]});
    });
  }

  _setValue(values) {
    this.nestedFieldsStores = [];
    if(values) {
      values.forEach(value => {
        const rowFieldStores = {stores: {}, "@type": value["@type"]};
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
            const options = {...fieldMapping.options, targetTypes: value["@type"]};
            rowFieldStores.stores[name] = new fieldMapping.Store(field, options, this.instance, this.transportLayer);
          }
          const store = rowFieldStores.stores[name];
          store.updateValue(value[name]);
          if (warning) {
            store.setWarning(warning);
          }
        });
        this.nestedFieldsStores.push(rowFieldStores);
      });
    }
  }

  updateValue(values) {
    this.returnAsNull = false;
    this._setValue(values);
    this.initialValue = this.returnValue;
  }

  addValue() {
    const values = this.returnValue;
    values.push({
      "@type": [this.targetTypes[0]] // By  default we choose the first possible type. This will change in the future
    });
    this._setValue(values);
  }

  deleteItemByIndex(index) {
    if (index >= 0 && index < this.nestedFieldsStores.length) {
      const values = this.returnValue;
      values.splice(index, 1);
      this._setValue(values);
    }
  }

  moveItemUpByIndex(index) {
    if (index > 0 && index < this.nestedFieldsStores.length) {
      const values = this.returnValue;
      const item = values[index];
      values.splice(index, 1);
      values.splice(index-1, 0, item);
      this._setValue(values);
    }
  }

  moveItemDownByIndex(index) {
    if (index >= 0 && index < this.nestedFieldsStores.length -1) {
      const values = this.returnValue;
      const item = values[index];
      values.splice(index, 1);
      values.splice(index+1, 0, item);
      this._setValue(values);
    }
  }

  reset() {
    this.returnAsNull = false;
    this.updateValue(toJS(this.initialValue));
  }

  get hasChanged() {
    return JSON.stringify(toJS(this.returnValue)) !== JSON.stringify(toJS(this.initialValue));
  }

}

export default NestedFieldStore;
