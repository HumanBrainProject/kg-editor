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
import useStores from "../Hooks/useStores";

import Matomo from "../Services/Matomo";
import Instance from "./Instance/Instance";
import { useNavigate, useParams } from "react-router-dom";



const InstanceView = observer(({ mode }) => {

  const { appStore, instanceStore, viewStore, typeStore } = useStores();
  const navigate = useNavigate();
  const params = useParams();

  const instanceId = params.id;

  useEffect(() => {
    Matomo.trackCustomUrl(window.location.href);
    Matomo.trackPageView();
    appStore.openInstance(instanceId, instanceId, {}, mode);
    instanceStore.togglePreviewInstance();
    viewStore.selectViewByInstanceId(instanceId);
    const instance = instanceStore.instances.get(instanceId); //NOSONAR
    if (instance.space ===  typeStore.space) {
      const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);
      if (!isTypesSupported && !["raw", "graph", "manage"].includes(mode)) {
        navigate(`/instances/${instanceId}/raw`, {replace: true});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, mode, typeStore.space]);

  const instance = instanceStore.instances.get(instanceId);
  const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);
  if (instance.space !== typeStore.space || (!isTypesSupported && !["raw", "graph", "manage"].includes(mode))) {
    return null;
  }

  return (
    <Instance instance={instance} mode={mode} />
  );
});
InstanceView.displayName = "InstanceView";

export default InstanceView;