import { observable, action, isObservableArray } from "mobx";
import { union, isArray } from "lodash";
import { FormStore } from "hbp-quickfire";

export default class KgAnnotatedInputTextStore extends FormStore.typesMapping.Default{
  @observable value = [];
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
    if((this.emptyToNull && value === null) || !value){
      this.value = this.__emptyValue();
    } else if(!isObservableArray(value) && !isArray(value)){
      this.value = [value["@id"]];
    } else {
      this.value = value.map(i=> i["@id"]);
    }
  }

  getValue(){
    return this.value.map(i=> ({"@id": i}));
  }
}