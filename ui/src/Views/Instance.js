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

import instanceStore from "../Stores/InstanceStore";

import InstanceCreate from "./Instance/InstanceCreate";
import InstanceView from "./Instance/InstanceView";
import InstanceInvite from "./Instance/InstanceInvite";
import InstanceGraph from "./Instance/InstanceGraph";
import InstanceRelease from "./Instance/InstanceRelease";
import InstanceManage from "./Instance/InstanceManage";
import SaveBar from "./Instance/SaveBar";
import Preview from "./Preview";
import Tabs from "./Instance/Tabs";
import appStore from "../Stores/AppStore";

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
class Edit extends React.Component {
  componentDidMount() {
    const instanceId = this._constructInstanceId(this.props.match.params);
    if(instanceId) {
      const isReadMode = this.props.mode !== "edit";
      instanceStore.openInstance(instanceId, this.props.mode);
      instanceStore.setReadMode(isReadMode);
    }
  }

  componentDidUpdate(prevProps) {
    const prevInstanceId = this._constructInstanceId(prevProps.match.params);
    const instanceId = this._constructInstanceId(this.props.match.params);
    if (prevInstanceId && instanceId && (instanceId !== prevInstanceId) || (this.props.mode !== prevProps.mode)) {
      const isReadMode = this.props.mode !== "edit";
      instanceStore.openInstance(instanceId, this.props.mode);
      instanceStore.setReadMode(isReadMode);
    }
  }

  handleSelectMode(mode) {
    instanceStore.togglePreviewInstance();
    const instanceId = this._constructInstanceId(this.props.match.params);
    routerStore.history.push(`/instance/${mode}/${instanceId}`);
  }

  handleHidePreview = () => {
    instanceStore.togglePreviewInstance();
  }

  _constructInstanceId = params => (params.org && params.domain && params.schema && params.version && params.id) ?
    `${params.org}/${params.domain}/${params.schema}/${params.version}/${params.id}`:
    null;


  render() {
    const {classes} = this.props;
    const instanceId = this._constructInstanceId(this.props.match.params);
    const openedInstance = instanceId?instanceStore.openedInstances.get(instanceId):null;

    if (!openedInstance) {
      return null;
    }

    const instance = instanceId?instanceStore.instances.get(instanceId):null;
    if (!instance) {
      return null;
    }

    return (
      <React.Fragment>
        <div className={`${classes.container} ${!instanceStore.hasUnsavedChanges && openedInstance.viewMode !== "edit"? "hide-savebar":""}`}>
          <Tabs mode={openedInstance.viewMode} id={this.props.match.params.id} />
          <div className={classes.body}>
            {openedInstance.viewMode === "create"?
              <InstanceCreate instanceId={this.props.match.params.id} paneStore={openedInstance.paneStore} />
              :
              openedInstance.viewMode === "edit" || openedInstance.viewMode === "view"?
                <InstanceView instanceId={this.props.match.params.id} paneStore={openedInstance.paneStore} />
                : openedInstance.viewMode === "invite" ?
                  <InstanceInvite id={this.props.match.params.id}/>
                  : openedInstance.viewMode === "graph" ?
                    <InstanceGraph id={this.props.match.params.id}/>
                    : openedInstance.viewMode === "release" ?
                      <InstanceRelease id={this.props.match.params.id}/>
                      : openedInstance.viewMode === "manage" ?
                        <InstanceManage id={this.props.match.params.id}/>
                        : null}
          </div>
          <div className={classes.sidebar}>
            <SaveBar/>
          </div>
        </div>
        <div className={`${classes.previewPanel} ${appStore.previewInstance?"show":""}`}>
          {appStore.previewInstance && (
            <React.Fragment>
              <h3>Preview</h3>
              <Preview instanceId={appStore.previewInstance.id}
                instanceName={appStore.previewInstance.name}
                showEmptyFields={appStore.previewInstance.options && appStore.previewInstance.options.showEmptyFields}
                showAction={appStore.previewInstance.options && appStore.previewInstance.options.showAction}
                showBookmarkStatus={appStore.previewInstance.options && appStore.previewInstance.options.showBookmarkStatus}
                showType={appStore.previewInstance.options && appStore.previewInstance.options.showType}
                showStatus={appStore.previewInstance.options && appStore.previewInstance.options.showStatus} />
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

export default Edit;