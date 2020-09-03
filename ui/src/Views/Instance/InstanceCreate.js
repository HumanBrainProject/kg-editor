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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import injectStyles from "react-jss";

import instanceStore from "../../Stores/InstanceStore";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import InstanceView from "./InstanceView";
import TypeSelection from "./TypeSelection";
import appStore from "../../Stores/AppStore";

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
class InstanceCreate extends React.Component {

  handleCheckInstanceIdAvailability = () => appStore.checkInstanceIdAvailability(this.props.instanceId);

  handleCreateNewInstanceOfType = type => {
    instanceStore.createNewInstance(appStore.currentWorkspace.id, type, this.props.instanceId);
    appStore.resetInstanceIdAvailability();
  }

  render() {
    const { classes, instanceId, paneStore } = this.props;

    const status = appStore.instanceIdAvailability.get(instanceId);
    const instance = instanceStore.instances.get(instanceId);

    if (instance) {
      return (
        <InstanceView instance={instance} paneStore={paneStore} />
      );
    }

    if (status) {
      if (status.isChecking) {
        return (
          <div className={classes.loader}>
            <FetchingLoader>Processing...</FetchingLoader>
          </div>
        );
      }
      if (status.error) {
        return (
          <div className={classes.error}>
            <BGMessage icon={"ban"}>
                There was a network problem.<br />
                If the problem persists, please contact the support.<br />
              <small>{status.error}</small><br /><br />
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

export default InstanceCreate;