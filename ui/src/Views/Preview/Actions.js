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

import appStore from "../../Stores/AppStore";
import routerStore from "../../Stores/RouterStore";

const styles = {
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gridGap: "10px",
    marginBottom: "20px"
  },
  action: {
    height: "34px",
    cursor: "pointer",
    overflow: "hidden",
    lineHeight: "34px",
    textAlign: "center",
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-normal)",
    "&:hover": {
      color: "var(--ft-color-loud)"
    }
  }
};

@injectStyles(styles)
@observer
class Actions extends React.Component {
  handleOpenInstance(mode, event) {
    if (event.metaKey || event.ctrlKey) {
      appStore.openInstance(this.props.instanceId, mode);
    } else {
      routerStore.history.push(
        `/instance/${mode}/${this.props.instanceId}`
      );
    }
  }
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.actions}>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "view")}
        >
          <FontAwesomeIcon icon="eye" />
                  &nbsp;&nbsp;Open
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "edit")}
        >
          <FontAwesomeIcon icon="pencil-alt" />
                  &nbsp;&nbsp;Edit
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "invite")}
        >
          <FontAwesomeIcon icon="user-edit" />
                  &nbsp;&nbsp;Invite
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "graph")}
        >
          <FontAwesomeIcon icon="project-diagram" />
                  &nbsp;&nbsp;Explore
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "release")}
        >
          <FontAwesomeIcon icon="cloud-upload-alt" />
                  &nbsp;&nbsp;Release
        </div>
        <div
          className={classes.action}
          onClick={this.handleOpenInstance.bind(this, "manage")}
        >
          <FontAwesomeIcon icon="cog" />
                  &nbsp;&nbsp;Manage
        </div>
      </div>
    );
  }
}

export default Actions;