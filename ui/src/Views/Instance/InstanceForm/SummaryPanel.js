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
import InstanceField from "./InstanceField";

const styles = {
  panel: {
    padding: "0"
  }
};

@injectStyles(styles)
class SummaryPanel extends React.Component{
  render(){
    const { classes, className, level, id, instance, fields, mainInstanceId, disableLinks } = this.props;
    return(
      <div className={`${classes.panel} ${className}`}>
        {fields.map(name => <InstanceField key={id+name} name={name} level={level} id={id} instance={instance} mainInstanceId={mainInstanceId} disableLinks={disableLinks} />)}
      </div>
    );
  }
}

export default SummaryPanel;