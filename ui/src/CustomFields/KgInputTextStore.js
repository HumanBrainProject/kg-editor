import { observable, action } from "mobx";
import { union } from "lodash";
import { FormStore } from "hbp-quickfire";

export default class KgInputTextStore extends FormStore.typesMapping.Default{
  @observable value = "";
  @observable defaultValue = "";
  @observable inputType = "text";
  @observable autoComplete = false;
  @observable useVirtualClipboard = false;

  __emptyValue = () => "";

  static get properties(){
    return union(super.properties, ["value", "defaultValue", "inputType", "useVirtualClipboard"]);
  }

  @action
  getValue(applyMapping){
    let value = this.value;
    if (this.inputType === "number") {
      if (value !== "") {
        value = parseFloat(value);
      } else {
        value = null;
      }
    }
    return applyMapping? this.mapReturnValue(value): value;
  }
}