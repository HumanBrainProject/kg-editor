import { FormStore } from "hbp-quickfire";

import KgInputTextField from "./KgInputTextField";

FormStore.registerCustomField("KgInputText", KgInputTextField, FormStore.typesMapping.InputText);

export default {
  KgInputTextField:{
    component:KgInputTextField,
    store:FormStore.typesMapping
  }
};