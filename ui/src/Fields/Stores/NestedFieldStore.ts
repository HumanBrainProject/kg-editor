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

import {faGlobe} from '@fortawesome/free-solid-svg-icons/faGlobe';
import { observable, action, computed, makeObservable, toJS } from 'mobx';
import { fieldsMapping } from '..';
import FieldStore from './FieldStore';
import type { FieldStores, NestedInstanceStores } from './FieldStore';
import type { WidgetOptions} from '..';
import type API from '../../Services/API';
import type Instance from '../../Stores/Instance';
import type RootStore from '../../Stores/RootStore';
import type { FieldStoreDefinition, SimpleType, StructureOfField } from '../../types';

interface Messages {
  numberOfItems?: string;
}

interface Value {
  [key: string]: any[];
}

class NestedFieldStore extends FieldStore {
  fieldsTemplate = {};
  initialValue: Value[] = [];
  returnAsNull = false;
  nestedFieldsStores: NestedInstanceStores[] = [];
  targetTypes?: SimpleType[] = [];
  minItems?: number;
  maxItems?: number;
  labelField?: string;

  constructor(definition: FieldStoreDefinition, options: WidgetOptions, instance: Instance, api: API, rootStore: RootStore) {
    super(definition, options, instance, api, rootStore);
    this.fieldsTemplate = definition.fields;
    this.targetTypes = definition.targetTypes;
    this.minItems = definition.minItems;
    this.maxItems = definition.maxItems;
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
      addValue: action,
      deleteItemByIndex: action,
      moveItemUpByIndex: action,
      moveItemDownByIndex: action,
      resolvedTargetTypes: computed,
      requiredValidationWarning: computed,
      minItems: observable,
      maxItems: observable,
      validationWarnings: computed,
      numberOfItemsWarning: computed,
      hasValidationWarnings: computed
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
    return this.nestedFieldsStores.map(row => Object.values(row.stores).reduce((acc, store) => {
      acc[store.fullyQualifiedName] = store.returnValue;
      return acc;
    }, {'@type': row['@type']} as Value));
  }

  get numberOfItemsWarning() {
    if(!this.minItems && !this.maxItems) {
      return false;
    }
    return this.minItems??this.maxItems;
  }

  get validationWarnings() {
    const messages: Messages = {};
    if (this.shouldCheckValidation) {
      if(this.numberOfItemsWarning) {
        if(this.minItems && this.maxItems) {
          if(this.nestedFieldsStores.length < this.minItems || this.nestedFieldsStores.length > this.maxItems) {
            messages.numberOfItems = `Number of items should be between ${this.minItems} and ${this.maxItems}`;
          }
        } else if(this.minItems && this.nestedFieldsStores.length < this.minItems) {
          messages.numberOfItems = `Number of items should be bigger than ${this.minItems}`;
        } else if(this.maxItems && this.nestedFieldsStores.length > this.maxItems) {
          messages.numberOfItems = `Number of items should be smaller than ${this.maxItems}`;
        }
      }
    }
    return messages;
  }

  get hasValidationWarnings() {
    return Object.keys(this.validationWarnings).length > 0;
  }

  get resolvedTargetTypes() {
    return (this.targetTypes?this.targetTypes.map(simpleType => this.rootStore.typeStore.typesMap.get(simpleType.name)).filter(type => !!type):[]) as SimpleType[];
  }

  getType(types: string[]) {
    const typeName = (Array.isArray(types) && types.length)?types[0]:null; // for embeded: value should only belong to a single type.
    return typeName && this.rootStore.typeStore.typesMap.get(typeName);
  }

  _addNestedStore = (stores: FieldStores, name: string, template: StructureOfField, value: Value) => {
    const field = JSON.parse(JSON.stringify(toJS(template)));
    let warning = null;
    if(name === this.labelField) {
      field.labelTooltip = 'This field will be publicly accessible for every user. (Even for users without read access)';
      field.labelTooltipIcon = faGlobe;
    }
    if (!stores[name]) {
      if (!field.widget) {
        warning = `no widget defined for field "${name}" of type "${this.instance?.primaryType.name}"!`;
        field.widget = 'UnsupportedField';
      } else if (!fieldsMapping[field.widget]) {
        warning = `widget "${field.widget}" defined in field "${name}" of type "${this.instance?.primaryType.name}" is not supported!`;
        field.widget = 'UnsupportedField';
      }
      const fieldMapping = fieldsMapping[field.widget];
      if(field.widget === 'Nested') {
        const type = this.getType(value['@type']);
        if(type) {
          const fields = JSON.parse(JSON.stringify(toJS(type.fields)));
          field.fields = fields;
        }
      }
      const options = {...fieldMapping.options, sourceType: value['@type']};
      stores[name] = new fieldMapping.Store(field, options, this.instance, this.api, this.rootStore);
    }
    const store = stores[name];
    store.updateValue(value[name]);
    if (warning) {
      store.setWarning(warning);
    }
  };

  _setValue(values: Value[]) {
    this.nestedFieldsStores = [];
    if(values) {
      values.forEach(value => {
        const rowFieldStores = {stores: {}, '@type': value['@type']} as NestedInstanceStores;
        const type = this.getType(value['@type']);
        if (type) {
          const fieldsTemplate = type.fields;
          Object.entries(fieldsTemplate).forEach(([name, template]) => this._addNestedStore(rowFieldStores.stores, name, template, value));
          this.nestedFieldsStores.push(rowFieldStores);
        }
      });
    }
  }

  updateValue(values: Value[]) {
    this.returnAsNull = false;
    this._setValue(values);
    this.initialValue = this.returnValue;
  }

  addValue(type: string) {
    const values = this.returnValue;
    values.push({
      '@type': [type] // for embeded: value should only belong to a single type.
    });
    this._setValue(values);
  }

  deleteItemByIndex(index: number) {
    if (index >= 0 && index < this.nestedFieldsStores.length) {
      const values = this.returnValue;
      values.splice(index, 1);
      this._setValue(values);
    }
  }

  moveItemUpByIndex(index: number) {
    if (index > 0 && index < this.nestedFieldsStores.length) {
      const values = this.returnValue;
      const item = values[index];
      values.splice(index, 1);
      values.splice(index-1, 0, item);
      this._setValue(values);
    }
  }

  moveItemDownByIndex(index: number) {
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

  get shouldCheckValidation() {
    return !!this.initialValue.length || this.hasChanged;
  }

}

export default NestedFieldStore;
