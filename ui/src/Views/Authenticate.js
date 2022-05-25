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
import {useLocation, useNavigate, matchPath} from "react-router-dom";
import { observer } from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactPiwik from "react-piwik";

import { useStores } from "../Hooks/UseStores";

import SpinnerPanel from "../Components/SpinnerPanel";
import ErrorPanel from "../Components/ErrorPanel";
import Panel from "../Components/Panel";
import UserProfile from "./UserProfile";

const Authenticate = observer(() => {
  const { authStore } = useStores();
  const location = useLocation();
  const navigate = useNavigate();
  const isLogout = !!matchPath({path:"/logout"}, location.pathname);
  useEffect(() => {
    if (!isLogout) {
      authStore.authenticate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogout]);

  const handleRetryToAuthenticate = () => authStore.authenticate();
  
  const handleLogin = () =>  {
    ReactPiwik.push(["trackEvent", "User", "Login"]);
    authStore.login();
  };

  const handleReLogin = () =>  {
    ReactPiwik.push(["trackEvent", "User", "Login"]);
    navigate("/");
  };

  if (authStore.isTokenExpired && !authStore.isLogout) {
    return (
      <ErrorPanel>
        <h3>Your session has expired</h3>
        <p>
            Your session token has expired or has become invalid.<br/>
            Click on the following button to ask a new one and continue with your session.
        </p>
        <Button variant={"primary"} onClick={handleLogin}>Re-Login</Button>
      </ErrorPanel>
    );
  }

  if (!authStore.isAuthenticated) {

    if (authStore.authError) {
      return (
        <ErrorPanel>
          There was a problem authenticating ({authStore.authError}).
            If the problem persists, please contact the support.<br /><br />
          <Button variant={"primary"} onClick={handleRetryToAuthenticate}>
            <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
          </Button>
        </ErrorPanel>
      );
    }

    if (isLogout) {
      return (
        <Panel>
          <h3>You are logged out of the application</h3>
          <p></p>
          <Button variant={"primary"} onClick={handleReLogin}>Login</Button>
        </Panel>
      );
    }
  
    return (
      <SpinnerPanel text="User authenticating..." />
    );
  }

  return (
    <UserProfile />
  );
});
Authenticate.displayName = "Authenticate";

export default Authenticate;