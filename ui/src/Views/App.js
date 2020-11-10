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
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { Router } from "react-router-dom";
import { ThemeProvider } from "react-jss";

import { useStores } from "../Hooks/UseStores";

import ErrorBoundary from "./ErrorBoundary";
import Layout from "./Layout";

const App = observer(() => {

  const { appStore, history } = useStores();

  const theme = toJS(appStore.availableThemes[appStore.currentTheme]);

  useEffect(() => {
    appStore.initialize();
    document.addEventListener("keydown", appStore.handleGlobalShortcuts);
    return () => {
      document.removeEventListener("keydown", appStore.handleGlobalShortcuts);
    };
  }, [appStore]);

  return (
    <ErrorBoundary>
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <Layout />
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
});

export default App;
