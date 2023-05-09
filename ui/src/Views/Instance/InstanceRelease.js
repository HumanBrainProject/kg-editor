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
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";

import useStores from "../../Hooks/useStores";

import SpinnerPanel from "../../Components/SpinnerPanel";
import ErrorPanel from "../../Components/ErrorPanel";
import SavingModal from "./InstanceRelease/SavingModal";
import CompareInstancesModal from "./InstanceRelease/CompareInstancesModal";

import ReleaseList from "./InstanceRelease/ReleaseList";
import ReleaseAction from "./InstanceRelease/ReleaseAction";

import ReleaseNodeAndChildrenToggle from "./InstanceRelease/ReleaseNodeAndChildrenToggle";
import HideReleasedInstancesToggle from "./InstanceRelease/HideReleasedInstancesToggle";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "calc(100% - 30px)",
    height: "calc(100% - 30px)",
    color: "var(--ft-color-normal)",
    margin: "15px"
  },
  panel: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "1fr 580px",
    gridColumnGap: "15px",
    height: "100%"
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
});

const InstanceRelease = observer(({ instance }) => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  useEffect(() => {
    releaseStore.setTopInstanceId(instance.id);
    releaseStore.clearWarningMessages();
    releaseStore.fetchReleaseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance.id]);

  const handleDismissSaveError = () => releaseStore.dismissSaveError();

  const handleRetryFetching = () => releaseStore.fetchReleaseData();

  if (!releaseStore) {
    return (
      <div className={classes.container}></div>
    );
  }

  if (releaseStore.saveError) {
    return (
    <ErrorPanel>
        There has been an error while releasing one or more instances.
        <br />
        Please try again or contact our support if the problem persists.
        <br />
        <br />
        <small>{releaseStore.saveError}</small>
        <br />
        <br />
        <Button variant="primary" onClick={handleDismissSaveError}>
          OK
        </Button>
      </ErrorPanel>
    );
  }

  if (releaseStore.fetchError) {
    return (
      <ErrorPanel>
        There has been an error while retrieving the release data for the
        instance &quot;<i>{instance.id}&quot;</i>.
        <br />
        Please try again or contact our support if the problem persists.
        <br />
        <br />
        <small>{releaseStore.fetchError}</small>
        <br />
        <br />
        <Button variant="primary" onClick={handleRetryFetching}>
          Retry
        </Button>
      </ErrorPanel>
    );
  }

  if (releaseStore.isFetching) {
    return (
      <SpinnerPanel text={`Retrieving release data of instance ${instance.id}...`} />
    );
  }

  return (
    <div className={classes.container}>
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
        {releaseStore.comparedInstance && releaseStore.comparedInstance.id && (
          <CompareInstancesModal />
        )}
      </div>
    </div>
  );
});
InstanceRelease.displayName = "InstanceRelease";

export default InstanceRelease;