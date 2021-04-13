/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Router, useHistory } from "react-router-dom";
import { ThemeProvider } from "react-jss";
import _  from "lodash-uuid";

import { useStores } from "../Hooks/UseStores";

import ErrorBoundary from "./ErrorBoundary";
import Layout from "./Layout";

const kCode = { step: 0, ref: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] };


const BrowserEventHandler = observer(() => {
  const routerHistory = useHistory();

  const { appStore, instanceStore } = useStores();

  useEffect(() => {
    return routerHistory.listen(location => {
      if (routerHistory.action === "POP") {
        const path = location.pathname;
        if(path.startsWith("/instance")) {
          const id = path.split("/")[2];
          const instance = instanceStore.instances.get(id);
          if (!instance || instance.space !== appStore.currentSpace.id) {
            appStore.closeInstance(id);
            window.location.replace(location.pathname);
          }
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
});

const App = observer(() => {

  const { appStore, history } = useStores();

  const theme = appStore.currentTheme;

  useEffect(() => {
    appStore.initialize();
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = e => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.keyCode === 84) {
      appStore.toggleTheme();
    } else if (e.altKey && e.shiftKey && e.keyCode === 70) { // alt+shift+f, browse
      history.push("/browse");
    } else if (e.altKey && e.keyCode === 78) { // alt+n, new
      const uuid = _.uuid();
      history.push(`/instances/${uuid}/create`);
    } else if (e.altKey && e.keyCode === 68) { // alt+d, dashboard
      history.push("/");
    } else if (e.keyCode === 112) { // F1, help
      history.push("/help");
    } else if (e.altKey && e.keyCode === 87) { // alt+w, close
      if (e.shiftKey) { // alt+shift+w, close all
        appStore.closeAllInstances();
      } else {
        const matchInstanceTab = appStore.matchInstancePath();
        if (matchInstanceTab) {
          appStore.closeInstance(matchInstanceTab.params.id);
        }
      }
    } else if (e.altKey && e.keyCode === 37) { // left arrow, previous
      const matchInstanceTab = appStore.matchInstancePath();
      appStore.focusPreviousInstance(matchInstanceTab && matchInstanceTab.params.id);
    } else if (e.altKey && e.keyCode === 39) { // right arrow, next
      const matchInstanceTab = appStore.matchInstancePath();
      appStore.focusNextInstance(matchInstanceTab && matchInstanceTab.params.id);
    } else {
      kCode.step = kCode.ref[kCode.step] === e.keyCode ? kCode.step + 1 : 0;
      if (kCode.step === kCode.ref.length) {
        kCode.step = 0;
        appStore.setTheme("cupcake");
      }
    }
  };

  return (
    <ErrorBoundary>
      <Router history={history}>
        <BrowserEventHandler />
        <ThemeProvider theme={theme}>
          <Layout />
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
});
App.displayName = "App";

export default App;
