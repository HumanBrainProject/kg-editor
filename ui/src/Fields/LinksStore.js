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

import { observable, action, runInAction, computed, toJS } from "mobx";
import { debounce, remove } from "lodash";

import FieldStore from "./FieldStore";

import API from "../Services/API";
import appStore from "../Stores/AppStore";

const defaultNumberOfVisibleLinks = 10;

class LinksStore extends FieldStore {
  @observable value = [];
  @observable options = [];
  @observable alternatives = [];
  @observable allowCustomValues =  true;
  @observable returnAsNull = false;
  @observable optionsTypes = [];
  @observable optionsExternalTypes = [];
  @observable optionsSearchTerm = "";
  @observable optionsPageStart = 0;
  @observable optionsPageSize = 50;
  @observable optionsCurrentTotal = Infinity;
  @observable fetchingOptions = false;
  @observable lazyShowLinks = false;
  @observable visibleLinks = new Set();
  initialValue = [];
  isLink = true;
  mappingValue = "@id";

  constructor(definition, options, instance) {
    super(definition, options, instance);
    if (definition.allowCustomValues !== undefined) {
      this.allowCustomValues = !!definition.allowCustomValues;
    }
    if (definition.lazyShowLinks !== undefined) {
      this.lazyShowLinks = !!definition.lazyShowLinks;
    } else if (options && options.lazyShowLinks !== undefined) {
      this.lazyShowLinks = !!options.lazyShowLinks;
    }
  }

  @computed
  get definition() {
    return {
      ...super.definition,
      allowCustomValues: this.allowCustomValues,
      lazyShowLinks: this.lazyShowLinks
    };
  }

  @computed
  get clone() {
    return {
      ...super.clone,
      ...this.definition
    };
  }

  @computed
  get returnValue() {
    if (!this.value.length && this.returnAsNull) {
      return null;
    }
    return toJS(this.value);
  }

  @action
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

  @action
  reset() {
    this.value = [...this.initialValue];
  }

  @computed
  get hasChanged() {
    return this.value.length !== this.initialValue.length || this.value.some((val, index) => val === null?(this.initialValue[index] !== null):(val[this.mappingValue] !== this.initialValue[index][this.mappingValue]));
  }

  @computed
  get numberOfValues() {
    return this.value.length;
  }

  @computed
  get hasMoreOptions(){
    return !this.fetchingOptions && this.options.length < this.optionsCurrentTotal;
  }

  @action
  insertValue(value, index) {
    if(value && this.value.length !== undefined && this.value.indexOf(value) === -1){
      if(index !== undefined && index !== -1){
        this.value.splice(index, 0, value);
      } else {
        this.value.push(value);
      }
    }
  }

  @action
  deleteValue(value) {
    if(this.value.length !== undefined){
      remove(this.value, val=>val === value);
    }
  }

  @action
  addValue(value) { // only called when adding new value
    if(!this.disabled && !this.readOnly && this.value.length < this.max) {
      this.insertValue(value);
      if (this.lazyShowLinks) {
        const values = Array.isArray(value)?value:[value];
        values.forEach(v => this.visibleLinks.add(v[this.mappingValue]));
      }
      this.resetOptionsSearch();
    }
  }

  @action
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

  @action
  moveValueAfter(value, afterValue) {
    if(value) {
      this.deleteValue(value);
      this.insertValue(value, this.value.indexOf(afterValue));
      this.resetOptionsSearch();
    }
  }

  @action
  removeValue(value) {
    this.visibleLinks.delete(value[this.mappingValue]);
    this.deleteValue(value);
    this.resetOptionsSearch();
  }

  @action
  removeAllValues() {
    this.visibleLinks.clear();
    this.value = [];
    this.resetOptionsSearch();

  }

  @action
  removeLastValue() {
    if (this.value.length) {
      this.deleteValue(this.value[this.value.length-1]);
      this.resetOptionsSearch();
    }
  }

  @computed
  get links() { // be aware that it may contains null values and null value are needed!
    return this.value.map(value => value && value[this.mappingValue]);
  }

  @action
  showLink(id) {
    this.visibleLinks.add(id);
  }

  @computed
  get numberOfVisibleLinks() {
    return this.visibleLinks.size;
  }

  isLinkVisible = id => this.visibleLinks.has(id);

  @action
  async performSearchOptions(append){
    if(this.fetchingOptions){
      return;
    }
    this.fetchingOptions = true;
    this.optionsPageStart = append?this.options.length:0;
    const payload = this.instance.payload;
    payload["@type"] = this.instance.types.map(t => t.name);
    try{
      const { data: { data: { suggestions: { data: values, total }, types }} } = await API.axios.post(API.endpoints.suggestions(this.instance.id, this.fullyQualifiedName, this.optionsSelectedType, this.optionsSearchTerm, this.optionsPageStart, this.optionsPageSize, payload), payload);
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
          if(type.space.includes(appStore.currentWorkspace.id)) {
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

  @action
  searchOptions(search, force=true){
    this.optionsSearchTerm = search;
    this.options = [];
    this.optionsTypes = [];
    this.optionsExternalTypes = [];
    if (force || search) {
      this._debouncedSearchOptions(false);
    }
  }

  @action
  resetOptionsSearch() {
    this.searchOptions("", false);
  }

  @action
  loadMoreOptions(){
    if(this.hasMoreOptions){
      this.performSearchOptions(true);
    }
  }
}

export default LinksStore;
