import { observable, action, runInAction, set } from "mobx";
import { find, union, debounce } from "lodash";
import console from "../Services/Logger";
import { FormStore } from "hbp-quickfire";
import API from "../Services/API";

class OptionsPool{
  @observable options = new Map();
  optionsQueue = new Map();
  queueThreshold = 20;
  queueTimeout = 250;
  isFetchingQueue = false;

  getOption(value, mappingValue){
    if(this.options.has(value[mappingValue])){
      return this.options.get(value[mappingValue]);
    } else {
      this.optionsQueue.set(value[mappingValue], {mappingValue: mappingValue});
      this.options.set(value[mappingValue],{[mappingValue]:value[mappingValue], isFetching:false});
      this.processQueue();
    }
    return this.options.get(value[mappingValue]);
  }

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

  _debouncedFetchQueue = debounce(()=>{this.fetchQueue();}, this.queueTimeout);

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
      let response = await API.axios.post(API.endpoints.listedInstances(), toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          let mappingValue = this.optionsQueue.get(identifier).mappingValue;
          let option = find(response.data.data, (item) => item[mappingValue] === identifier);
          if(option){
            Object.keys(option).forEach(key => {
              if(key === mappingValue){return;}
              set(this.options.get(identifier), key, option[key]);
            });
          } else {
            set(this.options.get(identifier), "fetchError", true);
          }
          set(this.options.get(identifier), "isFetching", false);
          this.optionsQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    } catch(e){
      console.error(e);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          set(this.options.get(identifier), "fetchError", true);
          set(this.options.get(identifier), "isFetching", false);
          this.optionsQueue.delete(identifier);
        });
        this.isFetchingQueue = false;
        this.processQueue();
      });
    }
  }

  @action
  async fetchOptions(url, field, search, start, size, mappingValue, requestBody){
    const optionsSet = [];
    const { data } = await API.axios.get(API.endpoints.suggestions(url, field, start, size, search, true), requestBody); // TODO: use real api
    //const response = await API.axios.post(API.endpoints.suggestions(url, field, start, size, search, false), requestBody);
    data && data.data.forEach(option => {
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
    return {options:optionsSet, total:data.total};
  }
}

const optionsPool = new OptionsPool();

export default class DynamicDropdownField extends FormStore.typesMapping.Default{
  @observable value = [];
  @observable defaultValue = [];
  @observable options = [];
  @observable optionsUrl = null;
  @observable allowCustomValues =  false;
  @observable mappingValue = "value";
  @observable mappingLabel = "label";
  @observable mappingReturn = null;
  @observable returnSingle = false;
  @observable max = Infinity;
  @observable listPosition = "bottom";
  @observable closeDropdownAfterInteraction = false;

  @observable userInput = "";
  @observable optionsPageStart = 0;
  @observable optionsPageSize = 50;
  lastFetchParams = null;
  lastFetchOptions = [];
  @observable optionsCurrentTotal = Infinity;

  @observable fetchingOptions = false;

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties,["value", "defaultValue", "options", "optionsUrl", "cacheOptionsUrl", "allowCustomValues",
      "mappingValue", "mappingLabel", "mappingReturn", "returnSingle", "max", "listPosition", "closeDropdownAfterInteraction", "userInput"]);
  }

  constructor(fieldData, store, path){
    super(fieldData, store, path);
    this.injectValue(this.value);
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
      this.addValue(optionsPool.getOption(value, this.mappingValue));
    });
  }

  @action
  async fetchOptions(append){
    if(this.fetchingOptions){
      return;
    }
    this.fetchingOptions = true;
    this.optionsPageStart = append?this.options.length:0;
    let {options, total}= await optionsPool.fetchOptions(this.instanceType, this.path.replace(FormStore.getPathNodeSeparator(),""), this.userInput, this.optionsPageStart, this.optionsPageSize, this.mappingValue, this.store.getValues());
    runInAction(()=>{
      if(append){
        this.options = this.options.concat(options);
      } else {
        this.options = options;
      }
      this.optionsCurrentTotal = total;
      this.fetchingOptions = false;
    });
  }

  _debouncedFetchOptions = debounce((append)=>{this.fetchOptions(append);}, 250);

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

  hasMoreOptions(){
    return !this.fetchingOptions && this.options.length < this.optionsCurrentTotal;
  }
}
