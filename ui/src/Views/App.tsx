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
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "react-jss";
import { v4 as uuidv4 } from "uuid";

import API from "../Services/API";
import RootStore from "../Stores/RootStore";
import StoresProvider from "./StoresProvider";
import Matomo from "../Services/Matomo";
import Sentry from "../Services/Sentry";
import AuthAdapter from "../Services/AuthAdapter";
import APIProvider from "./APIProvider";
import { useStores } from "../Hooks/useStores";

import Layout from "./Layout";
import GlobalError from "./GlobalError";
import Settings from "./Settings";
import KeycloakAuthAdapter from "../services/KeycloakAuthAdapter";
import AuthProvider from "./AuthProvider";
import Authenticate from "./Authenticate";
import ErrorPanel from "../Components/ErrorPanel";
import UserProfile from "./UserProfile";

const kCode = { step: 0, ref: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] };


const BrowserEventHandler = observer(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const { appStore, instanceStore } = useStores();

  useEffect(() => {
    window.onpopstate = () => {
      const path = location.pathname;
      if(path.startsWith("/instance")) {
        const id = path.split("/")[2];
        const instance = instanceStore.instances.get(id);
        if (!instance || instance.space !== appStore.currentSpace.id) {
          appStore.closeInstance(location, navigate, id);
          window.location.replace(location.pathname);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
});
BrowserEventHandler.displayName = "BrowserEventHandler";


const App = observer(({ stores, api, authAdapter } : { stores: RootStore, api: API, authAdapter?: AuthAdapter}) => {

  const { appStore } = useStores();

  const location = useLocation();
  const navigate = useNavigate();

  const theme = appStore.currentTheme;

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = e => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.keyCode === 84) {
      Matomo.trackEvent("Shortcut", "ToggleTheme");
      appStore.toggleTheme();
    } else if (e.altKey && e.shiftKey && e.keyCode === 70) { // alt+shift+f, browse
      Matomo.trackEvent("Shortcut", "Browse");
      navigate("/browse");
    } else if (e.altKey && e.keyCode === 78) { // alt+n, new
      Matomo.trackEvent("Shortcut", "Create");
      const uuid = uuidv4();
      navigate(`/instances/${uuid}/create`);
    } else if (e.altKey && e.keyCode === 68) { // alt+d, dashboard
      Matomo.trackEvent("Shortcut", "Home");
      navigate("/");
    } else if (e.keyCode === 112) { // F1, help
      Matomo.trackEvent("Shortcut", "Help");
      navigate("/help");
    } else if (e.altKey && e.keyCode === 87) { // alt+w, close
      if (e.shiftKey) { // alt+shift+w, close all
        Matomo.trackEvent("Shortcut", "CloseAllInstances");
        appStore.closeAllInstances(location, navigate);
      } else {
        const matchInstanceTab = appStore.matchInstancePath(location.pathname);
        if (matchInstanceTab) {
          Matomo.trackEvent("Shortcut", "InstanceClose", matchInstanceTab.params.id);
          appStore.closeInstance(location, navigate, matchInstanceTab.params.id);
        }
      }
    } else if (e.altKey && e.keyCode === 37) { // left arrow, previous
      const matchInstanceTab = appStore.matchInstancePath(location.pathname);
      appStore.focusPreviousInstance(matchInstanceTab && matchInstanceTab.params.id, location, navigate);
    } else if (e.altKey && e.keyCode === 39) { // right arrow, next
      const matchInstanceTab = appStore.matchInstancePath(location.pathname);
      appStore.focusNextInstance(matchInstanceTab && matchInstanceTab.params.id, location, navigate);
    } else {
      kCode.step = kCode.ref[kCode.step] === e.keyCode ? kCode.step + 1 : 0;
      if (kCode.step === kCode.ref.length) {
        kCode.step = 0;
        Matomo.trackEvent("Shortcut", "KonamiCode", ":-D");
        appStore.setTheme("cupcake");
      }
    }
  };

  return (
    <>
      <BrowserEventHandler />
      <ThemeProvider theme={theme}>
        <Layout>
          {appStore.globalError?
            <GlobalError />
            :
            <StoresProvider value={stores}>
              <APIProvider api={api}>
                <Settings>
                  {settings => {
                      Matomo.initialize(settings?.matomo);
                      Sentry.initialize(settings?.sentry);
                      if (authAdapter instanceof KeycloakAuthAdapter) {
                        if (settings?.keycloak) {
                          authAdapter.setConfig(settings?.keycloak);
                        } else {
                          return (
                            <ErrorPanel>
                              <p>Failed to initialize authentication!</p>
                              <p>Please contact our team by email at : <a href={"mailto:kg@ebrains.eu"}>kg@ebrains.eu</a></p>
                            </ErrorPanel>
                          );
                        }
                      }
                      return (
                        <AuthProvider adapter={authAdapter} >
                          <Authenticate >
                            <UserProfile />
                          </Authenticate>
                        </AuthProvider>
                      );
                  }}
                </Settings>
              </APIProvider>
            </StoresProvider>
          }
        </Layout>
      </ThemeProvider>
    </>
  );
});
App.displayName = "App";

export default App;
