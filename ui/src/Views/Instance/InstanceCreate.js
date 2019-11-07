import React from "react";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import injectStyles from "react-jss";

import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import InstanceView from "./InstanceView";
import TypeSelection from "./TypeSelection";

const styles = {
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
  error: {
    color: "var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class InstanceCreate extends React.Component {

  componentDidMount() {
    this.handleResultId();
  }

  componentDidUpdate() {
    this.handleResultId();
  }

  handleResultId = () => {
    if (!instanceStore.instanceIdAvailability.isChecking && !instanceStore.instanceIdAvailability.error && this.props.instanceId === instanceStore.instanceIdAvailability.instanceId) {
      if (!instanceStore.instanceIdAvailability.isAvailable) {
        const resolvedId = instanceStore.instanceIdAvailability.resolvedId?instanceStore.instanceIdAvailability.resolvedId:this.props.instanceId;
        this.resetInstanceIdAvailability();
        routerStore.history.replace(`/instance/edit/${resolvedId}`);
      }
    }
  }

  resetInstanceIdAvailability = () => {
    if (this.props.instanceId === instanceStore.instanceIdAvailability.instanceId) {
      instanceStore.resetInstanceIdAvailability();
    }
  }

  handleCheckInstanceIdAvailability = () => instanceStore.checkInstanceIdAvailability(this.props.instanceId);

  handleCreateNewInstanceOfType = type => {
    instanceStore.createNewInstance(type, this.props.instanceId);
    this.resetInstanceIdAvailability();
  }

  render() {
    const { classes, instanceId, paneStore } = this.props;

    const instance = instanceId?instanceStore.instances.get(instanceId):null;

    if (instance) {
      return (
        <InstanceView instanceId={instanceId} paneStore={paneStore} />
      );
    }

    if (instanceId === instanceStore.instanceIdAvailability.instanceId) {
      if (instanceStore.instanceIdAvailability.isChecking) {
        return (
          <div className={classes.loader}>
            <FetchingLoader>Processing...</FetchingLoader>
          </div>
        );
      }
      if (instanceStore.instanceIdAvailability.error) {
        return (
          <div className={classes.error}>
            <BGMessage icon={"ban"}>
                There was a network problem.<br />
                If the problem persists, please contact the support.<br />
              <small>{instanceStore.instanceIdAvailability.error}</small><br /><br />
              <div>
                <Button bsStyle={"primary"} onClick={this.handleCheckInstanceIdAvailability}>
                  <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
                </Button>
              </div>
            </BGMessage>
          </div>
        );
      }

      return (
        <TypeSelection onSelect={this.handleCreateNewInstanceOfType} />
      );
    }

    return null;
  }
}