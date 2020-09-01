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

class Tab extends React.PureComponent {

  handleClick = () => {
    const { mode, onClick } = this.props;
    typeof onClick === "function" && onClick(mode);
  }

  render() {
    const {className, show, disbled, active, icon} = this.props;

    if(!show) {
      return null;
    }

    const props = disbled || active?
      {
        className: `${className} ${disbled?"disbled":""} ${active?"active":""}`
      }
      :
      {
        className: className,
        onClick: this.handleClick
      };

    return(
      <div {...props} >
        <FontAwesomeIcon icon={icon}/>
      </div>
    );
  }
}

@injectStyles(styles)
@observer
class Tabs extends React.Component {

  handleClick = mode => {
    const { instance } = this.props;
    appStore.togglePreviewInstance();
    routerStore.history.push(`/instance/${mode}/${instance.id}`);
  }

  render() {
    const {classes, instance, mode} = this.props;
    const permissions = instance?instance.permissions:{};

    return (
      <div className={classes.tabs}>
        <Tab className={classes.tab} show={permissions.canRead}                            icon="eye"              mode="view"    disabled={mode === "create"} active={mode === "view"}                      onClick={this.handleClick} />
        <Tab className={classes.tab} show={permissions.canWrite}                           icon="pencil-alt"       mode="edit"    disabled={false}             active={mode === "edit" || mode === "create"} onClick={this.handleClick} />
        <Tab className={classes.tab} show={permissions.canInviteForSuggestion}             icon="user-edit"        mode="invite"  disabled={mode === "create"} active={mode === "invite"}                    onClick={this.handleClick} />
        <Tab className={classes.tab} show={permissions.canRead}                            icon="project-diagram"  mode="graph"   disabled={mode === "create"} active={mode === "graph"}                     onClick={this.handleClick} />
        <Tab className={classes.tab} show={permissions.canRelease}                         icon="cloud-upload-alt" mode="release" disabled={mode === "create"} active={mode === "release"}                   onClick={this.handleClick} />
        <Tab className={classes.tab} show={permissions.canDelete || permissions.canCreate} icon="cog"              mode="manage"  disabled={mode === "create"} active={mode === "manage"}                    onClick={this.handleClick} />
      </div>
    );
  }
}

export default Tabs;