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
import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  panel: {
    position:"relative",
    "& h6": {
      margin: "0 !important",
      color: "#333",
      fontWeight: "bold"
    }
  },
  hasChanged:{
    position:"absolute",
    top:5,
    right:10,
    color:"#e67e22"
  }
};

@injectStyles(styles)
export default class HeaderPanel extends React.Component{
  render(){
    const { classes, className, nodeType, color, hasChanged } = this.props;
    return(
      <div className={`${classes.panel} ${className ? className : ""}`}>
        <Row>
          <Col xs={12}>
            <h6>
              <FontAwesomeIcon icon={"circle"} color={color?color:undefined}/>&nbsp;&nbsp;<span>{nodeType ? nodeType : "Unknown"}</span>
            </h6>
          </Col>
        </Row>
        {hasChanged &&
          <div className={classes.hasChanged}>
            <FontAwesomeIcon icon={"exclamation-triangle"}/>&nbsp;
            <FontAwesomeIcon icon={"caret-right"}/>&nbsp;
            <FontAwesomeIcon icon={"pencil-alt"}/>
          </div>
        }
      </div>
    );
  }
}