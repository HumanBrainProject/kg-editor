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

import React, { useEffect, Suspense } from "react";
import { observer } from "mobx-react-lite";
import { Navigate, useNavigate, useLocation, useSearchParams, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "react-jss";
import { v4 as uuidv4 } from "uuid";

import API from "../Services/API";
import RootStore from "../Stores/RootStore";
import StoresProvider from "./StoresProvider";
import Matomo from "../Services/Matomo";
import AuthAdapter from "../Services/AuthAdapter";
import APIProvider from "./APIProvider";
import { Space as SpaceType } from "../types";

import Layout from "./Layout";
import GlobalError from "./GlobalError";
import SpinnerPanel from "../Components/SpinnerPanel";
import Settings from "./Settings";

const AuthProvider = React.lazy(() => import("./AuthProvider"));
const UserProfile = React.lazy(() => import("./UserProfile"));
const Authenticate = React.lazy(() => import("./Authenticate"));
const Space = React.lazy(() => import("./Space"));
const Types = React.lazy(() => import("./Types"));
const NotFound = React.lazy(() => import("./NotFound"));
const Home = React.lazy(() => import("./Home"));
const Help = React.lazy(() => import("./Help"));
const Browse = React.lazy(() => import("./Browse"));

const Instance = React.lazy(() => import("./Instance"));
const RawInstance = React.lazy(() => import("./RawInstance"));
const InstanceCreation = React.lazy(() => import("./InstanceCreation"));
const InstanceView = React.lazy(() => import("./InstanceView"));
const Logout = React.lazy(() => import("./Logout"));

const kCode = { step: 0, ref: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] };


const BrowserEventHandler = observer(({ stores }: { stores: RootStore }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { appStore, instanceStore } = stores;

  useEffect(() => {
    window.onpopstate = () => {
      const path = location.pathname;
      if(path.startsWith("/instance")) {
        const id = path.split("/")[2];
        const instance = instanceStore?.instances.get(id);
        const currentSpace = appStore.currentSpace as { id: string}|null;
        if (!instance || instance.space !== currentSpace?.id) {
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

  const { appStore, typeStore } = stores;

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
        const matchInstanceTab = appStore.matchInstancePath(location.pathname) as { params: { id: string }};
        if (matchInstanceTab) {
          Matomo.trackEvent("Shortcut", "InstanceClose", matchInstanceTab.params.id);
          appStore.closeInstance(location, navigate, matchInstanceTab.params.id);
        }
      }
    } else if (e.altKey && e.keyCode === 37) { // left arrow, previous
      const matchInstanceTab = appStore.matchInstancePath(location.pathname) as { params: { id: string }};
      appStore.focusPreviousInstance(matchInstanceTab && matchInstanceTab.params.id, location, navigate);
    } else if (e.altKey && e.keyCode === 39) { // right arrow, next
      const matchInstanceTab = appStore.matchInstancePath(location.pathname) as { params: { id: string }};
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

  const currentSpace = appStore.currentSpace as SpaceType|null;
  const isTypeFetched = currentSpace && typeStore.space === currentSpace.id && typeStore.isFetched;
  const spaceParam = searchParams.get("space");
  const skipHistory = searchParams.get("skipHistory") === "true";


  // const matchInstance = (pathname: string) => matchPath({path:"/instances/:instanceId/:mode"}, pathname) || matchPath({path:"/instances/:instanceId"}, pathname);
  // const matchBrowse = (pathname: string) => matchPath({path:"/browse"}, pathname);

  //const InstanceComponent = isTypeFetched?:

  return (
    <>
      <BrowserEventHandler stores={stores} />
      <ThemeProvider theme={theme}>
          <StoresProvider stores={stores}>
            <Layout>
              {appStore.globalError?
                <GlobalError />
                :
                <APIProvider api={api}>
                  <Settings authAdapter={authAdapter}>
                    <Suspense fallback={<SpinnerPanel text="Loading resource..." />} >
                      <Routes>
                        <Route path={"/logout"} element={<Logout />}/>
                        <Route path={"*"} element={
                          <AuthProvider adapter={authAdapter} >
                            <Authenticate >
                              <UserProfile>
                                <Suspense fallback={<SpinnerPanel text="Loading resource..." />} >
                                  <Routes>
                                    {!isTypeFetched && (
                                      <Route path=":id/create" element={<Navigate to="/browse" />} />

                                    )}
                                    {

                                      // const instanceMatch = matchInstance(location.pathname);
                                      // if (instanceMatch) {
                                      //   const { params: { instanceId, mode }} = instanceMatch;
                                      //   switch (mode) {
                                      //     case "create": {
                                      //       if (isTypeFetched) {
                                      //         return <InstanceCreation instanceId={instanceId} />;
                                      //       }
                                      //       return <Navigate to="/browse" />; // App still loading, instance creation is disabled
                                      //     }
                                      //     case "raw": {
                                      //       return <RawInstance instanceId={instanceId} />;
                                      //     }
                                      //     default: {
                                      //       if (isTypeFetched) {
                                      //         return <Instance instanceId={instanceId} />;
                                      //       }
                                      //       return <RawInstance instanceId={instanceId} />; // App still loading, non raw instance creation is disabled
                                      //     }
                                      //   }
                                      // }


                                    }
                                    <Route 
                                      path="/instances/" 
                                      element={
                                        <Instance>
                                          {{space, instanceId} => (
                                            <Space space={space} skipHistory={skipHistory} >
                                              <Types>
                                                <Routes>
                                                  <Route path=":id" element={<InstanceView mode="view" />} />
                                                  <Route path=":id/create" element={<InstanceView mode="create" />} />
                                                  <Route path=":id/edit" element={<InstanceView mode="edit" />} />
                                                  <Route path=":id/graph" element={<InstanceView mode="graph" />} />
                                                  <Route path=":id/release" element={<InstanceView mode="release" />} />
                                                  <Route path=":id/manage"  element={<InstanceView mode="manage" />} />
                                                  <Route path=":id/raw"  element={<InstanceView mode="raw" />} />
                                                  <Route path="*" element={<NotFound/>} />
                                                </Routes>
                                              </Types>
                                            </Space>
                                          )}  
                                        </Instance>
                                      } 
                                    />
                                    <Route
                                      path="/browse"
                                      element={
                                        <Space space={spaceParam} skipHistory={skipHistory} >
                                          <Types>
                                            <Browse />
                                          </Types>
                                        </Space>
                                      } 
                                    />
                                    <Route path="/help/*" element={<Help/>} />
                                    <Route
                                      path="/"
                                      element={
                                        <Space space={spaceParam} skipHistory={skipHistory} >
                                          <Types>
                                            <Home />
                                          </Types>
                                        </Space>
                                      } 
                                    />
                                    <Route path="*" element={<NotFound/>} />
                                  </Routes>
                                </Suspense>
                              </UserProfile>
                            </Authenticate>
                          </AuthProvider>
                        }/>
                      </Routes>
                    </Suspense>
                  </Settings>
                </APIProvider>
              }
            </Layout>
          </StoresProvider>
      </ThemeProvider>
    </>
  );
});
App.displayName = "App";

export default App;
