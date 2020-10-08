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

/* eslint-disable indent */
import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";

import appStore from "../../Stores/AppStore";
import releaseStore from "../../Stores/ReleaseStore";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import SavingModal from "./InstanceRelease/SavingModal";
import CompareInstancesModal from "./InstanceRelease/CompareInstancesModal";

import ReleaseList from "./InstanceRelease/ReleaseList";
import ReleaseAction from "./InstanceRelease/ReleaseAction";

import ReleaseNodeAndChildrenToggle from "./InstanceRelease/ReleaseNodeAndChildrenToggle";
import HideReleasedInstancesToggle from "./InstanceRelease/HideReleasedInstancesToggle";


const rootPath = window.rootPath || "";

const styles = {
  container: {
    position: "relative",
    width: "calc(100% - 30px)",
    height: "calc(100% - 30px)",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    color: "var(--ft-color-normal)",
    margin: "15px"
  },
  panel: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "1fr 580px",
    gridColumnGap: "15px",
    height: "100%",
  },
  header: {
    gridColumn: "span 2",
    position: "relative",
    "& h2": {
      margin: "10px 0 0 0",
      color: "var(--ft-color-loud)"
    }
  },
  action: {
    marginTop: "64px"
  },
  listPnl: {
    display: "flex",
    flexDirection: "column"
  },
  listHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: "45px",
    paddingTop: "35px",
    paddingBottom: "5px"
  },
  list: {
    flex: 1,
    backgroundColor: "var(--bg-color-ui-contrast3)",
    padding: "10px",
    border: "1px solid var(--border-color-ui-contrast1)"
  }
};

@injectStyles(styles)
@observer
class InstanceRelease extends React.Component {
  componentDidMount() {
    releaseStore.setTopInstanceId(this.props.instance.id);
    releaseStore.fetchReleaseData();
    //releaseStore.fetchWarningMessages(); TODO:check if this is still valid
  }

  componentDidUpdate(prevProps) {
    if (this.props.instance !== prevProps.instance) {
      releaseStore.setTopInstanceId(this.props.instance.id);
      releaseStore.clearWarningMessages();
      releaseStore.fetchReleaseData();
    }
  }

  handleDismissSaveError = () => {
    releaseStore.dismissSaveError();
  };

  handleRetryFetching = () => {
    releaseStore.fetchReleaseData();
  };

  render() {
    const { classes } = this.props;
    return releaseStore ? (
      <div className={classes.container}>
        {releaseStore.saveError ? (
          <BGMessage icon="ban">
            There has been an error while releasing one or more instances.
            <br />
            Please try again or contact our support if the problem persists.
            <br />
            <br />
            <small>{releaseStore.saveError}</small>
            <br />
            <br />
            <Button bsStyle="primary" onClick={this.handleDismissSaveError}>
              OK
            </Button>
          </BGMessage>
        ) : releaseStore.fetchError ? (
          <BGMessage icon="ban">
            There has been an error while fetching the release data for the
            instance &quot;<i>{this.props.instance.id}&quot;</i>.
            <br />
            Please try again or contact our support if the problem persists.
            <br />
            <br />
            <small>{releaseStore.fetchError}</small>
            <br />
            <br />
            <Button bsStyle="primary" onClick={this.handleRetryFetching}>
              Retry
            </Button>
          </BGMessage>
        ) : (
          releaseStore.isFetching ? (
            <FetchingLoader>
              <span>Fetching release data of instance &quot;<i>{this.props.instance.id}&quot;</i>...</span>
            </FetchingLoader>
          ) : (
            <div className={classes.panel}>
              <div className={classes.header}>
                <h2>Release Management</h2>
              </div>
              <div className={classes.listPnl}>
                <div className={classes.listHeader}>
                  <HideReleasedInstancesToggle />
                  <ReleaseNodeAndChildrenToggle />
                </div>
                <div className={classes.list}>
                  <ReleaseList />
                </div>
              </div>
              <div className={classes.action}>
                <ReleaseAction />
              </div>
              <SavingModal />
              {appStore.comparedWithReleasedVersionInstance &&
                  appStore.comparedWithReleasedVersionInstance
                    .id && (
                <CompareInstancesModal />
              )}
            </div>
          )
        )}
      </div>
    ) : null;
  }
}

export default InstanceRelease;