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
import Button  from "react-bootstrap/Button";

const useStyles = createUseStyles({
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
      borderRadius: "0",
      "& $panel": {
        position: "fixed",
      }
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
      color: "red"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  }
});

const SaveErrorPanel = ({ show, error, inline, onCancel, onRetry }) => {

  const classes = useStyles();

  const handleCancel = e => {
    e.stopPropagation();
    onCancel(e);
  };

  const handleRetry = e => {
    e.stopPropagation();
    onRetry(e);
  };

  if (!show) {
    return null;
  }

  return (
    <div className={classes.container} inline={inline?"true":"false"}>
      <div className={classes.panel}>
        <h4>{error}</h4>
        <div>
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    </div>
  );
};

export default SaveErrorPanel;