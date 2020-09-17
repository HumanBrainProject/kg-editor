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

import InputText from "./InputText/InputText";
import InputTextStore from "./InputText/InputTextStore";

import AnnotatedInputText from "./AnnotedInputText/AnnotatedInputText";
import AnnotatedInputTextStore from "./AnnotedInputText/AnnotatedInputTextStore";

import TextArea from "./TextArea/TextArea";
import TextAreaStore from "./TextArea/TextAreaStore";

import DynamicDropdown from "./DynamicDropdown/DynamicDropdown";
import DynamicDropdownStore from "./DynamicDropdown/DynamicDropdownStore";

import DynamicTable from "./DynamicTable/DynamicTable";
import DynamicTableStore from "./DynamicTable/DynamicTableStore";

FormStore.registerCustomField("KgInputText", InputText, InputTextStore);
FormStore.registerCustomField("KgAnnotatedInputText",  AnnotatedInputText, AnnotatedInputTextStore);
FormStore.registerCustomField("KgTextArea", TextArea, TextAreaStore);
FormStore.registerCustomField("KgDynamicDropdown", DynamicDropdown, DynamicDropdownStore);
FormStore.registerCustomField("KgDynamicTable", DynamicTable, DynamicTableStore);
