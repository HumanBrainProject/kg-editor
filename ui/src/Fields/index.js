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
import TextArea from "./TextArea/TextArea";
import InputTextStore from "./InputTextStore";

// import AnnotatedInputText from "./AnnotedInputText/AnnotatedInputText";
// import AnnotatedInputTextStore from "./AnnotedInputText/AnnotatedInputTextStore";

import DynamicDropdown from "./DynamicDropdown/DynamicDropdown";
import DynamicTable from "./DynamicTable/DynamicTable";
import LinksStore from "./LinksStore";

export const fieldsMapping = {
  "InputText":  {
    Component: InputText,
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
  }
};