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

import { observable, action, runInAction, get, set, computed } from "mobx";
import { union, debounce } from "lodash";
import { FormStore } from "hbp-quickfire";

import API from "../../Services/API";
import instanceStore from "../../Stores/InstanceStore";
import appStore from "../../Stores/AppStore";

class OptionsPool{
  @observable options = new Map();
  @observable isFetchingQueue = false;

  optionsQueue = new Map();
  queueThreshold = 5000;
  queueTimeout = 250;

  getOption(id, mappingValue, mappingLabel){
    if(this.options.has(id)){
      return this.options.get(id);
    } else {
      this.options.set(id, {[mappingValue]:id, isFetching:false});
      this.optionsQueue.set(id, {mappingValue: mappingValue, mappingLabel: mappingLabel});
      this.processQueue();
    }
    return this.options.get(id);
  }

  _debouncedFetchQueue = debounce(()=>{this.fetchQueue();}, this.queueTimeout);

  @action
  processQueue(){
    if(this.optionsQueue.size <= 0){
      this._debouncedFetchQueue.cancel();
    } else if(this.optionsQueue.size < this.queueThreshold){
      this._debouncedFetchQueue();
    } else if(!this.isFetchingQueue){
      this._debouncedFetchQueue.cancel();
      this.fetchQueue();
    }
  }

  @action
  async fetchQueue(){
    if(this.isFetchingQueue){
      return;
    }
    this.isFetchingQueue = true;
    let toProcess = Array.from(this.optionsQueue.keys()).splice(0, this.queueThreshold);
    toProcess.forEach(identifier => {
      set(this.options.get(identifier), "isFetching", true);
    });
    try{
      const response = await API.axios.post(API.endpoints.instancesLabel(), toProcess);
      runInAction(() => {
        toProcess.forEach(identifier => {
          const option = this.options.get(identifier);
          const optionQueueItem = this.optionsQueue.get(identifier);
          const mappingValue = optionQueueItem.mappingValue;
          const mappingLabel = optionQueueItem.mappingLabel;
          const optionData =  response && response.data && response.data.data && response.data.data[identifier];
          if(optionData){ // TODO: check data and adapt code in consequence
            if(optionData.error) {
              const message = JSON.stringify(optionData.error.message); // TODO: check and handle properly error object
              set(option, mappingLabel, message);
              set(option, "fetchError", true);
            } else {
              Object.keys(optionData).forEach(key => {
                if(key === mappingValue){return;}
                set(option, key, optionData[key]);
              });
            }
          } else {
            set(option, mappingLabel, "Not found");
            set(option, "fetchError", true);
          }
          set(this.options.get(identifier), "isFetching", false);
          this.optionsQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(identifier => {
          const option = this.options.get(identifier);
          set(option, "fetchError", true);
          set(option, "isFetching", false);
          this.optionsQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    }
  }

  @action
  async search(instanceId, field, type, search, start, size, requestBody){
    try {
      const { data: { data: { suggestions: { data: values, total }, types }} } = await API.axios.post(API.endpoints.suggestions(instanceId, field, type, start, size, search), requestBody);
      const optionsSet = Array.isArray(values) ? values.map(value => {
        let option = this.options.get(value.id);
        if(!option){
          this.options.set(value.id, value);
          option = this.options.get(value.id);
        } else {
          Object.entries(value).forEach(([key, val]) => key !== "id" && set(option, key, val));
        }
        return option;
      }): [];
      return {options: optionsSet, total: total, types: types};
    } catch (e) {
      return {options: [], total: 0, types: [], error: e};
    }
  }
}

const optionsPool = new OptionsPool();

class DynamicDropdownField extends FormStore.typesMapping.Default{
  @observable value = [];
  @observable defaultValue = [];
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

  lastFetchParams = null;
  lastFetchOptions = [];

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties,["value", "defaultValue", "instanceId", "fullyQualifiedName", "allowCustomValues",
      "mappingValue", "mappingLabel", "mappingReturn", "returnSingle", "max"]);
  }

  constructor(fieldData, store, path){
    super(fieldData, store, path);
    this.injectValue(this.value);
  }

  _debouncedSearchOptions = debounce(append=>{this.performSearchOptions(append);}, 250);

  @computed
  get hasMoreOptions(){
    return !this.fetchingOptions && this.options.length < this.optionsCurrentTotal;
  }

  @action
  injectValue(value){
    if(value !== undefined){
      this.registerProvidedValue(value, true);
    }
    this.value = this.__emptyValue();

    let providedValue = this.getProvidedValue();
    providedValue.forEach(value => {
      if(!value || this.value.length >= this.max){
        return;
      }
      const id = value[this.mappingValue];
      const option = optionsPool.getOption(id, this.mappingValue, this.mappingLabel);
      this.addValue(option);
    });
  }

  @action
  getOption(value) {
    const id = value[this.mappingValue];
    return optionsPool.getOption(id, this.mappingValue, this.mappingLabel);
  }

  valueLabelRendering = (field, value, valueLabelRendering) => {
    if (instanceStore.instances.has(value["@id"])) {
      const instance = instanceStore.instances.get(value["@id"]);
      if (instance && instance.isFetched) {
        const labelFieldName = instance.labelField;
        const labelField = labelFieldName && instance.fields && instance.fields[labelFieldName];
        if (labelField) {
          return labelField.value;
        }
      }
    }
    return typeof valueLabelRendering === "function"?
      valueLabelRendering(field, value)
      :
      get(value, field.mappingLabel);
  }

  @action
  async performSearchOptions(append){
    if(this.fetchingOptions){
      return;
    }
    this.fetchingOptions = true;
    this.optionsPageStart = append?this.options.length:0;
    const payload = this.store.getValues();
    payload["@type"] = this.store.structure.types.map(t => t.name);
    const {options, total, types} = await optionsPool.search(this.instanceId, this.fullyQualifiedName, this.optionsSelectedType, this.optionsSearchTerm, this.optionsPageStart, this.optionsPageSize, payload);
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

export default DynamicDropdownField;
