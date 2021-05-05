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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderPanel from "./HeaderPanel";

const styles = {
  fetchErrorPanel: {
    position: "absolute !important",
    top: "50%",
    left: "50%",
    padding: "20px",
    border: "1px solid gray",
    borderRadius: "5px",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px",
      color: "red"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
  inlineFetchErrorPanel: {
    padding: "10px",
    "& h5": {
      marginTop: "0",
      color: "red"
    },
    "& small": {
      display: "block",
      paddingBottom: "6px",
      color:"grey",
      fontWeight:"400",
      fontSize:"0.8em",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      "@media screen and (max-width:576px)": {
        wordBreak: "break-all",
        wordWrap: "break-word",
        whiteSpace: "normal",
      }
    },
    "& button span + span": {
      marginLeft: "4px"
    }
  },
  retryIcon: {
    marginRight: "4px"
  }
};

@injectStyles(styles)
export default class FetchErrorPanel extends React.Component{
  handleRetry = (e) => {
    e.stopPropagation();
    this.props.onRetry(e);
  };

  render(){
    const { classes, id, show, error, inline } = this.props;
    if (!show) {
      return null;
    }
    return(
      (!inline)?
        <div className={classes.fetchErrorPanel}>
          <h4>{error}</h4>
          <div>
            <Button bsStyle="primary" onClick={this.handleRetry}>Retry</Button>
          </div>
        </div>
        :
        <div className={classes.inlineFetchErrorPanel}>
          <HeaderPanel className={classes.panelHeader} />
          <h5>{error}</h5>
          <small>Nexus ID: {id}</small>
          <div>
            <Button onClick={this.handleRetry}><FontAwesomeIcon className={classes.retryIcon} icon="sync-alt" /><span>Retry</span></Button>
          </div>
        </div>
    );
  }
}