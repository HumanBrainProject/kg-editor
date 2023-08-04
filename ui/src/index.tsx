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
import axios from 'axios';
import React from 'react';
import { createRoot } from 'react-dom/client';
// import { configure } from "mobx"; //NOSONAR

import App from './App';
import APIBackendAdapter from './Services/APIBackendAdapter';
import KeycloakAuthAdapter from './Services/KeycloakAuthAdapter';
import RootStore from './Stores/RootStore';
import type { InternalAxiosRequestConfig } from 'axios';

/* //NOSONAR React debug flags
configure({
  enforceActions: "always",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: false,
  disableErrorBoundaries: false // help to debug only
});
*/

const rootPath = window.rootPath || '';

const authAdapter = new KeycloakAuthAdapter({
  onLoad: 'login-required',
  flow: 'standard',
  pkceMethod: 'S256',
  checkLoginIframe: false,
  enableLogging: true
}, `${window.location.protocol}//${window.location.host}${rootPath}/logout`);

//reportWebVitals(); //NOSONAR
const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (authAdapter.tokenProvider?.token && config.headers) {
    config.headers.Authorization = `Bearer ${authAdapter.tokenProvider.token}`;
  }
  return Promise.resolve(config);
});
axiosInstance.interceptors.response.use(undefined, (error) => {
  if (error.response && error.response.status === 401 && !error.config._isRetry) {
    authAdapter.unauthorizedRequestResponseHandlerProvider.unauthorizedRequestResponseHandler && authAdapter.unauthorizedRequestResponseHandlerProvider.unauthorizedRequestResponseHandler();
    return axios.request(error.config);
  } else {
    return Promise.reject(error);
  }
});

const api = new APIBackendAdapter(axiosInstance);

const stores = new RootStore(api);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App stores={stores} api={api} authAdapter={authAdapter} />
  </React.StrictMode>
);