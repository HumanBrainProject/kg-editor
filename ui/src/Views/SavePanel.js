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
import { matchPath } from "react-router-dom";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import instanceStore from "../Stores/InstanceStore";
import appStore from "../Stores/AppStore";
import routerStore from "../Stores/RouterStore";

import SaveBar from "./Instance/SaveBar";

const styles = {
  savebar: {
    position: "absolute",
    top: 0,
    right: "-400px",
    width: "400px",
    background: "var(--bg-color-ui-contrast3)",
    borderLeft: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    height: "100%",
    zIndex: 2,
    transition: "right 0.25s ease",
    "&.show": {
      right: "0",
    }
  },
  savebarToggle: {
    cursor: "pointer",
    position: "absolute",
    bottom: "10px",
    right: "100%",
    background: "linear-gradient(90deg, var(--bg-color-ui-contrast1), var(--bg-color-ui-contrast3))",
    borderRadius: "3px 0 0 3px",
    padding: "10px",
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRight: "none",
    textAlign: "center",
    color: "#e67e22",
    "&:hover": {
      background: "var(--bg-color-ui-contrast3)"
    }
  },
  savebarToggleIcon: {
    animation: "pulse 2s linear infinite"
  },
  "@keyframes pulse": {
    "0%": {
      "transform": "scale(1.1)"
    },
    "50%": {
      "transform": "scale(0.8)"
    },
    "100%": {
      "transform": "scale(1.1)"
    }
  }
};

@injectStyles(styles)
@observer
class SavePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocationPathname: routerStore.history.location.pathname
    };
    routerStore.history.listen(location => {
      this.setState({ currentLocationPathname: location.pathname });
    });
  }

  handleGoToDashboard = () => {
    appStore.goToDashboard();
  }

  handleCreateInstance = () => {
    appStore.createInstance();
  }

  render() {
    const { classes } = this.props;
    if (instanceStore.hasUnsavedChanges && !matchPath(this.state.currentLocationPathname, { path: "/instance/:mode/:id*", exact: "true" })) {
      return (
        <div className={`${classes.savebar} ${instanceStore.showSaveBar ? "show" : ""}`}>
          <div className={classes.savebarToggle} onClick={this.handleToggleSaveBar}>
            <FontAwesomeIcon className={classes.savebarToggleIcon} icon={"exclamation-triangle"} />&nbsp;
            <FontAwesomeIcon icon={"caret-down"} />&nbsp;
            <FontAwesomeIcon icon={"pencil-alt"} />
          </div>
          <SaveBar />
        </div>
      );
    }
    return null;
  }
}

export default SavePanel;

