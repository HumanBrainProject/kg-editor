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
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import Field from "./Field";

let styles = {
  container:{

  }
};

@injectStyles(styles)
@observer
export default class Fields extends React.Component{
  render(){
    const {classes, field} = this.props;
    return(
      <div className={classes.container}>
        {field.merge && !!field.merge.length && field.merge.map(field => {
          return(
            <Field field={field} key={`merge_${field._uniqueKey}`} />
          );
        })}
        {field.fields && !!field.fields.length && field.fields.map(field => {
          return(
            <Field field={field} key={`field_${field._uniqueKey}`} />
          );
        })}
      </div>
    );
  }
}