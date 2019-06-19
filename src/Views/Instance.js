import React from "react";
import {observer} from "mobx-react";
import injectStyles from "react-jss";

import instanceStore from "../Stores/InstanceStore";
import routerStore from "../Stores/RouterStore";

import InstanceForm from "./Instance/InstanceForm";
import InstanceInvite from "./Instance/InstanceInvite";
import InstanceGraph from "./Instance/InstanceGraph";
import InstanceRelease from "./Instance/InstanceRelease";
import InstanceManage from "./Instance/InstanceManage";
import Pane from "./Instance/Pane";
import Links from "./Instance/Links";
import PaneContainer from "./Instance/PaneContainer";
import SaveBar from "./Instance/SaveBar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
      opacity: "1",
    },
    "&.active": {
      background: "var(--list-bg-selected)",
      borderColor: "var(--list-border-selected)",
      color: "var(--ft-color-loud)",
      opacity: "1",
    }
  },
  body: {
    position: "relative",
    overflow: "hidden"
  },
  sidebar: {
    background: "var(--bg-color-ui-contrast2)",
    borderLeft: "1px solid var(--border-color-ui-contrast1)",
    overflow: "auto",
    color: "var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class Edit extends React.Component {
  componentDidMount() {
    instanceStore.openInstance(this.props.match.params.id, this.props.mode, this.props.mode !== "edit");
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id || this.props.mode !== prevProps.mode) {
      instanceStore.openInstance(this.props.match.params.id, this.props.mode, this.props.mode !== "edit");
    }
  }

  handleSelectMode(mode) {
    routerStore.history.push(`/instance/${mode}/${this.props.match.params.id}`);
  }

  render() {
    const {classes} = this.props;
    const openedInstance = this.props.match.params.id?instanceStore.openedInstances.get(this.props.match.params.id):null;
    const instance = this.props.match.params.id?instanceStore.getInstance(this.props.match.params.id):null;

    return (
      openedInstance ?
        <div className={`${classes.container} ${!instanceStore.hasUnsavedChanges && openedInstance.viewMode !== "edit"? "hide-savebar":""}`}>
          <div className={classes.tabs}>
            <div className={`${classes.tab} ${openedInstance.viewMode === "view"?"active":""}`} onClick={this.handleSelectMode.bind(this, "view")}>
              <FontAwesomeIcon icon="eye"/>
            </div>
            <div className={`${classes.tab} ${openedInstance.viewMode === "edit"?"active":""}`} onClick={this.handleSelectMode.bind(this, "edit")}>
              <FontAwesomeIcon icon="pencil-alt"/>
            </div>
            <div className={`${classes.tab} ${openedInstance.viewMode === "invite" ? "active" : ""}`} onClick={this.handleSelectMode.bind(this, "invite")}>
              <FontAwesomeIcon icon="user-edit"/>
            </div>
            <div className={`${classes.tab} ${openedInstance.viewMode === "graph" ? "active" : ""}`} onClick={this.handleSelectMode.bind(this, "graph")}>
              <FontAwesomeIcon icon="project-diagram"/>
            </div>
            <div className={`${classes.tab} ${openedInstance.viewMode === "release"?"active":""}`} onClick={this.handleSelectMode.bind(this, "release")}>
              <FontAwesomeIcon icon="cloud-upload-alt"/>
            </div>
            <div className={`${classes.tab} ${openedInstance.viewMode === "manage"?"active":""}`} onClick={this.handleSelectMode.bind(this, "manage")}>
              <FontAwesomeIcon icon="cog"/>
            </div>
          </div>
          <div className={classes.body}>
            {openedInstance.viewMode === "edit" || openedInstance.viewMode === "view"?
              <PaneContainer key={this.props.match.params.id} paneStore={openedInstance.paneStore}>
                <React.Fragment>
                  <Pane paneId={this.props.match.params.id} key={this.props.match.params.id}>
                    <InstanceForm level={0} id={this.props.match.params.id} mainInstanceId={this.props.match.params.id} />
                  </Pane>
                  {!instance.hasFetchError?
                    <Links level={1} id={this.props.match.params.id} mainInstanceId={this.props.match.params.id} />
                    :null}
                </React.Fragment>
              </PaneContainer>
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
        </div>:null
    );
  }
}