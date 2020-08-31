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

const stylesActions = {
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gridGap: "10px",
    marginBottom: "20px"
  }
};

const stylesAction = {
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

@injectStyles(stylesAction)
class Action extends React.PureComponent {
  handleOpenInstance = event => {
    if (event.metaKey || event.ctrlKey) {
      appStore.openInstance(this.props.instance.id, this.props.mode);
    } else {
      routerStore.history.push(
        `/instance/${this.props.mode}/${this.props.instance.id}`
      );
    }
  }

  render() {
    const {classes, show, label, icon} = this.props;

    if(!show) {
      return null;
    }

    return(
      <div className={classes.action} onClick={this.handleOpenInstance}>
        <FontAwesomeIcon icon={icon} />&nbsp;&nbsp;{label}
      </div>
    );
  }
}

@injectStyles(stylesActions)
@observer
class Actions extends React.Component {
  render() {
    const { classes, instance } = this.props;
    const { permissions } =  instance;
    return (
      <div className={classes.actions}>
        <Action show={permissions.canRead} icon="eye" label="Open" mode="view"/>
        <Action show={permissions.canCreate} icon="pencil-alt" label="Edit" mode="edit"/>
        <Action show={permissions.canInviteForSuggestion} icon="user-edit" label="Invite" mode="invite"/>
        <Action show={permissions.canRead} icon="project-diagram" label="Explore" mode="graph"/>
        <Action show={permissions.canRelease} icon="cloud-upload-alt" label="Release" mode="release"/>
        <Action show={permissions.canDelete || permissions.canCreate} icon="cog" label="Manage" mode="manage"/>
      </div>
    );
  }
}

export default Actions;