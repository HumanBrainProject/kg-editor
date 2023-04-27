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

import React, { Suspense } from "react";
import { observer } from "mobx-react-lite";
import { Navigate, useNavigate, useLocation, useSearchParams, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "react-jss";

import API from "../Services/API";
import RootStore from "../Stores/RootStore";
import StoresProvider from "./StoresProvider";
import AuthAdapter from "../Services/AuthAdapter";
import APIProvider from "./APIProvider";
import { Space as SpaceType } from "../types";

import BrowserEventHandler from "./BrowserEventHandler";
import Shortcuts from "./Shortcuts";
import Styles from "./Styles";
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

interface AppProps {
  stores: RootStore;
  api: API;
  authAdapter?: AuthAdapter;
}

const App = observer(({ stores, api, authAdapter } : AppProps) => {

  const { appStore, typeStore } = stores;

  //const location = useLocation();
  //const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const theme = appStore.currentTheme;

  const currentSpace = appStore.currentSpace as SpaceType|null;
  const isTypeFetched = currentSpace && typeStore.space === currentSpace.id && typeStore.isFetched;
  const spaceParam = searchParams.get("space");
  const skipHistory = searchParams.get("skipHistory") === "true";


  // const matchInstance = (pathname: string) => matchPath({path:"/instances/:instanceId/:mode"}, pathname) || matchPath({path:"/instances/:instanceId"}, pathname);
  // const matchBrowse = (pathname: string) => matchPath({path:"/browse"}, pathname);

  //const InstanceComponent = isTypeFetched?:

  return (
    <ThemeProvider theme={theme}>
        <Styles />
        <Shortcuts appStore={stores.appStore} />
        <BrowserEventHandler stores={stores} />
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
  );
});
App.displayName = "App";

export default App;
