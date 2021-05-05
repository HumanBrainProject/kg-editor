/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

/* eslint-disable indent */
import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";

import releaseStore from "../../Stores/ReleaseStore";
import instanceStore from "../../Stores/InstanceStore";

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
    marginTop: "29px"
  },
  listPnl: {
    display: "flex",
    flexDirection: "column"
  },
  listHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginRight: "23px",
    paddingBottom: "5px"
  },
  list: {
    flex: 1,
    backgroundColor: "var(--bg-color-ui-contrast3)",
    padding: "10px",
    border: "1px solid var(--border-color-ui-contrast1)"
  },
  listFooter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: "5px"
  }
};

@injectStyles(styles)
@observer
export default class InstanceRelease extends React.Component {
  componentDidMount() {
    releaseStore.setTopInstanceId(this.props.id);
    releaseStore.fetchReleaseData();
    releaseStore.fetchWarningMessages();
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      releaseStore.setTopInstanceId(this.props.id);
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
            There has been an error while fetching the release data for this
            instance.
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
              <span>Fetching release data...</span>
            </FetchingLoader>
          ) : (
            <div className={classes.panel}>
              <div className={classes.header}>
                <h2>Release Management</h2>
              </div>
              <div className={classes.listPnl}>
                <div className={classes.listHeader}>
                  <ReleaseNodeAndChildrenToggle />
                </div>
                <div className={classes.list}>
                  <ReleaseList />
                </div>
                <div className={classes.listFooter}>
                  <HideReleasedInstancesToggle />
                </div>
              </div>
              <div className={classes.action}>
                <ReleaseAction />
              </div>
              <SavingModal />
              {instanceStore.comparedWithReleasedVersionInstance &&
                  instanceStore.comparedWithReleasedVersionInstance
                    .relativeUrl && (
                <CompareInstancesModal />
              )}
            </div>
          )
        )}
      </div>
    ) : null;
  }
}
