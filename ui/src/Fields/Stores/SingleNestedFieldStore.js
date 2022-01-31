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

import { observable, action, computed, makeObservable, toJS } from "mobx";
import FieldStore from "./FieldStore";
import { fieldsMapping } from "../../Fields";
class NestedFieldStore extends FieldStore {
  fieldsTemplate = {};
  initialValue = null;
  returnAsNull = false;
  nestedFieldsStores = [];
  targetTypes = [];

  constructor(definition, options, instance, transportLayer, rootStore) {
    super(definition, options, instance, transportLayer, rootStore);
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
      shouldCheckValidation: computed,
      add: action,
      delete: action,
      resolvedTargetTypes: computed,
      requiredValidationWarning: computed
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
      value: toJS(this.initialValue)
    };
  }

  get returnValue() {
    if (!this.nestedFieldsStores) {
        return null;
    }
    return Object.values(this.nestedFieldsStores.stores).reduce((acc, store) => {
        acc[store.fullyQualifiedName] = store.returnValue;
        return acc;
    }, {"@type": this.nestedFieldsStores["@type"]});
  }

  get resolvedTargetTypes() {
    return this.targetTypes.map(simpleType => this.rootStore.typeStore.typesMap.get(simpleType.name)).filter(type => !!type);
  }

  getType(types) {
    const typeName = (Array.isArray(types) && types.length)?types[0]:null; // for embeded: value should only belong to a single type.
    return typeName && this.rootStore.typeStore.typesMap.get(typeName);
  }

  _setValue(value) {
    if(!value) {
        this.nestedFieldsStores = null;
    } else {
    this.nestedFieldsStores = {stores: {}, "@type": value["@type"]};
      const type = this.getType(value["@type"]);
      if (type) {
          const fieldsTemplate = type.fields;
          Object.entries(fieldsTemplate).forEach(([name, fieldTemplate]) => {
          const field = JSON.parse(JSON.stringify(toJS(fieldTemplate)));
          let warning = null;
          if(name === this.labelField) {
              field.labelTooltip = "This field will be publicly accessible for every user. (Even for users without read access)";
              field.labelTooltipIcon = "globe";
          }
          if (!this.nestedFieldsStores[name]) {
              if (!field.widget) {
                warning = `no widget defined for field "${name}" of type "${this.instance.primaryType.name}"!`;
                field.widget = "UnsupportedField";
              } else if (!fieldsMapping[field.widget]) {
                warning = `widget "${field.widget}" defined in field "${name}" of type "${this.instance.primaryType.name}" is not supported!`;
                field.widget = "UnsupportedField";
              }
              const fieldMapping = fieldsMapping[field.widget];
              if(field.widget === "Nested") {
                const type = this.getType(value["@type"]);
                if(type) {
                    const fields = JSON.parse(JSON.stringify(toJS(type.fields)));
                    field.fields = fields;
                }
              }
              const options = {...fieldMapping.options, sourceType: value["@type"]};
              this.nestedFieldsStores.stores[name] = new fieldMapping.Store(field, options, this.instance, this.transportLayer, this.rootStore);
          }
          const store = this.nestedFieldsStores.stores[name];
          store.updateValue(value[name]);
          if (warning) {
            store.setWarning(warning);
          }
        });
      }
    }
  }

  updateValue(value) {
    this.returnAsNull = false;
    this._setValue(value);
    this.initialValue = this.returnValue;
  }

  add(type) {
    this._setValue({"@type": [type]});
  }

  delete() {
    this._setValue(null);
  }

  reset() {
    this.returnAsNull = false;
    this.updateValue(toJS(this.initialValue));
  }

  get hasChanged() {
    return JSON.stringify(toJS(this.returnValue)) !== JSON.stringify(toJS(this.initialValue));
  }

  get shouldCheckValidation() {
    return this.initialValue !== null || this.hasChanged;
  }

}

export default NestedFieldStore;
