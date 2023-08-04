/* eslint-disable @typescript-eslint/ban-ts-comment */
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

import { observer } from 'mobx-react-lite';
import React, { Suspense } from 'react';
import { JssProvider, ThemeProvider, createGenerateId } from 'react-jss';
import { BrowserRouter, Navigate, useSearchParams, Route, Routes } from 'react-router-dom';

import 'react-virtualized/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import './Services/IconsImport';

import SpinnerPanel from './Components/SpinnerPanel';
import APIProvider from './Views/APIProvider';

import BrowserEventHandler from './Views/BrowserEventHandler';
import ErrorBoundary from './Views/ErrorBoundary';
import GlobalError from './Views/GlobalError';
import Layout from './Views/Layout';
import Settings from './Views/Settings';
import Shortcuts from './Views/Shortcuts';
import StoresProvider from './Views/StoresProvider';
import Styles from './Views/Styles';
import { ViewMode, type Space as SpaceType } from './types';
import type API from './Services/API';
import type AuthAdapter from './Services/AuthAdapter';
import type RootStore from './Stores/RootStore';

const AuthProvider = React.lazy(() => import('./Views/AuthProvider'));
const UserProfile = React.lazy(() => import('./Views/UserProfile'));
const Authenticate = React.lazy(() => import('./Views/Authenticate'));
const Space = React.lazy(() => import('./Views/Space'));
const Types = React.lazy(() => import('./Views/Types'));
const NotFound = React.lazy(() => import('./Views/NotFound'));
const Home = React.lazy(() => import('./Views/Home'));
const Help = React.lazy(() => import('./Views/Help'));
const Browse = React.lazy(() => import('./Views/Browse'));

const Instance = React.lazy(() => import('./Views/Instance'));
const RawInstance = React.lazy(() => import('./Views/RawInstance'));
const InstanceCreation = React.lazy(() => import('./Views/InstanceCreation'));
const InstanceView = React.lazy(() => import('./Views/InstanceView'));
const Logout = React.lazy(() => import('./Views/Logout'));

interface AppProps {
  stores: RootStore;
  api: API;
  authAdapter?: AuthAdapter;
}

const App = observer(({ stores, api, authAdapter } : AppProps) => {

  const { appStore, typeStore } = stores;

  const [searchParams] = useSearchParams();

  const theme = appStore.currentTheme;

  const currentSpace = appStore.currentSpace as SpaceType|null;
  const spaceParam = searchParams.get('space');
  const skipHistory = searchParams.get('skipHistory') === 'true';

  const isTypeFetched = currentSpace && typeStore.space === currentSpace.id;
  const InstanceComponent = isTypeFetched?Instance:RawInstance;

  return (
    <ThemeProvider theme={theme}>
      <Styles />
      <APIProvider api={api}>
        <AuthProvider adapter={authAdapter} >
          <StoresProvider stores={stores}>
            <Layout>
              {appStore.globalError?
                <GlobalError />
                :
                <Settings authAdapter={authAdapter}>
                  <Suspense fallback={<SpinnerPanel text="Loading resource..." />} >
                    <Routes>
                      <Route path={'/logout'} element={<Logout />}/>
                      <Route path={'*'} element={
                        <Authenticate >
                          <UserProfile>
                            <Shortcuts />
                            <BrowserEventHandler />
                            <Suspense fallback={<SpinnerPanel text="Loading resource..." />} >
                              <Routes>
                                <Route
                                  path="/instances/:id/create"
                                  element={
                                    <>
                                      {spaceParam?
                                        <Space space={spaceParam} skipHistory={skipHistory} >
                                          <Types>
                                            <InstanceCreation>
                                              <InstanceView mode={ViewMode.CREATE} />
                                            </InstanceCreation>
                                          </Types>
                                        </Space>
                                        :
                                        <Navigate to="/browse" />
                                      }
                                    </>
                                  }
                                />
                                <Route
                                  path="/instances/:id/raw"
                                  element={
                                    <RawInstance>
                                      {(_, space) => (
                                        <Space space={space} skipHistory={skipHistory} >
                                          <Types>
                                            <InstanceView mode={ViewMode.RAW} />
                                          </Types>
                                        </Space>
                                      )}
                                    </RawInstance>
                                  }
                                />
                                <Route
                                  path="/instances/:id/*"
                                  element={
                                    <InstanceComponent>
                                      {(instanceId, space) => (
                                        <Space space={space} skipHistory={skipHistory} >
                                          <Types>
                                            <Routes>
                                              <Route path="" element={<InstanceView mode={ViewMode.VIEW} />} />
                                              <Route path="edit" element={<InstanceView mode={ViewMode.EDIT} />} />
                                              <Route path="graph" element={<InstanceView mode={ViewMode.GRAPH} />} />
                                              <Route path="release" element={<InstanceView mode={ViewMode.RELEASE} />} />
                                              <Route path="manage"  element={<InstanceView mode={ViewMode.MANAGE} />} />
                                              <Route path="*" element={<Navigate to={`/instances/${instanceId}`} />} />
                                            </Routes>
                                          </Types>
                                        </Space>
                                      )}
                                    </InstanceComponent>
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
                      }/>
                    </Routes>
                  </Suspense>
                </Settings>
              }
            </Layout>
          </StoresProvider>
        </AuthProvider>
      </APIProvider>
    </ThemeProvider>
  );
});
App.displayName = 'App';

const jssId = {
  minify: process.env.NODE_ENV === 'production'
};
const jssGenerateId = createGenerateId(jssId);

const Component = ({ stores, api, authAdapter }: AppProps) => (
  <JssProvider  id={jssId} generateId={jssGenerateId} >
    <ErrorBoundary stores={stores} >
      <BrowserRouter>
        <App stores={stores} api={api} authAdapter={authAdapter}/>
      </BrowserRouter>
    </ErrorBoundary>
  </JssProvider>
);

export default Component;