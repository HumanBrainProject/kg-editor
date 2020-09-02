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

import { observable, action, runInAction, get, set } from "mobx";
import { union, debounce } from "lodash";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";
import instanceStore from "../Stores/InstanceStore";

class OptionsPool{
  @observable options = new Map();
  @observable isFetchingQueue = false;

  optionsQueue = new Map();
  queueThreshold = 5000;
  queueTimeout = 250;

  getOption(value, mappingValue, mappingLabel){
    if(this.options.has(value[mappingValue])){
      return this.options.get(value[mappingValue]);
    } else {
      this.options.set(value[mappingValue],{[mappingValue]:value[mappingValue], isFetching:false});
      if(value[mappingValue]) {
        this.optionsQueue.set(value[mappingValue], {mappingValue: mappingValue, mappingLabel: mappingLabel});
        this.processQueue();
      }
    }
    return this.options.get(value[mappingValue]);
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
  async fetchOptions(instanceId, field, type, search, start, size, mappingValue, requestBody){
    try {
      const { data: { data: { suggestions: { data: options, totalResults: total }, types }} } = await API.axios.post(API.endpoints.suggestions(instanceId, field, type, start, size, search), requestBody);
      const optionsSet = [];
      Array.isArray(options) && options.forEach(option => {
        if(!this.options.has(option[mappingValue])){
          this.options.set(option[mappingValue], option);
        } else {
          Object.keys(option).forEach(key => {
            if(key === mappingValue){return;}
            set(this.options.get(option[mappingValue]), key, option[key]);
          });
        }
        optionsSet.push(this.options.get(option[mappingValue]));
      });
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
  @observable listPosition = "bottom";
  @observable closeDropdownAfterInteraction = false;
  @observable userInput = "";
  @observable optionsSelectedType = null;
  @observable optionsTypes = [];
  @observable optionsPageStart = 0;
  @observable optionsPageSize = 50;
  @observable optionsCurrentTotal = Infinity;
  @observable fetchingOptions = false;

  lastFetchParams = null;
  lastFetchOptions = [];

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties,["value", "defaultValue", "instanceId", "fullyQualifiedName", "allowCustomValues",
      "mappingValue", "mappingLabel", "mappingReturn", "returnSingle", "max", "listPosition", "closeDropdownAfterInteraction", "userInput"]);
  }

  constructor(fieldData, store, path){
    super(fieldData, store, path);
    this.injectValue(this.value);
  }

  _debouncedFetchOptions = debounce((append)=>{this.fetchOptions(append);}, 250);

  hasMoreOptions(){
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
      this.addValue(optionsPool.getOption(value, this.mappingValue, this.mappingLabel));
    });
  }

  @action
  getOption(value) {
    return optionsPool.getOption(value, this.mappingValue, this.mappingLabel);
  }

  valueLabelRendering = (field, value, valueLabelRendering) => {
    if (instanceStore.instances.has(value.id)) {
      const instance = instanceStore.instances.get(value.id);
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
  async fetchOptions(append){
    if(this.fetchingOptions){
      return;
    }
    this.fetchingOptions = true;
    this.optionsPageStart = append?this.options.length:0;
    const payload = this.store.getValues();
    payload["@type"] = this.store.structure.types.map(t => t.name);
    const {options, total, types} = await optionsPool.fetchOptions(this.instanceId, this.fullyQualifiedName, this.optionsSelectedType, this.userInput, this.optionsPageStart, this.optionsPageSize, this.mappingValue, payload);
    runInAction(()=>{
      if (append) {
        this.options = this.options.concat(options);
      } else {
        this.options = options;
      }
      this.optionsTypes = types;
      this.optionsCurrentTotal = total;
      this.fetchingOptions = false;
    });
  }

  @action
  setUserInput(userInput){
    this.userInput = userInput;
    this.options = [];
    this._debouncedFetchOptions(false);
  }

  @action
  loadMoreOptions(){
    if(this.hasMoreOptions()){
      this.fetchOptions(true);
    }
  }
}

export default DynamicDropdownField;
