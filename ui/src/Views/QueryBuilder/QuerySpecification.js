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

import React from "react";
import ReactJson from "react-json-view";
import { observer } from "mobx-react";
import ThemeRJV from "./ThemeRJV";

import queryBuilderStore from "../../Stores/QueryBuilderStore";

@observer
export default class QuerySpecification extends React.Component{
  render(){
    return(
      queryBuilderStore.rootField &&
      <ReactJson collapsed={false} name={false} theme={ThemeRJV} src={queryBuilderStore.JSONQuery} />
    );
  }
}