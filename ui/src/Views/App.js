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
import _  from "lodash-uuid";
import ReactPiwik from "react-piwik";

import { useStores } from "../Hooks/UseStores";

import Layout from "./Layout";

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

const App = observer(() => {

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
      ReactPiwik.push(["trackEvent", "Shortcut", "ToggleTheme"]);
      appStore.toggleTheme();
    } else if (e.altKey && e.shiftKey && e.keyCode === 70) { // alt+shift+f, browse
      ReactPiwik.push(["trackEvent", "Shortcut", "Browse"]);
      navigate("/browse");
    } else if (e.altKey && e.keyCode === 78) { // alt+n, new
      ReactPiwik.push(["trackEvent", "Shortcut", "Create"]);
      const uuid = _.uuid();
      navigate(`/instances/${uuid}/create`);
    } else if (e.altKey && e.keyCode === 68) { // alt+d, dashboard
      ReactPiwik.push(["trackEvent", "Shortcut", "Home"]);
      navigate("/");
    } else if (e.keyCode === 112) { // F1, help
      ReactPiwik.push(["trackEvent", "Shortcut", "Help"]);
      navigate("/help");
    } else if (e.altKey && e.keyCode === 87) { // alt+w, close
      if (e.shiftKey) { // alt+shift+w, close all
        ReactPiwik.push(["trackEvent", "Shortcut", "CloseAllInstances"]);
        appStore.closeAllInstances(location, navigate);
      } else {
        const matchInstanceTab = appStore.matchInstancePath(location.pathname);
        if (matchInstanceTab) {
          ReactPiwik.push(["trackEvent", "Shortcut", "InstanceClose", matchInstanceTab.params.id]);
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
        ReactPiwik.push(["trackEvent", "Shortcut", "KonamiCode", ":-D"]);
        appStore.setTheme("cupcake");
      }
    }
  };

  return (
    <>
      <BrowserEventHandler />
      <ThemeProvider theme={theme}>
        <Layout />
      </ThemeProvider>
    </>
  );
});
App.displayName = "App";

export default App;
