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
import {observer} from "mobx-react";
import injectStyles from "react-jss";

import appStore from "../../Stores/AppStore";
import routerStore from "../../Stores/RouterStore";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const styles = {
  tabs: {
    borderRight: "1px solid var(--border-color-ui-contrast1)",
    background: "var(--bg-color-ui-contrast2)"
  },
  tab: {
    color: "var(--ft-color-normal)",
    borderLeft: "2px solid transparent",
    opacity: "0.5",
    cursor: "pointer",
    height: "50px",
    lineHeight: "50px",
    fontSize: "1.75em",
    textAlign: "center",
    "&:hover": {
      background: "var(--list-bg-hover)",
      borderColor: "var(--list-border-hover)",
      color: "var(--ft-color-loud)",
      opacity: "1"
    },
    "&.active": {
      background: "var(--list-bg-selected)",
      borderColor: "var(--list-border-selected)",
      color: "var(--ft-color-loud)",
      opacity: "1"
    },
    "&.disabled, &.disabled:hover":{
      color: "var(--ft-color-normal)",
      opacity: "0.2",
      cursor: "not-allowed"
    }
  }
};

@injectStyles(styles)
@observer
class Tabs extends React.Component {
  handleSelectMode(mode) {
    appStore.togglePreviewInstance();
    routerStore.history.push(`/instance/${mode}/${this.props.id}`);
  }

  render() {
    const {classes, mode} = this.props;
    if(mode === "create") {
      return(
        <div className={classes.tabs}>
          <div className={`${classes.tab} disabled`} >
            <FontAwesomeIcon icon="eye"/>
          </div>
          <div className={`${classes.tab} active`} >
            <FontAwesomeIcon icon="pencil-alt"/>
          </div>
          <div className={`${classes.tab} disabled`} >
            <FontAwesomeIcon icon="user-edit"/>
          </div>
          <div className={`${classes.tab} disabled`} >
            <FontAwesomeIcon icon="project-diagram"/>
          </div>
          <div className={`${classes.tab} disabled`} >
            <FontAwesomeIcon icon="cloud-upload-alt"/>
          </div>
          <div className={`${classes.tab} disabled`} >
            <FontAwesomeIcon icon="cog"/>
          </div>
        </div>
      );
    } else {
      return (
        <div className={classes.tabs}>
          <div className={`${classes.tab} ${mode === "view"?"active":""}`} onClick={this.handleSelectMode.bind(this, "view")}>
            <FontAwesomeIcon icon="eye"/>
          </div>
          <div className={`${classes.tab} ${mode === "edit"?"active":""}`} onClick={this.handleSelectMode.bind(this, "edit")}>
            <FontAwesomeIcon icon="pencil-alt"/>
          </div>
          <div className={`${classes.tab} ${mode === "invite" ? "active" : ""}`} onClick={this.handleSelectMode.bind(this, "invite")}>
            <FontAwesomeIcon icon="user-edit"/>
          </div>
          <div className={`${classes.tab} ${mode === "graph" ? "active" : ""}`} onClick={this.handleSelectMode.bind(this, "graph")}>
            <FontAwesomeIcon icon="project-diagram"/>
          </div>
          <div className={`${classes.tab} ${mode === "release"?"active":""}`} onClick={this.handleSelectMode.bind(this, "release")}>
            <FontAwesomeIcon icon="cloud-upload-alt"/>
          </div>
          <div className={`${classes.tab} ${mode === "manage"?"active":""}`} onClick={this.handleSelectMode.bind(this, "manage")}>
            <FontAwesomeIcon icon="cog"/>
          </div>
        </div>
      );
    }
  }
}

export default Tabs;