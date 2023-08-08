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

import {faRedoAlt} from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';

import ErrorPanel from '../Components/ErrorPanel';
import SpinnerPanel from '../Components/SpinnerPanel';
import useGetSettingsQuery from '../Hooks/useGetSettingsQuery';
import useStores from '../Hooks/useStores';
import KeycloakAuthAdapter from '../Services/KeycloakAuthAdapter';
import Matomo from '../Services/Matomo';
import Sentry from '../Services/Sentry';
import type AuthAdapter from '../Services/AuthAdapter';
import type { JSX } from 'react';

interface SettingsProps {
  authAdapter?: AuthAdapter;
  children?: string|JSX.Element|(null|undefined|string|JSX.Element)[];
}

const Settings = observer(({ authAdapter, children }: SettingsProps) => {

  const {
    data: settings,
    error,
    isUninitialized,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useGetSettingsQuery();

  const { appStore } = useStores();

  useEffect(() => {
    if (settings) {
      Sentry.initialize(settings?.sentry);
      Matomo.initialize(settings?.matomo);
      appStore.setCommit(settings?.commit);
      if (authAdapter instanceof KeycloakAuthAdapter && settings.keycloak) {
        authAdapter.setConfig(settings.keycloak);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);


  if (isError) {
    return (
      <ErrorPanel>
        The service is temporary unavailable. Please retry in a moment. ({error}).<br /><br />
        <Button variant={'primary'} onClick={refetch}>
          <FontAwesomeIcon icon={faRedoAlt} /> &nbsp; Retry
        </Button>
      </ErrorPanel>
    );
  }

  if(isUninitialized || isFetching) {
    return (
      <SpinnerPanel text="Retrieving settings..." />
    );
  }

  if (isSuccess) {

    if (authAdapter instanceof KeycloakAuthAdapter && !settings?.keycloak) {
      return (
        <ErrorPanel>
          <p>Failed to initialize authentication!</p>
          <p>Please contact our team by email at : <a href={'mailto:kg@ebrains.eu'}>kg@ebrains.eu</a></p>
        </ErrorPanel>
      );
    }

    return (
      <>
        {children}
      </>
    );
  }

  return null;
});
Settings.displayName = 'Settings';

export default Settings;