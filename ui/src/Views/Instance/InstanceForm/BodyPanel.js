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

import React from "react";
import injectStyles from "react-jss";
import { Panel } from "react-bootstrap";
import InstanceField from "./InstanceField";

const styles = {
  panel: {
    border: "0",
    borderRadius: "0",
    boxShadow: "none",
    backgroundColor: "transparent",
    margin: "0",
    padding: "0",
    "& .panel-body": {
      padding: "0"
    }
  }
};

@injectStyles(styles)
export default class BodyPanel extends React.Component{
  render(){
    const { classes, className,  show, level, id, instance, fields, mainInstanceId, disableLinks } = this.props;
    return(
      <Panel className={`${classes.panel} ${className}`} expanded={show} onToggle={() => {}}>
        <Panel.Collapse>
          <Panel.Body>
            {fields.map(name => <InstanceField key={id+name} name={name} level={level} id={id} instance={instance} mainInstanceId={mainInstanceId} disableLinks={disableLinks} />)}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
}