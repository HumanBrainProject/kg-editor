import { FormStore, Components } from "hbp-quickfire";
import KgInputTextField from "./KgInputTextField";
import KgTextAreaField from "./KgTextAreaField";
import KgTable from "./KgTable";
import DynamicDropdown from "./DynamicDropdown";
import DynamicDropdownStore from "./DynamicDropdownStore";
import KgTableStore from "./KgTableStore";
import KgAnnotatedInputTextStore from "./KgAnnotatedInputTextStore";

FormStore.registerCustomField("KgInputText", KgInputTextField, FormStore.typesMapping.InputText);
FormStore.registerCustomField("KgAnnotatedInputTextField",  Components.InputTextMultiple, KgAnnotatedInputTextStore);
FormStore.registerCustomField("KgTextArea", KgTextAreaField, FormStore.typesMapping.TextArea);
FormStore.registerCustomField("DynamicDropdown", DynamicDropdown, DynamicDropdownStore);
FormStore.registerCustomField("KgTable", KgTable, KgTableStore);

export default {
  KgInputTextField:{
    component:KgInputTextField,
    store:FormStore.typesMapping.InputText
  },
  KgAnnotatedInputTextField: {
    component:Components.InputTextMultiple,
    store:KgAnnotatedInputTextStore
  },
  KgTextAreaField:{
    component:KgTextAreaField,
    store:FormStore.typesMapping.TextArea
  },
  DynamicDropdown:{
    component:DynamicDropdown,
    store:DynamicDropdownStore
  },
  KgTable: {
    component: KgTable,
    store: KgTableStore
  }
};