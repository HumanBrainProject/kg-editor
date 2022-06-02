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
import {useNavigate} from "react-router-dom";
import { observer } from "mobx-react-lite";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";

import { useStores } from "../Hooks/UseStores";

import SpinnerPanel from "../Components/SpinnerPanel";
import ErrorPanel from "../Components/ErrorPanel";
import Space from "./Space";

const RawInstance = observer(({instanceId}) => {
  const navigate = useNavigate();
  const {instanceStore, authStore} = useStores();

  useEffect(() => {
    const instance = instanceStore.createInstanceOrGet(instanceId);
    instance.fetchRaw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const handleRetry = () => instance.fetchRaw();

  const handleContinue = () => navigate("/browse");

  const instance = instanceStore.instances.get(instanceId);

  if(!instance) {
    return null;
  }

  if (instance.rawFetchError) {
    return (
      <ErrorPanel>
        There was a network problem retrieving the instance.<br />
        If the problem persists, please contact the support.<br />
        <small>{instance.rawFetchError}</small><br /><br />
        <Button variant={"primary"} onClick={handleRetry}>
          <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
        </Button>
        <Button variant={"primary"} onClick={handleContinue}>Continue</Button>
      </ErrorPanel>
    );
  }

  if (!instance.isRawFetched || instance.isRawFetching) {
    return (
      <SpinnerPanel text={`Retrieving instance ${instanceId}...`} />
    );
  }

  if (!authStore.spaces.find(s => s.id === instance.space)) {
    return (
      <ErrorPanel>
        You do not have permission to access the space &quot;<i>{instance.space}&quot;</i>.<br /><br />
        <Button variant={"primary"} onClick={handleContinue}>Continue</Button>
      </ErrorPanel>
    );
  }

  return (
    <Space space={instance.space} />
  );
});
RawInstance.displayName = "RawInstance";

export default RawInstance;