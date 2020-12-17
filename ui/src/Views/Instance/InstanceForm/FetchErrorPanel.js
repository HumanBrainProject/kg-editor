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
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import HeaderPanel from "./HeaderPanel";

const useStyles = createUseStyles({
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
      color: "var(--ft-color-error)"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
  inlineFetchErrorPanel: {
    padding: "10px",
    "& h5": {
      marginTop: "0",
      color: "var(--ft-color-error)"
    },
    "& small": {
      display: "block",
      paddingBottom: "6px",
      color:"grey",
      fontWeight:"400",
      fontSize:"0.8em",
      fontStyle: "italic",
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
  },
  action: {
    textAlign: "center"
  }
});

const FetchErrorPanel = ({ id, show, error, inline, onRetry }) => {

  const classes = useStyles();

  const handleRetry = (e) => {
    e.stopPropagation();
    onRetry(e);
  };

  if (!show) {
    return null;
  }

  return(
    (!inline)?
      <div className={classes.fetchErrorPanel}>
        <h4>{error}</h4>
        <div className={classes.action}>
          <Button variant="primary" onClick={handleRetry}>Retry</Button>
        </div>
      </div>
      :
      <div className={classes.inlineFetchErrorPanel}>
        <HeaderPanel className={classes.panelHeader} />
        <h5>{error}</h5>
        <small><span>ID: </span><span>{id}</span></small>
        <div className={classes.action}>
          <Button onClick={handleRetry}><FontAwesomeIcon className={classes.retryIcon} icon="sync-alt" /><span>Retry</span></Button>
        </div>
      </div>
  );
};

export default FetchErrorPanel;