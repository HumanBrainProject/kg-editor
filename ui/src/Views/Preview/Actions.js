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

class Action extends React.PureComponent {
  handleClick = event => {
    const { mode, onClick, onCtrlClick } = this.props;
    if (event.metaKey || event.ctrlKey) {
      typeof onCtrlClick === "function" && onCtrlClick(mode);
    } else {
      typeof onClick === "function" && onClick(mode);
    }
  }

  render() {
    const {className, show, label, icon} = this.props;

    if(!show) {
      return null;
    }

    return(
      <div className={className} onClick={this.handleClick}>
        <FontAwesomeIcon icon={icon} />&nbsp;&nbsp;{label}
      </div>
    );
  }
}

@injectStyles(styles)
@observer
class Actions extends React.Component {

  handleCtrlClick = mode => {
    const { instance } = this.props;
    const { id, name, primaryType } = instance;
    appStore.openInstance(id, name, primaryType, mode);
  }

  handleClick = mode => {
    const { instance } = this.props;
    const { id } = instance;
    if(mode === "view") {
      routerStore.history.push(`/instances/${id}`);
    } else {
      routerStore.history.push(`/instances/${id}/${mode}`);
    }
  }

  render() {
    const { classes, instance } = this.props;
    const { permissions } = instance;
    return (
      <div className={classes.actions}>
        <Action className={classes.action} show={permissions.canRead}                            icon="eye"              label="Open"    mode="view"    onClick={this.handleClick} onCtrlClick={this.handleCtrlClick} />
        <Action className={classes.action} show={permissions.canWrite}                           icon="pencil-alt"       label="Edit"    mode="edit"    onClick={this.handleClick} onCtrlClick={this.handleCtrlClick} />
        <Action className={classes.action} show={permissions.canInviteForSuggestion}             icon="user-edit"        label="Invite"  mode="invite"  onClick={this.handleClick} onCtrlClick={this.handleCtrlClick} />
        <Action className={classes.action} show={permissions.canRead}                            icon="project-diagram"  label="Explore" mode="graph"   onClick={this.handleClick} onCtrlClick={this.handleCtrlClick} />
        <Action className={classes.action} show={permissions.canRelease}                         icon="cloud-upload-alt" label="Release" mode="release" onClick={this.handleClick} onCtrlClick={this.handleCtrlClick} />
        <Action className={classes.action} show={permissions.canDelete || permissions.canCreate} icon="cog"              label="Manage"  mode="manage"  onClick={this.handleClick} onCtrlClick={this.handleCtrlClick} />
      </div>
    );
  }
}

export default Actions;