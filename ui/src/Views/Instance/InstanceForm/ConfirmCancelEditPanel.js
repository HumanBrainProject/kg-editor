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
import { Button } from "react-bootstrap";

const styles = {
  container: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: "9px",
    zIndex: "1200",
    "&[inline='false']": {
      top: "-10px",
      left: "-10px",
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)",
      borderRadius: "0"
    }
  },
  panel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    minWidth: "220px",
    transform: "translate(-50%, -50%)",
    padding: "10px",
    borderRadius: "5px",
    background: "white",
    textAlign: "center",
    boxShadow: "2px 2px 4px #7f7a7a",
    "& h4": {
      margin: "0",
      paddingBottom: "10px",
      color: "#333"
    },
    "& button, & a.btn": {
      minWidth: "80px"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
};

@injectStyles(styles)
export default class ConfirmCancelEditPanel extends React.Component{
  render(){
    const { classes, show, text, onConfirm, onCancel, inline} = this.props;
    const handleConfirm = (e) => {
      e.stopPropagation();
      onConfirm(e);
    };
    const handleCancel = (e) => {
      e.stopPropagation();
      onCancel(e);
    };
    return(
      (show)?
        <div className={classes.container} inline={inline?"true":"false"}>
          <div className={classes.panel}>
            <h4>{text}</h4>
            <div>
              <Button bsStyle="default" onClick={handleConfirm}>Yes</Button>
              <Button bsStyle="danger" onClick={handleCancel}>No</Button>
            </div>
          </div>
        </div>
        :
        null
    );
  }
}