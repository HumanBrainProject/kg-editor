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
import axios, { InternalAxiosRequestConfig } from "axios";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
//import reportWebVitals from './reportWebVitals';

import "./index.scss";

import APIBackendAdapter from "./services/APIBackendAdapter";
import KeycloakAuthAdapter from "./services/KeycloakAuthAdapter";
import App from "./components/App";

const authAdapter = new KeycloakAuthAdapter({
  onLoad: "login-required",
  flow: "standard",
  pkceMethod: "S256",
  checkLoginIframe: false,
  enableLogging: true
});

const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (authAdapter.tokenProvider?.token && config.headers) {
    config.headers.Authorization = `Bearer ${authAdapter.tokenProvider.token}`;
  }
  return Promise.resolve(config);
});

const api = new APIBackendAdapter(axiosInstance);

const container = document.getElementById('root');
if (!container) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={"/community"} >
      <App api={api} authAdapter={authAdapter} />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
