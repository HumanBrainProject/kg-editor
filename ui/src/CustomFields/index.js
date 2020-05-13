/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { FormStore } from "hbp-quickfire";
import KgInputTextField from "./KgInputTextField";
import KgTextAreaField from "./KgTextAreaField";
import KgTable from "./KgTable";
import DynamicDropdown from "./DynamicDropdown";
import KgAnnotatedInputTextField from "./KgAnnotatedInputText";
import DynamicDropdownStore from "./DynamicDropdownStore";
import KgTableStore from "./KgTableStore";
import KgAnnotatedInputTextStore from "./KgAnnotatedInputTextStore";

FormStore.registerCustomField("KgInputText", KgInputTextField, FormStore.typesMapping.InputText);
FormStore.registerCustomField("KgAnnotatedInputTextField",  KgAnnotatedInputTextField, KgAnnotatedInputTextStore);
FormStore.registerCustomField("KgTextArea", KgTextAreaField, FormStore.typesMapping.TextArea);
FormStore.registerCustomField("DynamicDropdown", DynamicDropdown, DynamicDropdownStore);
FormStore.registerCustomField("KgTable", KgTable, KgTableStore);

export default {
  KgInputTextField:{
    component:KgInputTextField,
    store:FormStore.typesMapping.InputText
  },
  KgAnnotatedInputTextField: {
    component:KgAnnotatedInputTextField,
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