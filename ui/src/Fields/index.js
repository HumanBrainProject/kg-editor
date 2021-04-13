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

import InputText from "./InputText/InputText";
import InputNumber from "./InputNumber/InputNumber";
import TextArea from "./TextArea/TextArea";
import InputColor from "./InputColor/InputColor";
import DynamicDropdown from "./DynamicDropdown/DynamicDropdown";
import DynamicTable from "./DynamicTable/DynamicTable";
import CheckBox from "./CheckBox/CheckBox";
import UnsupportedField from "./UnsupportedField/UnsupportedField";
import NestedField from "./NestedField/NestedField";

import AnnotatedInputText from "./AnnotedInputText/AnnotatedInputText";
import AnnotatedInputTextStore from "./Stores/AnnotatedInputTextStore";

import InputTextMultiple from "./InputTextMultiple/InputTextMultiple";
import InputTextMultipleStore from "./Stores/InputTextMultipleStore";

import InputNumberMultiple from "./InputNumberMultiple/InputNumberMultiple";
import InputNumberMultipleStore from "./Stores/InputNumberMultipleStore";

import InputTextStore from "./Stores/InputTextStore";
import LinksStore from "./Stores/LinksStore";
import CheckBoxStore from "./Stores/CheckBoxStore";
import UnsupportedFieldStore from "./Stores/UnsupportedFieldStore";
import InputNumberStore from "./Stores/InputNumberStore";
import InputDateStore from "./Stores/InputDateStore";
import InputDateTime from "./InputDateTime/InputDateTime";
import NestedFieldStore from "./Stores/NestedFieldStore";

export const fieldsMapping = {
  "InputText":  {
    Component: InputText,
    Store: InputTextStore
  },
  "InputNumber":  {
    Component: InputNumber,
    Store: InputNumberStore
  },
  "InputDate": {
    Component: InputText,
    Store: InputDateStore
  },
  "InputDateTime": {
    Component: InputDateTime,
    Store: InputTextStore
  },
  "InputNumberMultiple":  {
    Component: InputNumberMultiple,
    Store: InputNumberMultipleStore
  },
  "InputColor": {
    Component: InputColor,
    Store: InputTextStore
  },
  "TextArea": {
    Component: TextArea,
    Store: InputTextStore
  },
  "DynamicDropdown": {
    Component: DynamicDropdown,
    Store: LinksStore
  },
  "DynamicTable": {
    Component: DynamicTable,
    Store: LinksStore,
    options: {
      lazyShowLinks: true
    }
  },
  "CheckBox": {
    Component: CheckBox,
    Store: CheckBoxStore
  },
  "AnnotatedInputText" : {
    Component: AnnotatedInputText,
    Store: AnnotatedInputTextStore
  },
  "InputTextMultiple": {
    Component: InputTextMultiple,
    Store: InputTextMultipleStore
  },
  "UnsupportedField": {
    Component: UnsupportedField,
    Store: UnsupportedFieldStore
  },
  "Nested": {
    Component: NestedField,
    Store: NestedFieldStore
  }
};