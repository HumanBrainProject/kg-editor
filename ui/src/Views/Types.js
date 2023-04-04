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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button"

import { useStores } from "../Hooks/UseStores";

import SpinnerPanel from "../Components/SpinnerPanel";
import ErrorPanel from "../Components/ErrorPanel";
import View from "./View";

const Types = observer(() => {

  const { appStore, typeStore } = useStores();

  const handeRetry = () => typeStore.fetch(appStore.currentSpace.id);

  useEffect(() => {
    typeStore.fetch(appStore.currentSpace.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appStore.currentSpace.id]);

  if (!appStore.currentSpace) {
    return null;
  }

  if (typeStore.space === appStore.currentSpace.id && typeStore.fetchError) {
    return (
      <ErrorPanel>
        {typeStore.fetchError}<br /><br />
        <Button variant={"primary"} onClick={handeRetry}>
          <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
        </Button>
      </ErrorPanel>
    );
  }

  if (typeStore.isFetching) {
    return <SpinnerPanel text="Retrieving types..." />;
  }

  if (typeStore.space === appStore.currentSpace.id && typeStore.isFetched) {
    return (
      <View />
    );
  }

  return null;
});
Types.displayName = "Types";

export default Types;