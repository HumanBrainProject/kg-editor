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

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation } from "react-router-dom";

import RootStore from "../Stores/RootStore";

const BrowserEventHandler = observer(({ stores }: { stores: RootStore }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { appStore, instanceStore } = stores;

  useEffect(() => {
    window.onpopstate = () => {
      const path = location.pathname;
      if(path.startsWith("/instance")) {
        const id = path.split("/")[2];
        const instance = instanceStore?.instances.get(id);
        const currentSpace = appStore.currentSpace as { id: string}|null;
        if (!instance || instance.space !== currentSpace?.id) {
          appStore.closeInstance(location, navigate, id);
          window.location.replace(location.pathname);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
});
BrowserEventHandler.displayName = "BrowserEventHandler";

export default BrowserEventHandler;