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


import { observable, action, runInAction, computed, toJS, makeObservable } from "mobx";
import debounce from "lodash/debounce";

import FieldStore from "./FieldStore";

const defaultNumberOfVisibleLinks = 10;

class LinksStore extends FieldStore {
  value = [];
  options = [];
  allowCustomValues = true;
  returnAsNull = false;
  optionsTypes = [];
  optionsExternalTypes = [];
  optionsSearchTerm = "";
  optionsPageStart = 0;
  optionsPageSize = 50;
  optionsCurrentTotal = Infinity;
  fetchingOptions = false;
  lazyShowLinks = false;
  visibleLinks = new Set();
  initialValue = [];
  isLink = true;
  mappingValue = "@id";

  appStore = null;

  constructor(definition, options, instance, transportLayer) {
    super(definition, options, instance, transportLayer);

    makeObservable(this, {
      value: observable,
      options: observable,
      allowCustomValues: observable,
      returnAsNull: observable,
      optionsTypes: observable,
      optionsExternalTypes: observable,
      optionsSearchTerm: observable,
      optionsPageStart: observable,
      optionsPageSize: observable,
      optionsCurrentTotal: observable,
      fetchingOptions: observable,
      lazyShowLinks: observable,
      visibleLinks: observable,
      initialValue: observable,
      cloneWithInitialValue: computed,
      returnValue: computed,
      updateValue: action,
      reset: action,
      hasChanged: computed,
      requiredValidationWarning: computed,
      warningMessages: computed,
      numberOfItemsWarning: computed,
      numberOfValues: computed,
      hasMoreOptions: computed,
      insertValue: action,
      deleteValue: action,
      addValue: action,
      setValues: action,
      moveValueAfter: action,
      removeValue: action,
      removeAllValues: action,
      removeLastValue: action,
      links: computed,
      showLink: action,
      numberOfVisibleLinks: computed,
      performSearchOptions: action,
      searchOptions: action,
      resetOptionsSearch: action,
      loadMoreOptions: action
    });

    if (definition.allowCustomValues !== undefined) {
      this.allowCustomValues = !!definition.allowCustomValues;
    }
    if (definition.lazyShowLinks !== undefined) {
      this.lazyShowLinks = !!definition.lazyShowLinks;
    } else if (options && options.lazyShowLinks !== undefined) {
      this.lazyShowLinks = !!options.lazyShowLinks;
    }
  }

  get definition() {
    return {
      ...super.definition,
      allowCustomValues: this.allowCustomValues,
      lazyShowLinks: this.lazyShowLinks
    };
  }

  get cloneWithInitialValue() {
    return {
      ...this.definition,
      value: [...toJS(this.initialValue)]
    };
  }

  get returnValue() {
    if (!this.value.length && this.returnAsNull) {
      return null;
    }
    return toJS(this.value);
  }

  get requiredValidationWarning() {
    if(!this.isRequired) {
      return false;
    }
    if(this.value.length === 0) {
      return true;
    }
    return false;
  }

  get numberOfItemsWarning() {
    if(!this.minItems && !this.maxItems) {
      return false;
    }
    if(this.minItems || this.maxItems) {
      return true;
    }
    return false;
  }

  get warningMessages() {
    const messages = {};
    if(this.numberOfItemsWarning) {
      if(this.minItems && this.maxItems) {
        if(this.value.length < this.minItems || this.value.length > this.maxItems) {
          messages.numberOfItems = `Number of values should be between ${this.minItems} and ${this.maxItems}`;
        }
      } else if(this.value.length < this.minItems) {
        messages.numberOfItems = `Number of values should be bigger than ${this.minItems}`;
      } else if(this.value.length > this.maxItems) {
        messages.numberOfItems = `Number of values should be smaller than ${this.minItems}`;
      }
    }
    return messages;
  }

  updateValue(value) {
    this.returnAsNull = false;
    const values = Array.isArray(value)?value:(value !== null && value !== undefined && typeof value === "object"?[value]:[]);
    this.initialValue = [...values];
    this.value = values;
    if (this.lazyShowLinks) {
      this.visibleLinks.clear();
    }
    values.forEach((value, index) => {
      if (this.lazyShowLinks && index < defaultNumberOfVisibleLinks) {
        if (value[this.mappingValue]) {
          this.visibleLinks.add(value[this.mappingValue]);
        }
      }
    });
  }

