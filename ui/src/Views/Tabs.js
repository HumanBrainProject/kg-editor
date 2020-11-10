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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { matchPath } from "react-router-dom";
import { createUseStyles } from "react-jss";

import { useStores } from "../Hooks/UseStores";

import InstanceTabs from "./InstanceTabs";
import UserProfileTab from "./UserProfileTab";
import WorkspaceSelector from "../Components/WorkspaceSelector";
import Tab from "../Components/Tab";

const useStyles = createUseStyles({
  container: {
    background: "var(--bg-color-ui-contrast1)",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto"
  },
  fixedTabsLeft: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)"
  },
  fixedTabsRight: {
    display: "grid",
    gridTemplateColumns: "repeat(6, auto)"
  },
  logo: {
    padding: "10px",
    cursor: "pointer",
    "& span": {
      color: "var(--ft-color-loud)",
      display: "inline-block",
      paddingLeft: "10px",
      fontSize: "0.9em",
      borderLeft: "1px solid var(--border-color-ui-contrast5)",
      marginLeft: "10px"
    },
    "&:hover span": {
      color: "var(--ft-color-louder)"
    }
  },
  userProfileTab: {
    width: "50px",
    height: "50px",
    lineHeight: "50px",
    color: "var(--ft-color-normal)",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderLeft: "none"
  }
});


const Tabs = observer(() => {

  const classes = useStyles();

  const { appStore, history, authStore } = useStores();

  const [currentLocationPathname, setCurrentLocationPathname] = useState(history.location.pathname);

  useEffect(() => {
    const unlisten = history.listen(location => {
      setCurrentLocationPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const handleGoToDashboard = () => appStore.goToDashboard();

  const handleCreateInstance = () => appStore.createInstance();

  return (
    <div className={classes.container}>
      <div className={`${classes.logo} layout-logo`} onClick={handleGoToDashboard}>
        <img src={`${window.rootPath}/assets/ebrains.svg`} alt="" width="30" height="30" />
        <span>Knowledge Graph Editor</span>
      </div>
      {!appStore.globalError &&
        <React.Fragment>
          <div className={classes.fixedTabsLeft}>
            {authStore.isAuthenticated && authStore.isUserAuthorized && authStore.hasWorkspaces && appStore.currentWorkspace?
              <React.Fragment>
                <WorkspaceSelector />
                <Tab icon={"home"} current={matchPath(currentLocationPathname, { path: "/", exact: "true" })} path={"/"} label={"Home"} hideLabel />
                <Tab icon={"search"} current={matchPath(currentLocationPathname, { path: "/browse", exact: "true" })} path={"/browse"} hideLabel label={"Browse"} />
                {appStore.currentWorkspacePermissions.canCreate && (
                  <Tab icon={"file"} onClick={handleCreateInstance} hideLabel label={"New instance"} />
                )}
              </React.Fragment>
              : null
            }
          </div>
          <InstanceTabs pathname={currentLocationPathname} />
          <div className={classes.fixedTabsRight}>
            {authStore.isAuthenticated && authStore.isUserAuthorized && (
              <React.Fragment>
                <Tab icon={"question-circle"} current={matchPath(currentLocationPathname, { path: "/help", exact: "true" })} path={"/help"} hideLabel label={"Help"} />
                <UserProfileTab className={classes.userProfileTab} size={32} />
              </React.Fragment>
            )}
          </div>
        </React.Fragment>
      }
    </div>
  );
});

export default Tabs;

