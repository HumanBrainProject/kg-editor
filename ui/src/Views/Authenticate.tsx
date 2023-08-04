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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';

import ErrorPanel from '../Components/ErrorPanel';
import SpinnerPanel from '../Components/SpinnerPanel';
import useAuth from '../Hooks/useAuth';
import Matomo from '../Services/Matomo';
import type { JSX } from 'react';

interface AuthenticateProps {
  children?: string|JSX.Element|(null|undefined|string|JSX.Element)[];
}

const Authenticate = observer(({children}: AuthenticateProps) => {

  const initializedRef = useRef(false);

  const {
    isTokenExpired,
    error,
    isError,
    isUninitialized,
    isInitializing,
    isAuthenticated,
    isAuthenticating,
    authenticate,
    login
  } = useAuth();

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      authenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () =>  {
    Matomo.trackEvent('User', 'Login');
    login();
  };

  if(isUninitialized || isInitializing || isAuthenticating) {
    return (
      <SpinnerPanel text="User authenticating..." />
    );
  }

  if (isTokenExpired) {
    return (
      <ErrorPanel>
        <h3>Your session has expired</h3>
        <p>
            Your session token has expired or has become invalid.<br/>
            Click on the following button to ask a new one and continue with your session.
        </p>
        <Button variant={'primary'} onClick={handleLogin}>Re-Login</Button>
      </ErrorPanel>
    );
  }

  if (isError) {
    return (
      <ErrorPanel>
      There was a problem authenticating ({error}).
        If the problem persists, please contact the support.<br /><br />
        <Button variant={'primary'} onClick={authenticate}>
          <FontAwesomeIcon icon={'redo-alt'} /> &nbsp; Retry
        </Button>
      </ErrorPanel>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        {children}
      </>
    );
  }
  return null;
});
Authenticate.displayName = 'Authenticate';

export default Authenticate;