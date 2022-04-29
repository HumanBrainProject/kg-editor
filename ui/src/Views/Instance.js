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

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ReactPiwik from "react-piwik";

import Button from "react-bootstrap/Button";

import { useStores } from "../Hooks/UseStores";

import View from "./Instance/Instance";
import Spinner from "../Components/Spinner";
import BGMessage from "../Components/BGMessage";
import TypeSelection from "./Instance/TypeSelection";
import { useNavigate, useParams } from "react-router-dom";

const useStyles = createUseStyles({
  loader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    background: "var(--bg-color-blend-contrast1)",
    "& .spinnerPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  },
  error: {
    padding: "20px",
    color: "var(--ft-color-loud)",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    "& button": {
      marginTop: "20px",
      "& + button": {
        marginLeft: "20px"
      }
    }
  }
});

const Instance = observer(({ mode }) => {

  const classes = useStyles();
  const { appStore, instanceStore, viewStore, typeStore } = useStores();
  const navigate = useNavigate();
  const params = useParams();

  const id = params.id;

  useEffect(() => {
    if (typeStore.isFetched) {
      ReactPiwik.push(["setCustomUrl", window.location.href]);
      ReactPiwik.push(["trackPageView"]);
      appStore.openInstance(id, id, {}, mode);
      instanceStore.togglePreviewInstance();
      viewStore.selectViewByInstanceId(id);
      const instance = instanceStore.instances.get(id); //NOSONAR
      if (instance && ((mode === "raw" && instance.isRawFetched) || (mode !== "raw" && instance.isFetched))) {
        if (mode === "create" && !instance.isNew) {
          navigate(`/instances/${id}/edit`, {replace: true});
        }
      } else {
        instanceStore.checkInstanceIdAvailability(id, mode, navigate);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode, typeStore.isFetched]);

  const handleRetry = () => instanceStore.checkInstanceIdAvailability(id, mode, navigate);

  const handleContinue = () => {
    instanceStore.instanceIdAvailability.delete(id);
    navigate(`/browse`, {replace: true});
  };

  const handleCreateNewInstanceOfType = type => {
    instanceStore.createNewInstance(type, id);
    instanceStore.resetInstanceIdAvailability();
  };

  const handleLoadTypes = () => typeStore.fetch();

  if (typeStore.fetchError) {
    return (
      <BGMessage icon={"ban"} className={classes.error}>
        There was a network problem fetching the types.<br />
        If the problem persists, please contact the support.<br />
        <small>{typeStore.fetchError}</small><br /><br />
        <Button variant={"primary"} onClick={handleLoadTypes}>
          <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
        </Button>
      </BGMessage>
    );
  }

  if (!typeStore.isFetched) {
    return (
      <div className={classes.loader}>
        <Spinner>
          <span>Fetching types...</span>
        </Spinner>
      </div>
    );
  }

  const instance = instanceStore.instances.get(id);
  if (instance && ((mode === "raw" && instance.isRawFetched) || (mode !== "raw" && instance.isFetched))) {
    return (
      <View instance={instance} mode={mode} />
    );
  }

  const status = instanceStore.instanceIdAvailability.get(id);

  if (!status || status.isChecking) {
    return (
      <div className={classes.loader}>
        <Spinner>
          <span>Fetching instance &quot;<i>{id}&quot;</i> information...</span>
        </Spinner>
      </div>
    );
  }

  if (status.error || (status.isAvailable && mode !== "create")) {
    return (
      <BGMessage icon={"ban"} className={classes.error}>
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
Instance.displayName = "Instance";

export default Instance;