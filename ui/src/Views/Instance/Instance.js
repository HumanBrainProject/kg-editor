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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import instanceStore from "../../Stores/InstanceStore";

import Preview from "../Preview";
import InstanceView from "./InstanceView";
import InstanceInvite from "./InstanceInvite";
import InstanceGraph from "./InstanceGraph";
import InstanceRelease from "./InstanceRelease";
import InstanceManage from "./InstanceManage";
import SaveBar from "./SaveBar";
import Tabs from "./Tabs";

const styles = {
  container: {
    display: "grid",
    height: "100%",
    gridTemplateRows: "100%",
    gridTemplateColumns: "50px 1fr 400px",
    "&.hide-savebar": {
      gridTemplateColumns: "50px 1fr",
      "& $sidebar": {
        display: "none"
      }
    }
  },
  loader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    background: "var(--bg-color-blend-contrast1)",
    "& .fetchingPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  },
  body: {
    position: "relative",
    overflow: "hidden"
  },
  sidebar: {
    position: "relative",
    background: "var(--bg-color-ui-contrast2)",
    borderLeft: "1px solid var(--border-color-ui-contrast1)",
    overflow: "auto",
    color: "var(--ft-color-loud)"
  },
  previewPanel: {
    position: "absolute",
    top: 0,
    right: "-600px",
    maxWidth: "45%",
    width: "600px",
    height: "100%",
    color: "var(--ft-color-loud)",
    background: "var(--bg-color-ui-contrast2)",
    border: 0,
    borderLeft: "1px solid var(--border-color-ui-contrast1)",
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
    transition: "right 0.3s ease-in-out",
    zIndex: 3,
    "&.show": {
      right: 0
    },
    "& h3": {
      margin: "10px 10px 0 10px"
    }
  },
  closePreviewBtn: {
    position: "absolute",
    top: "5px",
    right: "5px",
    width: "28px",
    height: "30px",
    padding: "5px",
    textAlign: "center",
    cursor: "pointer"
  }
};

@injectStyles(styles)
@observer
class Instance extends React.Component {

  handleHidePreview = () => instanceStore.togglePreviewInstance();

  renderView = (instance, mode) => {
    switch (mode) {
    case "create":
    case "edit":
    case "view":
      return (
        <InstanceView instance={instance} />
      );
    case "invite":
      return (
        <InstanceInvite instance={instance} />
      );
    case "graph":
      return (
        <InstanceGraph instance={instance} />
      );
    case "release":
      return (
        <InstanceRelease instance={instance} />
      );
    case "manage":
      return (
        <InstanceManage instance={instance} />
      );
    default:
      return null;
    }
  }

  render() {
    const {classes, instance, mode} = this.props;
    const previewInstance = instanceStore.previewInstance;
    const previewOptions = previewInstance?(previewInstance.options?previewInstance.options:{}):{};

    return (
      <React.Fragment>
        <div className={`${classes.container} ${!instanceStore.hasUnsavedChanges && mode !== "edit"? "hide-savebar":""}`}>
          <Tabs mode={mode} instance={instance} />
          <div className={classes.body}>
            {this.renderView(instance, mode)}
          </div>
          <div className={classes.sidebar}>
            <SaveBar/>
          </div>
        </div>
        <div className={`${classes.previewPanel} ${previewInstance?"show":""}`}>
          {previewInstance && (
            <React.Fragment>
              <h3>Preview</h3>
              <Preview instanceId={previewInstance.id}
                instanceName={previewInstance.name}
                showEmptyFields={previewOptions.showEmptyFields}
                showAction={previewOptions.showAction}
                showBookmarkStatus={previewOptions.showBookmarkStatus}
                showType={previewOptions.showType}
                showStatus={previewOptions.showStatus} />
              <div className={classes.closePreviewBtn} title="close preview" onClick={this.handleHidePreview}>
                <FontAwesomeIcon icon={"times"} />
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Instance;