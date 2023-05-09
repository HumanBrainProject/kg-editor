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
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { createUseStyles } from "react-jss";

import useStores from "../Hooks/useStores";

import Tab from "../Components/Tab";
import Matomo from "../Services/Matomo";

const useStyles = createUseStyles({
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 0.5fr))"
  }
});

const getLabel = (instance, view) => {
  if(instance && (instance.isFetched || instance.isLabelFetched)) {
    return instance.name;
  }
  if(view.name) {
    return view.name;
  }
  return view.instanceId;
};

const getColor = (instance, view) => {
  if(instance && (instance.isFetched || instance.isLabelFetched)) {
    return instance.primaryType.color;
  }
  if(view.color) {
    return view.color;
  }
  return "";
};

const getDescription = (instance, view) => {
  if(instance && (instance.isFetched || instance.isLabelFetched)) {
    if(instance.primaryType.description && instance.primaryType.name) {
      return `${instance.primaryType.name} - ${instance.primaryType.description}`;
    }
    if(instance.primaryType.description) {
      return instance.primaryType.description;
    }
    return instance.primaryType.name;
  }
  if(view.description) {
    return view.description;
  }
  return "";
}

const InstanceTab = observer(({view, pathname}) => {

  const location = useLocation();
  const navigate = useNavigate();

  const { appStore, instanceStore, viewStore } = useStores();

  const instance = instanceStore.instances.get(view.instanceId);

  useEffect(() => {
    if (instance && instance.name !== view.name && instance.primaryType.color !== view.color) {
      if (instance.name !== instance.id) { 
        view.setNameAndColor(instance.name, instance.primaryType.color);
        viewStore.syncStoredViews();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, view]);

  const isCurrent = (instanceId, mode) => {
    if(mode !== "view") {
      return matchPath({ path: `/instances/${instanceId}/${mode}` }, pathname);
    }
    return matchPath({ path: `/instances/${instanceId}` }, pathname);
  };


  const handleClose = () => {
    if(isCurrent(view.instanceId, view.mode)) {
      Matomo.trackEvent("Tab", "CloseCurrentInstance", view.instanceId);
    } else {
      Matomo.trackEvent("Tab", "CloseOtherInstance", view.instanceId);
    }
    appStore.closeInstance(location, navigate, view.instanceId);
  }

  const label = getLabel(instance, view);
  const color = getColor(instance, view);
  const description =  getDescription(instance, view);

  return (
    <Tab
      icon={instance && instance.isFetching ? "circle-notch" : "circle"}
      iconSpin={instance && instance.isFetching}
      iconColor={color}
      current={isCurrent(view.instanceId, view.mode)}
      path={view.mode === "view" ? `/instances/${view.instanceId}`:`/instances/${view.instanceId}/${view.mode}`}
      onClose={handleClose}
      label={label}
      description={description}
    />
  );
});
InstanceTab.displayName = "InstanceTab";

const InstanceTabs = observer(({ pathname }) => {

  const classes = useStyles();

  const { userProfileStore, viewStore } = useStores();

  return (
    <div className={classes.container} >
      {userProfileStore.isAuthorized && Array.from(viewStore.views.values()).map(view => (
        <InstanceTab key={view.instanceId} view={view} pathname={pathname} />
      ))}
    </div>
  );
});
InstanceTabs.displayName = "InstanceTabs";

export default InstanceTabs;