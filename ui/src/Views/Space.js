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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useStores } from "../Hooks/UseStores";

import Types from "./Types";
import SpaceModal from "./SpaceModal";

const Space = observer(({space}) => {

  const [isInitialized, setInitialized] = useState(false);

  const { appStore, authStore } = useStores();

  useEffect(() => {
    const selectedSpace = getSpace(space);
    appStore.setSpace(selectedSpace);
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space]);

  const getSpace = name => {

    if (name && authStore.spaces.find(s => s.id === name)) {
      return name;
    }
    const savedSpaceName = localStorage.getItem("space");
    if (!savedSpaceName) {
      return null;
    }
    if (authStore.spaces.find(s => s.id === savedSpaceName)) {
      return savedSpaceName;
    }
    return null;
  }

  if (!isInitialized) {
    return null;
  }

  if (!appStore.currentSpace) {
    return (
      <SpaceModal/>
    );
  }

  return (
    <Types />
  );
});
Space.displayName = "Space";

export default Space;