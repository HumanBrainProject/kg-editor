import { observable, action, isObservableArray } from "mobx";
import { union, isArray } from "lodash";
import { FormStore } from "hbp-quickfire";

export default class KgAnnotatedInputTextStore extends FormStore.typesMapping.Default{
  @observable value = null;
  @observable defaultValue = [];
  @observable max = Infinity;
  @observable useVirtualClipboard = false;
  @observable test = ""

  __emptyValue = () => [];

  static get properties(){
    return union(super.properties, ["value", "defaultValue", "useVirtualClipboard", "max"]);
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

    const providedValue = this.getProvidedValue();
    providedValue.forEach(value => {
      if(!value || !value["@id"] || this.value.length >= this.max){
        return;
      }
      this.value.push(value["@id"]);
    });
  }

  getValue(){
    return this.value.map(i=> ({"@id": i}));
  }
}