  reset() {
    this.returnAsNull = false;
    this.value = [...this.initialValue];
  }

  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val[this.mappingValue] !== this.initialValue[index][this.mappingValue]));
  }

  get numberOfValues() {
    return this.value.length;
  }

  get hasMoreOptions() {
    return !this.fetchingOptions && this.options.length < this.optionsCurrentTotal;
  }

  insertValue(value, index) {
    if(value && this.value.length !== undefined && this.value.indexOf(value) === -1){
      if(index !== undefined && index !== -1){
        this.value.splice(index, 0, value);
      } else {
        this.value.push(value);
      }
    }
  }

  deleteValue(value) {
    if(this.value.length !== undefined){
      this.value = this.value.filter(val => val !== value);
    }
  }

  addValue(value) {
    this.insertValue(value);
    if (this.lazyShowLinks) {
      const values = Array.isArray(value)?value:[value];
      values.forEach(v => this.visibleLinks.add(v[this.mappingValue]));
    }
    this.resetOptionsSearch();
  }

  setValues(values) {
    if (values !== null && values !== undefined) {
      if (values.length  || !this.returnAsNull) {
        this.returnAsNull = false;
        this.value = values;
        if (this.lazyShowLinks) {
          this.visibleLinks.clear();
          for (let i=0; i<defaultNumberOfVisibleLinks && i<values.length; i++) {
            this.visibleLinks.add(values[i][this.mappingValue]);
          }
        }
      }
    } else  {
      this.returnAsNull = true;
      this.value = [];
      if (this.lazyShowLinks) {
        this.visibleLinks.clear();
      }
    }
    this.resetOptionsSearch();
  }

  moveValueAfter(value, afterValue) {
    if(value) {
      this.deleteValue(value);
      this.insertValue(value, this.value.indexOf(afterValue));
      this.resetOptionsSearch();
    }
  }

  removeValue(value) {
    this.visibleLinks.delete(value[this.mappingValue]);
    this.deleteValue(value);
    this.resetOptionsSearch();
  }

  removeAllValues() {
    this.setValues(null);
  }

  removeLastValue() {
    if (this.value.length) {
      this.deleteValue(this.value[this.value.length-1]);
      this.resetOptionsSearch();
    }
  }

  get links() { // be aware that it may contains null values and null value are needed!
    return this.value.map(value => value && value[this.mappingValue]);
  }

  showLink(id) {
    this.visibleLinks.add(id);
  }

  get numberOfVisibleLinks() {
    return this.visibleLinks.size;
  }

  isLinkVisible = id => this.visibleLinks.has(id);

  async performSearchOptions(append) {
    if(this.fetchingOptions){
      return;
    }
    this.fetchingOptions = true;
    this.optionsPageStart = append?this.options.length:0;
    const payload = this.instance.payload;
    payload["@type"] = this.instance.types.map(t => t.name);
    try{
      const { data: { data: { suggestions: { data: values, total }, types }} } = await this.transportLayer.getSuggestions(this.instance.id, this.fullyQualifiedName, this.optionsSelectedType, this.optionsPageStart, this.optionsPageSize, this.optionsSearchTerm, payload);
      const options = Array.isArray(values)?values:[];
      runInAction(()=>{
        if (append) {
          this.options = this.options.concat(options);
        } else {
          this.options = options;
        }
        this.optionsTypes = [];
        this.optionsExternalTypes = [];
        Object.values(types).forEach(type => {
          if(type.space.includes(this.instance.workspace)) {
            this.optionsTypes.push(type);
          } else {
            this.optionsExternalTypes.push(type);
          }
        });
        this.optionsCurrentTotal = total;
        this.fetchingOptions = false;
      });
    } catch(e) {
      this.options = [];
      this.optionsCurrentTotal = 0;
      this.optionsTypes = [];
      this.optionsExternalTypes = [];
    }
  }

  _debouncedSearchOptions = debounce(append=>{this.performSearchOptions(append);}, 250);

  searchOptions(search, force=true) {
    this.optionsSearchTerm = search;
    this.options = [];
    this.optionsTypes = [];
    this.optionsExternalTypes = [];
    if (force || search) {
      this._debouncedSearchOptions(false);
    }
  }

  resetOptionsSearch() {
    this.searchOptions("", false);
  }

  loadMoreOptions() {
    if(this.hasMoreOptions){
      this.performSearchOptions(true);
    }
  }
}

export default LinksStore;
