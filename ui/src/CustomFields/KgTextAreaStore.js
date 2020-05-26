import { observable } from "mobx";
import { union } from "lodash";
import { FormStore } from "hbp-quickfire";

export default class KgTextAreaStore extends FormStore.typesMapping.Default{
    @observable value = "";
    @observable defaultValue = "";
    @observable autosize = true;
    @observable rows = 1;
    @observable maxRows = null;
    @observable resizable = false;

    __emptyValue = () => "";

    static get properties(){
      return union(super.properties,["value", "defaultValue", "autosize", "rows", "maxRows", "resizable"]);
    }
}