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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  panel: {
    position: "relative",
    padding: "10px 10px 0 10px",
    fontSize: "18px",
    fontWeight: "lighter",
    "@media screen and (max-width:576px)": {
      width: "220px",
      "&[inline='false']": {
        width: "180px"
      }
    },
    "&[inline='false']": {
      position: "absolute !important",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
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
  label: {
    paddingLeft: "6px"
  }
};

@injectStyles(styles)
class FetchingPanel extends React.Component{
  render(){
    const { classes, id, show, inline } = this.props;
    if (!show) {
      return null;
    }
    return(
      <div className={classes.panel} inline={inline?"true":"false"}>
        <FontAwesomeIcon className={classes.icon} icon="circle-notch" spin/>
        <span className={classes.label}>Fetching instance...</span>
        <small>ID: {id}</small>
      </div>
    );
  }
}

export default FetchingPanel;