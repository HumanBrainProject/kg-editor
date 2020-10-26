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
import uniqueId from "lodash/uniqueId";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const animationId = uniqueId("animationId");

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
      borderRadius: "0"
    }
  },
  panel: {
    display: "inline-block",
    position: "absolute",
    top: "50%",
    left: "50%",
    minWidth: "240px",
    transform: "translate(-50%, -50%)",
    fontSize: "18px",
    fontWeight: "lighter",
    background: "white",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "2px 2px 4px #7f7a7a",
    "& small": {
      display: "block",
      padding: "10px 0",
      color:"grey",
      fontWeight:"400",
      fontSize:"0.6em",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      "@media screen and (max-width:576px)": {
        wordBreak: "break-all",
        wordWrap: "break-word",
        whiteSpace: "normal"
      }
    }
  },
  icon: {
    color: "red",
    animation: `${animationId} 1.4s infinite linear`
  },
  [`@keyframes ${animationId}`]: {
    "0%": {
      transform: "scale(1)"
    },
    "50%": {
      transform: "scale(0.1)"
    },
    "100%": {
      transform: "scale(1)"
    }
  },
  label: {
    paddingLeft: "6px"
  },
});

const SavingPanel = ({ id, show, inline }) => {

  const classes = useStyles();

  if (!show) {
    return null;
  }

  return (
    <div className={classes.container} inline={inline?"true":"false"}>
      <div className={classes.panel} >
        <FontAwesomeIcon className={classes.icon} icon="dot-circle"/>
        <span className={classes.label}>Saving instance...</span>
        <small>ID: {id}</small>
      </div>
    </div>
  );
};

export default SavingPanel;