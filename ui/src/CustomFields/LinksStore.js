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

import { observable, action, runInAction, computed } from "mobx";
import { union, debounce } from "lodash";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";
import appStore from "../Stores/AppStore";
import instanceStore from "../Stores/InstanceStore";

const defaultNumberOfVisibleLinks = 10;

class LinksStore extends FormStore.typesMapping.Default{
  @observable value = [];
  @observable options = [];
  @observable instanceId = null;
  @observable fullyQualifiedName = null;
  @observable allowCustomValues =  false;
  @observable mappingValue = "value";
  @observable mappingLabel = "label";
  @observable mappingReturn = null;
  @observable returnSingle = false;
  @observable max = Infinity;
  @observable optionsTypes = [];
  @observable optionsExternalTypes = [];
  @observable optionsSearchTerm = "";
  @observable optionsPageStart = 0;
  @observable optionsPageSize = 50;
  @observable optionsCurrentTotal = Infinity;
  @observable fetchingOptions = false;

  @observable lazyShowLinks = false;
  @observable visibleLinks = new Set();

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties,["value", "defaultValue", "instanceId", "fullyQualifiedName", "allowCustomValues",
      "mappingValue", "mappingLabel", "mappingReturn", "returnSingle", "max", "lazyShowLinks"]);
  }

  constructor(fieldData, store, path){
    super(fieldData, store, path);
    this.injectValue(this.value);
  }

  @action
  injectValue(value){ // call in constructor
    if(value !== undefined){
      this.registerProvidedValue(value, true);
    }
    this.value = this.__emptyValue();
    if (this.lazyShowLinks) {
      this.visibleLinks.clear();
    }
    const providedValue = this.getProvidedValue();
    providedValue.forEach((value, index) => {
      if(!value || this.value.length >= this.max){
        return;
      }
      super.addValue(value);
      if (this.lazyShowLinks && index < defaultNumberOfVisibleLinks) {
        this.visibleLinks.add(value[this.mappingValue]);
      }
    });
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
  addValue(value) { // only called when adding new value
    if(!this.disabled && !this.readOnly && this.value.length < this.max) {
      super.addValue(value);
      if (this.lazyShowLinks) {
        const values = (typeof value === "object")?[value]:value;
        values.forEach(v => this.visibleLinks.add(v[this.mappingValue]));
      }
      this.resetOptionsSearch();
    }
  }

  @action
  setValues(values) {
    if(!this.disabled && !this.readOnly) {
      super.setValue(values);
      if (this.lazyShowLinks) {
        this.visibleLinks.clear();
        for (let i=0; i<defaultNumberOfVisibleLinks && i<values.length; i++) {
          this.visibleLinks.add(values[i][this.mappingValue]);
        }
      }
      this.resetOptionsSearch();
    }
  }

  @action
  moveValueAfter(value, afterValue) {
    if(!this.disabled && !this.readOnly && value) {
      super.removeValue(value);
      super.addValue(value, this.value.indexOf(afterValue));
      this.resetOptionsSearch();
    }
  }

  @action
  removeValue(value) {
    if(!this.disabled && !this.readOnly) {
      this.visibleLinks.delete(value[this.mappingValue]);
      super.removeValue(value);
      this.resetOptionsSearch();
    }
  }

  @action
  removeAllValues() {
    if(!this.disabled && !this.readOnly) {
      this.visibleLinks.clear();
      super.setValue([]);
      this.resetOptionsSearch();
    }
  }

  @action
  removeLastValue() {
    if(!this.disabled && !this.readOnly) {
      if (this.value.length) {
        super.removeValue(this.value[this.value.length-1]);
        this.resetOptionsSearch();
      }
    }
  }

  @computed
  get links() { // be aware that it may contains null values and null value are needed!
    return this.value.map(value => value[this.mappingValue]);
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
  async search(instanceId, field, type, search, start, size, requestBody){
    try {
      const { data: { data: { suggestions: { data: values, total }, types }} } = await API.axios.post(API.endpoints.suggestions(instanceId, field, type, start, size, search), requestBody);
      return {options: Array.isArray(values)?values:[], total: total, types: types};
    } catch (e) {
      return {options: [], total: 0, types: [], error: e};
    }
  }

  @action
  async performSearchOptions(append){
    if(this.fetchingOptions){
      return;
    }
    this.fetchingOptions = true;
    this.optionsPageStart = append?this.options.length:0;
    const payload = this.store.getValues();
    const instance = instanceStore.instances.get(this.instanceId);
    payload["@type"] = instance.types.map(t => t.name);
    const {options, total, types} = await this.search(this.instanceId, this.fullyQualifiedName, this.optionsSelectedType, this.optionsSearchTerm, this.optionsPageStart, this.optionsPageSize, payload);
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
