import { FormStore } from "hbp-quickfire";
import KgInputTextField from "./KgInputTextField";
import KgTextAreaField from "./KgTextAreaField";
import KgTable from "./KgTable";
import DynamicDropdown from "./DynamicDropdown";
import KgAnnotatedInputTextField from "./KgAnnotatedInputText";
import DynamicDropdownStore from "./DynamicDropdownStore";
import KgTableStore from "./KgTableStore";
import KgAnnotatedInputTextStore from "./KgAnnotatedInputTextStore";
import KgInputTextStore from "./KgInputTextStore";
import KgTextAreaStore from "./KgTextAreaStore";

FormStore.registerCustomField("KgInputText", KgInputTextField, KgInputTextStore);
FormStore.registerCustomField("KgAnnotatedInputTextField",  KgAnnotatedInputTextField, KgAnnotatedInputTextStore);
FormStore.registerCustomField("KgTextArea", KgTextAreaField, KgTextAreaStore);
FormStore.registerCustomField("DynamicDropdown", DynamicDropdown, DynamicDropdownStore);
FormStore.registerCustomField("KgTable", KgTable, KgTableStore);

export default {
  KgInputTextField:{
    component:KgInputTextField,
    store:KgInputTextStore
  },
  KgAnnotatedInputTextField: {
    component:KgAnnotatedInputTextField,
    store:KgAnnotatedInputTextStore
  },
  KgTextAreaField:{
    component:KgTextAreaField,
    store:KgTextAreaStore
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