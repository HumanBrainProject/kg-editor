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
import { Navigate, matchPath, useLocation, useSearchParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../Hooks/useStores";
import SpinnerPanel from "../Components/SpinnerPanel";
import ErrorPanel from "../Components/ErrorPanel";

import Instance from "./Instance";
import RawInstance from "./RawInstance";
import InstanceCreation from "./InstanceCreation";
import Space from "./Space";

const matchInstance = pathname => matchPath({path:"/instances/:instanceId/:mode"}, pathname) || matchPath({path:"/instances/:instanceId"}, pathname);
const matchBrowse = pathname => matchPath({path:"/browse"}, pathname);

const UserProfile = observer(() => {

  const { authStore, appStore, typeStore } = useStores();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    authStore.retrieveUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => authStore.logout();

  const handleRetryToRetrieveUserProfile = () => authStore.retrieveUserProfile();

  if (!authStore.hasUserProfile) {

    if (authStore.userProfileError) {
      return (
        <ErrorPanel>
          There was a problem retrieving the user profile ({authStore.userProfileError}).
            If the problem persists, please contact the support.<br /><br />
          <Button variant={"primary"} onClick={handleRetryToRetrieveUserProfile}>
            <FontAwesomeIcon icon={"redo-alt"} /> &nbsp; Retry
          </Button>
        </ErrorPanel>
      );
    }

    if (!authStore.isUserAuthorizationInitialized || authStore.isRetrievingUserProfile) {
      return (
        <SpinnerPanel text="Retrieving user profile..." />
      );
    }

    if (!authStore.isUserAuthorized) {
      return (
        <ErrorPanel>
          <h1>Welcome</h1>
          <p>You are currently not granted permission to acccess the application.</p>
          <p>Please contact our team by email at : <a href={"mailto:kg@ebrains.eu"}>kg@ebrains.eu</a></p>
          <Button onClick={handleLogout}>Logout</Button>
        </ErrorPanel>
      );
    }
  }

  if (!authStore.hasSpaces) {
    return (
      <ErrorPanel>
        <h1>Welcome <span title={authStore.firstName}>{authStore.firstName}</span></h1>
        <p>You are currently not granted permission to acccess any spaces.</p>
        <p>Please contact our team by email at : <a href={"mailto:kg@ebrains.eu"}>kg@ebrains.eu</a></p>
        <Button onClick={handleLogout}>Logout</Button>
      </ErrorPanel>
    );
  }

  const isTypeFetched = appStore.currentSpace && typeStore.space === appStore.currentSpace.id && typeStore.isFetched;

  const instanceMatch = matchInstance(location.pathname);
  if (instanceMatch) {
    const { params: { instanceId, mode }} = instanceMatch;
    switch (mode) {
      case "create": {
        if (isTypeFetched) {
          return <InstanceCreation instanceId={instanceId} />;
        }
        return <Navigate to="/browse" />; // App still loading, instance creation is disabled
      }
      case "raw": {
        return <RawInstance instanceId={instanceId} />;
      }
      default: {
        if (isTypeFetched) {
          return <Instance instanceId={instanceId} />;
        }
        return <RawInstance instanceId={instanceId} />; // App still loading, non raw instance creation is disabled
      }
    }
  }

  const browseMatch = matchBrowse(location.pathname);
  if (browseMatch) {    
    const space = searchParams.get("space");
    return (
      <Space space={space} />
    );
  }

  return (
    <Space/>
  )

});
UserProfile.displayName = "UserProfile";

export default UserProfile;