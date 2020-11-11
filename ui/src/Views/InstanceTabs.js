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
import { observer } from "mobx-react-lite";
import { matchPath } from "react-router-dom";
import { createUseStyles } from "react-jss";

import { useStores } from "../Hooks/UseStores";

import Tab from "../Components/Tab";

const useStyles = createUseStyles({
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 0.5fr))"
  }
});

const InstanceTab = observer(({view, pathname}) => {

  const { appStore, instancesStore, viewStore } = useStores();

  const instance = instancesStore.instances.get(view.instanceId);

  useEffect(() => {
    if (instance && instance.name !== view.name && instance.primaryType.color !== view.color) {
      view.setNameAndColor(instance.name, instance.primaryType.color);
      viewStore.syncStoredViews();
    }
  }, [viewStore, instance, view]);

  const isCurrent = (instanceId, mode) => {
    if(mode !== "view") {
      return matchPath(pathname, { path: `/instances/${instanceId}/${mode}`, exact: "true" });
    }
    return matchPath(pathname, { path: `/instances/${instanceId}`, exact: "true" });
  };


  const handleClose = () => appStore.closeInstance(view.instanceId);

  const label = (instance && (instance.isFetched || instance.isLabelFetched))?instance.name:(view.name?view.name:view.instanceId);
  const color = (instance && (instance.isFetched || instance.isLabelFetched))?instance.primaryType.color:(view.color?view.color:"");
  return (
    <Tab
      icon={instance && instance.isFetching ? "circle-notch" : "circle"}
      iconSpin={instance && instance.isFetching}
      iconColor={color}
      current={isCurrent(view.instanceId, view.mode)}
      path={view.mode === "view" ? `/instances/${view.instanceId}`:`/instances/${view.instanceId}/${view.mode}`}
      onClose={handleClose}
      label={label}
    />
  );
});

const InstanceTabs = observer(({ pathname }) => {

  const classes = useStyles();

  const { authStore, viewStore } = useStores();

  return (
    <div className={classes.container} >
      {authStore.isAuthenticated && authStore.isUserAuthorized && Array.from(viewStore.views.values()).map(view => (
        <InstanceTab key={view.instanceId} view={view} pathname={pathname} />
      ))}
    </div>
  );
});

export default InstanceTabs;