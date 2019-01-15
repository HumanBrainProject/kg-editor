import { observable, action, runInAction, set } from "mobx";
import { isString, isNumber, find, union, debounce, uniq, isEqual } from "lodash";
import FormStore from "hbp-quickfire";
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
      this.processQueue();
      this.options.set(value[mappingValue],{[mappingValue]:value[mappingValue], isFetching:false});
    }
    return this.options.get(value[mappingValue]);
  }

  processQueue(){
    if(this.optionsQueue.size <= 0){
      this._debouncedFetchQueue.cancel();
    } else if(this.optionsQueue.size < this.queueThreshold){
      this._debouncedFetchQueue();
    } else {
      this._debouncedFetchQueue.cancel();
      this.fetchQueue();
    }
  }

  _debouncedFetchQueue = debounce(()=>{this.processQueue();}, this.queueTimeout);

  async fetchQueue(){
    if(this.isFetchingQueue){
      return;
    }
    this.isFetchingQueue = true;
    let toProcess = Array.from(this.fetchQueue.keys()).splice(0, this.queueThreshold);

    toProcess.forEach(identifier => {
      set(this.options.get(identifier), "isFetching", true);
    });

    try{
      let response = await API.axios.post(API.endpoints.optionsById(), toProcess);
      runInAction(() =>{
        toProcess.forEach(identifier => {
          let mappingValue = this.fetchQueue.get(identifier).mappingValue;
          let option = find(response.data, (item) => item[mappingValue] === identifier);
          if(option){
            Object.keys(option).forEach(key => {
              if(key === mappingValue){return;}
              set(this.options.get(identifier), key, option[key]);
            });
          } else {
            set(this.options.get(identifier), "fetchError", true);
            console.error("Can't find option in response: ", identifier);
          }
          set(this.options.get(identifier), "isFetching", false);
        });
        this.isFetchingQueue = false;
        this.smartProcessQueue();
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(identifier => {
          set(this.options.get(identifier), "fetchError", true);
          set(this.options.get(identifier), "isFetching", false);
        });
        this.isFetchingQueue = false;
        this.smartProcessQueue();
      });
    }
  }

  @action
  async fetchOptions(url, mappingValue, requestBody){
    const optionsSet = [];
    let response = await API.axios.post(url, requestBody);
    response.data.forEach(option => {
      if(this.options.has(option[mappingValue])){
        this.options.set(option[mappingValue], option);
      } else {
        Object.keys(option).forEach(key => {
          if(key === mappingValue){return;}
          set(this.options.get(option[mappingValue]), key, option[key]);
        });
      }
      optionsSet.push(this.options.get(option[mappingValue]));
    });
    return optionsSet;
  }
}

const optionsPool = new OptionsPool();

export default class DropdownSelectField extends FormStore.typesMapping.Default{
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

  @observable fetchingOptions = false;

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties,["value", "defaultValue", "options", "optionsUrl", "cacheOptionsUrl", "allowCustomValues",
      "mappingValue", "mappingLabel", "mappingReturn", "returnSingle", "max", "listPosition", "closeDropdownAfterInteraction"]);
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
      this.addValue(optionsPool.getOption(value));
    });
  }

  @action
  async fetchOptions(){
    this.fetchingOptions = true;
    let options = await optionsPool.fetchOptions(this.optionsUrl, this.mappingValue, this.store.getValues());
    runInAction(()=>{
      this.options = options;
      this.fetchingOptions = false;
    });
  }
}
