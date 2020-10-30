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

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { createUseStyles } from "react-jss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import instancesStore from "../Stores/InstancesStore";
import viewStore from "../Stores/ViewStore";
import appStore from "../Stores/AppStore";
import routerStore from "../Stores/RouterStore";

import View from "./Instance/Instance";
import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";
import TypeSelection from "./Instance/TypeSelection";

const useStyles = createUseStyles({
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
});

const Instance = observer(({ match, mode }) => {

  const classes = useStyles();

  const id = match.params.id;

  useEffect(() => {
    appStore.openInstance(id, id, {}, mode);
    instancesStore.togglePreviewInstance();
    viewStore.selectViewByInstanceId(id);
    const instance = instancesStore.instances.get(id);
    if (instance && instance.isFetched) {
      if (mode === "create") {
        routerStore.history.replace(`/instances/${id}/edit`);
      }
    } else {
      instancesStore.checkInstanceIdAvailability(id, mode);
    }
  }, [id, mode]);

  const handleRetry = () => instancesStore.checkInstanceIdAvailability(id, mode === "create");

  const handleContinue = () => {
    instancesStore.instanceIdAvailability.delete(id);
    routerStore.history.replace("/browse");
  };

  const handleCreateNewInstanceOfType = type => {
    instancesStore.createNewInstance(type, id);
    instancesStore.resetInstanceIdAvailability();
  };

  const instance = instancesStore.instances.get(id);
  if (instance && instance.isFetched) {
    return (
      <View instance={instance} mode={mode} />
    );
  }

  const status = instancesStore.instanceIdAvailability.get(id);

  if (!status || status.isChecking) {
    return (
      <div className={classes.error}>
        <FetchingLoader>
          <span>Fetching instance &quot;<i>{id}&quot;</i> information...</span>
        </FetchingLoader>
      </div>
    );
  }

  if (status.error || (status.isAvailable && mode !== "create")) {
    return (
      <BGMessage icon={"ban"}>
          There was a network problem fetching the instance.<br />
          If the problem persists, please contact the support.<br />
        <small>{status.error}</small><br /><br />
        <Button variant={"primary"} onClick={handleRetry}>
          <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
        </Button>
        <Button variant={"primary"} onClick={handleContinue}>Continue</Button>
      </BGMessage>
    );
  }

  if (status.isAvailable && mode === "create") {
    return (
      <TypeSelection onSelect={handleCreateNewInstanceOfType} />
    );
  }

  return null;
});

export default Instance;