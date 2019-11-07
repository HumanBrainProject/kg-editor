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
import routerStore from "../Stores/RouterStore";

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
export default class Edit extends React.Component {
  componentDidMount() {
    instanceStore.openInstance(this.props.match.params.id, this.props.mode, this.props.mode !== "edit" && this.props.mode !== "create");
  }

  componentDidUpdate(prevProps) {
    const path = `/instance/${this.props.mode}/${this.props.match.params.id}`;
    if (instanceStore.pathsToResolve.has(path)) {
      const newPath = instanceStore.pathsToResolve.get(path);
      instanceStore.pathsToResolve.delete(path);
      routerStore.history.replace(newPath);
    } else if (this.props.match.params.id !== prevProps.match.params.id || this.props.mode !== prevProps.mode) {
      instanceStore.openInstance(this.props.match.params.id, this.props.mode, this.props.mode !== "edit" && this.props.mode !== "create");
    }
  }

  handleHidePreview = () => {
    instanceStore.togglePreviewInstance();
  }

  render() {
    const {classes} = this.props;
    const openedInstance = this.props.match.params.id?instanceStore.openedInstances.get(this.props.match.params.id):null;

    if (!openedInstance) {
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
        <div className={`${classes.previewPanel} ${instanceStore.previewInstance?"show":""}`}>
          {instanceStore.previewInstance && (
            <React.Fragment>
              <h3>Preview</h3>
              <Preview instanceId={instanceStore.previewInstance.id}
                instanceName={instanceStore.previewInstance.name}
                showEmptyFields={instanceStore.previewInstance.options && instanceStore.previewInstance.options.showEmptyFields}
                showAction={instanceStore.previewInstance.options && instanceStore.previewInstance.options.showAction}
                showBookmarkStatus={instanceStore.previewInstance.options && instanceStore.previewInstance.options.showBookmarkStatus}
                showType={instanceStore.previewInstance.options && instanceStore.previewInstance.options.showType}
                showStatus={instanceStore.previewInstance.options && instanceStore.previewInstance.options.showStatus} />
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