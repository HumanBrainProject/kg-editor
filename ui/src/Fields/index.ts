/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */


import AnnotatedInputText from './AnnotedInputText/AnnotatedInputText';
import CheckBox from './CheckBox/CheckBox';
import DynamicDropdown from './DynamicDropdown/DynamicDropdown';
import DynamicTable from './DynamicTable/DynamicTable';
import InputColor from './InputColor/InputColor';
import InputDateTime from './InputDateTime/InputDateTime';
import InputNumber from './InputNumber/InputNumber';


import InputNumberMultiple from './InputNumberMultiple/InputNumberMultiple';
import InputText from './InputText/InputText';
import InputTextMultiple from './InputTextMultiple/InputTextMultiple';
import NestedField from './NestedField/NestedField';
import SingleNestedField from './NestedField/SingleNestedField';

import SimpleDropdown from './SimpleDropdown/SimpleDropdown';
import AnnotatedInputTextStore from './Stores/AnnotatedInputTextStore';

import CheckBoxStore from './Stores/CheckBoxStore';
import InputDateStore from './Stores/InputDateStore';
import InputNumberMultipleStore from './Stores/InputNumberMultipleStore';
import InputNumberStore from './Stores/InputNumberStore';
import InputTextMultipleStore from './Stores/InputTextMultipleStore';
import InputTextStore from './Stores/InputTextStore';
import InputTimeStore from './Stores/InputTimeStore';
import LinkStore from './Stores/LinkStore';
import LinksStore from './Stores/LinksStore';
import NestedFieldStore from './Stores/NestedFieldStore';
import SingleNestedFieldStore from './Stores/SingleNestedFieldStore';
import UnsupportedFieldStore from './Stores/UnsupportedFieldStore';
import TextArea from './TextArea/TextArea';
import UnsupportedField from './UnsupportedField/UnsupportedField';
import type FieldStore from './Stores/FieldStore';
import type { View } from '../Stores/ViewStore';
import type React from 'react';

export interface Field {
  fieldStore: FieldStore;
  name: string;
  className:string;
  readMode: boolean;
  enablePointerEvents?: boolean;
  showIfNoValue?: boolean;
  view?: View;
  pane?: string;
}

export interface WidgetOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [option: string]: any;
}

interface Widget<P extends Field, T extends FieldStore>  {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.FunctionComponent<P>;
  Store: T;
  options?: WidgetOptions;
}

interface FieldMapping {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [widget: string]: Widget<any,any>;
}

export const fieldsMapping: FieldMapping = {
  'InputText':  {
    Component: InputText,
    Store: InputTextStore
  },
  'InputNumber':  {
    Component: InputNumber,
    Store: InputNumberStore
  },
  'InputDate': {
    Component: InputText,
    Store: InputDateStore
  },
  'InputDateTime': {
    Component: InputDateTime,
    Store: InputTextStore
  },
  'InputTime': {
    Component: InputText,
    Store: InputTimeStore
  },
  'InputNumberMultiple':  {
    Component: InputNumberMultiple,
    Store: InputNumberMultipleStore
  },
  'InputColor': {
    Component: InputColor,
    Store: InputTextStore
  },
  'TextArea': {
    Component: TextArea,
    Store: InputTextStore
  },
  'SimpleDropdown': {
    Component: SimpleDropdown,
    Store: LinkStore
  },
  'DynamicDropdown': {
    Component: DynamicDropdown,
    Store: LinksStore
  },
  'DynamicTable': {
    Component: DynamicTable,
    Store: LinksStore,
    options: {
      lazyShowLinks: true
    }
  },
  'CheckBox': {
    Component: CheckBox,
    Store: CheckBoxStore
  },
  'AnnotatedInputText' : {
    Component: AnnotatedInputText,
    Store: AnnotatedInputTextStore
  },
  'InputTextMultiple': {
    Component: InputTextMultiple,
    Store: InputTextMultipleStore
  },
  'UnsupportedField': {
    Component: UnsupportedField,
    Store: UnsupportedFieldStore
  },
  'Nested': {
    Component: NestedField,
    Store: NestedFieldStore
  },
  'SingleNested': {
    Component: SingleNestedField,
    Store: SingleNestedFieldStore
  }
};