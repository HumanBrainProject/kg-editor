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

import { observable, action, runInAction, set, computed } from "mobx";
import { find, union, debounce, remove } from "lodash";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";

export default class KgTableStore extends FormStore.typesMapping.Default{
    @observable value = [];
    @observable options = [];
    @observable instances = []
    @observable allowCustomValues =  false;
    @observable mappingValue = "value";
    @observable mappingLabel = "label";
    @observable mappingReturn = null;
    @observable max = Infinity;
    @observable listPosition = "bottom";
    @observable closeDropdownAfterInteraction = false;
    @observable userInput = "";
    @observable optionsPageStart = 0;
    @observable optionsPageSize = 50;
    @observable optionsCurrentTotal = Infinity;
    @observable fetchingOptions = false;
    @observable visibleInstances = 0;
    @observable instancesMap = new Map();
    @observable isFetchingQueue = false;
    @observable defaultVisibleInstances = 10;
    @observable isInteractive = false;

    instancesQueue = new Set();
    queueThreshold = 5000;
    queueTimeout = 250;

    __emptyValue = () => [];

    static get properties(){
      return union(super.properties,["value", "options",  "allowCustomValues", "mappingValue", "mappingLabel", "mappingReturn", "max", "listPosition", "closeDropdownAfterInteraction", "userInput"]);
    }

    constructor(fieldData, store, path){
      super(fieldData, store, path);
      this.injectValue(this.value);
    }

    @computed
    get columns() {
      if(this.isInitialized && !this.hasInitializationError) {
        let columns = this.instances[0].promotedFields.map(name => ({name: name, label: this.instances[0][name].label}));
        columns.push({name: "delete", label: ""});
        return columns;
      }
      return [
        {name: "id", label: "Name"},
        {name: "delete", label: ""}
      ];
    }

    @computed
    get visibleInstancesCount() {
      const defaultInstances = this.defaultVisibleInstances > this.instances.length ? this.instances.length:this.defaultVisibleInstances;
      let count = defaultInstances + this.visibleInstances;
      for(let i=0; i<defaultInstances && i<this.instances.length; i++ ) {
        const instance = this.instances[i];
        if(instance && instance.show) {
          count--;
        }
      }
      return count;
    }

    @computed
    get isInitialized() {
      return this.hasInitializationError || this.instances.length && this.instances[0].promotedFields.length>0;
    }

    @computed
    get hasInitializationError() {
      return this.instances.length && this.instances[0].fetchError;
    }

    @computed
    get list() {
      return this.instances.map(instance => {
        const row = {id:instance.id, instance: instance};
        if(!instance.isFetching && instance.isFetched) {
          this.columns.forEach(col => {
            if(col.name !== "delete") {
              row[col.name] = instance[col.name].value;
            }
          });
        }
        return row;
      });
    }

    addInstance(value, mappingValue){
      const id = value[mappingValue];
      if(this.instancesMap.has(id)){
        const instance = this.instancesMap.get(id);
        if(!this.instances.some(instance => instance.id === id)) {
          this.instances.push(instance);
        }
        return instance;
      } else {
        this.instancesMap.set(id, {id: id, mappingValue: mappingValue, fetchError:null, isFetching:false, isFetched:false, promotedFields:[], show:false});
        const instance = this.instancesMap.get(id);
        this.instances.push(instance);
        this.fetchInstance(instance);
        return instance;
      }
    }

    isInstanceVisilbe = (index, instanceId) => {
      if(index < this.defaultVisibleInstances) {
        return true;
      }
      const instance = this.instancesMap.get(instanceId);
      return instance && instance.show;
    }

    hasMoreOptions(){
      return !this.fetchingOptions && this.options.length < this.optionsCurrentTotal;
    }

    fetchInstance(instance){
      this.instancesQueue.add(instance.id);
      this.processQueue();
    }

    _debouncedFetchQueue = debounce(()=>{this.fetchQueue();}, this.queueTimeout);

    _debouncedFetchOptions = debounce((append)=>{this.fetchOptions(append);}, 250);

    @action
    removeInstance(id) {
      this.instancesMap.delete(id);
      remove(this.instances, instance=> instance.id === id);
    }

    @action
    processQueue(){
      if(this.instancesQueue.size <= 0){
        this._debouncedFetchQueue.cancel();
      } else if(this.instancesQueue.size < this.queueThreshold){
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
      let toProcess = Array.from(this.instancesQueue).splice(0, this.queueThreshold);
      toProcess.forEach(identifier => {
        const instance = this.instancesMap.get(identifier);
        instance.isFetching = true;
        instance.fetchError = null;
      });
      try{
        let response = await API.axios.post(API.endpoints.listedInstances(true), toProcess);
        runInAction(() =>{
          // if(Math.round(Math.random()*10) %2 === 0) {
          //   console.log("error");
          //   throw "error";
          // }
          toProcess.forEach(identifier => {
            const instance = this.instancesMap.get(identifier);
            const instanceData = find(response.data.data, (item) => item.fields[instance.mappingValue].nexus_id === identifier);
            if(instanceData){
              const promotedFields = instanceData.ui_info && instanceData.ui_info.promotedFields;
              set(instance, "promotedFields", promotedFields);
              Object.keys(instanceData.fields).forEach(key => {
                if(key === instance.mappingValue){return;}
                if(promotedFields.includes(key)){
                  set(instance, key, instanceData.fields[key]);
                }
              });
              set(instance, "isFetched", true);
            } else {
              set(instance, "fetchError", `Error fetching instance ${identifier}`);
            }
            set(instance, "isFetching", false);
            this.instancesQueue.delete(identifier);
          });
          this.isFetchingQueue = false;
          this.processQueue();
        });
      } catch(e){
        runInAction(() =>{
          toProcess.forEach(identifier => {
            const instance = this.instancesMap.get(identifier);
            set(instance, "fetchError", `Error fetching instance ${identifier} (${e.message?e.message:e})`);
            set(instance, "isFetching", false);
            this.instancesQueue.delete(identifier);
          });
          this.isFetchingQueue = false;
          this.processQueue();
        });
      }
    }

    @action
    injectValue(value){
      if(value !== undefined){
        this.registerProvidedValue(value, true);
      }
      this.value = this.__emptyValue();

      let providedValue = this.getProvidedValue();
      this.instances = [];
      providedValue.forEach(value => {
        if(!value || this.value.length >= this.max){
          return;
        }
        const instance = this.addInstance(value, this.mappingValue);
        this.addValue(instance);
      });
    }

    @action
    showInstance(instanceId) {
      const instance = this.instancesMap.get(instanceId);
      if(!instance.show) {
        instance.show = true;
        this.visibleInstances++;
      }
    }

    @action
    async fetchOptions(append){
      this.fetchingOptions = true;
      this.optionsPageStart = append?this.options.length:0;
      const payload = this.store.getValues();
      const field = this.path.replace(FormStore.getPathNodeSeparator(),"");
      const { data } = await API.axios.post(API.endpoints.suggestions(this.instanceType, field, this.instancesPath, this.optionsPageStart, this.optionsPageSize, this.userInput), payload);
      runInAction(()=>{
        if(append){
          this.options = this.options.concat(data.results);
        } else {
          this.options = data.results;
        }
        this.optionsCurrentTotal = data.total;
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
