import { FormStore } from "hbp-quickfire";

import DynamicDropdown from "./DynamicDropdown";
import DynamicDropdownStore from "./DynamicDropdownStore";

FormStore.registerCustomField("DynamicDropdown", DynamicDropdown, DynamicDropdownStore);

export default {
  DynamicDropdown:{
    component:DynamicDropdown,
    store:DynamicDropdownStore
  }
};