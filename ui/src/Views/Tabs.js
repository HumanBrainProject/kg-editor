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

import React from "react";
import { observer } from "mobx-react-lite";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { createUseStyles } from "react-jss";

import { useStores } from "../Hooks/UseStores";

import InstanceTabs from "./InstanceTabs";
import UserProfileTab from "./UserProfileTab";
import SpaceSelector from "../Components/SpaceSelector/SpaceSelector";
import Tab from "../Components/Tab";
import NewInstanceTab from "./NewInstanceTab";

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
    lineHeight: "41px",
    color: "var(--ft-color-normal)",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderLeft: "none"
  }
});


const Tabs = observer(() => {
  const classes = useStyles();

  const { appStore, authStore } = useStores();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoToDashboard = () => navigate("/")

  const logo = appStore.currentTheme.name === "default"?`${window.rootPath}/assets/ebrains.svg`:`${window.rootPath}/assets/ebrains_dark.svg`;

  return (
      <div className={classes.container}>
        <div className={`${classes.logo} layout-logo`} onClick={handleGoToDashboard}>
          <img src={logo} alt="" height="30" />
          <span>Knowledge Graph Editor</span>
        </div>
        {!appStore.globalError &&
          <>
            <div className={classes.fixedTabsLeft}>
              {authStore.isAuthenticated && authStore.isUserAuthorized && authStore.hasSpaces && appStore.currentSpace?
                <>
                  <SpaceSelector />
                  <Tab icon={"home"} current={matchPath({ path: "/" }, location.pathname)} path={"/"} label={"Home"} hideLabel />
                  <Tab icon={"search"} current={matchPath({ path: "/browse" }, location.pathname)} path={"/browse"} hideLabel label={"Browse"} />
                  <NewInstanceTab />
                </>
                : null
              }
            </div>
            <InstanceTabs pathname={location.pathname} />
            <div className={classes.fixedTabsRight}>
              {authStore.isAuthenticated && authStore.isUserAuthorized && (
                <>
                  <Tab icon={"question-circle"} current={matchPath({ path: "/help" }, location.pathname)} path={"/help"} hideLabel label={"Help"} />
                  <UserProfileTab className={classes.userProfileTab} size={32} />
                </>
              )}
            </div>
          </>
        }
      </div>
  );
});
Tabs.displayName = "Tabs";

export default Tabs;

