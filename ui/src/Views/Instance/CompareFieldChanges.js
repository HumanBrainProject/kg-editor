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
import CompareFieldValueChanges from "./CompareFieldValueChanges";

const styles = {
  container:{
    margin: "0 0 5px 0",
    padding: 0,
    border: 0,
    background: "transparent",
    overflowWrap: "anywhere",
    fontFamily: "unset",
    fontSize: "unset"
    //,
    //textAlign: "justify"
  },
  label: {
    marginBottom: 0,
    wordBreak: "keep-all",
    "&::after": {
      content: "':\\00a0'"
    }
  }
};

@injectStyles(styles)
class CompareFieldChanges extends React.Component{
  render(){
    const {classes, field, beforeValue, afterValue} = this.props;

    if (!field || !field.label) {
      return null;
    }
    return (
      <pre className={classes.container}>
        <label className={classes.label}>{field.label}</label>
        <CompareFieldValueChanges mappingLabel={field.mappingLabel} beforeValue={beforeValue} afterValue={afterValue}/>
      </pre>
    );
  }
}

export default CompareFieldChanges;