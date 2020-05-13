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
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import releaseStore from "../../../Stores/ReleaseStore";

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    height: "24px",
    background: "var(--bg-color-ui-contrast4)",
    borderRadius: "20px"
  },
  btn: {
    textAlign:"center",
    width: "24px",
    height:"24px",
    lineHeight:"24px",
    cursor:"pointer",
    fontSize:"0.66em",
    transition:"all .2s ease",
    background:"none",
    "&:hover":{
      background:"var(--bg-color-ui-contrast1)",
      borderRadius:"50%",
      transform:"scale(1.12)",
      fontSize:"0.8em"
    }
  },
  releaseBtn: {
    extend: "btn",
    color: "#3498db"
  },
  doNothingBtn: {
    extend: "btn",
    color: "#999",
    "&:hover":{
      transform: "scale(1)"
    }
  }
};

@injectStyles(styles)
@observer
export default class ReleaseNodeAndChildrenToggle extends React.Component {
  handleClick = status => {
    const node = releaseStore.instancesTree;
    releaseStore.markAllNodeForChange(node, status);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div onClick={() => this.handleClick("RELEASED")} className={classes.releaseBtn} title="release all">
          <FontAwesomeIcon icon="check"/>
        </div>
        <div onClick={() => this.handleClick()} className={classes.doNothingBtn} title="do nothing">
          <FontAwesomeIcon icon="dot-circle"/>
        </div>
      </div>
    );
  }
}