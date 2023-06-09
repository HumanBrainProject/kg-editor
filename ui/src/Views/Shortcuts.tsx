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

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useLocation } from "react-router-dom";

import useStores from "../Hooks/useStores";
import Matomo from "../Services/Matomo";

const kCode = { step: 0, ref: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"] };

const Shortcuts = observer(() => {

  const location = useLocation();
  const navigate = useNavigate();

  const { appStore } = useStores();

  useEffect(() => {
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyT") {
        Matomo.trackEvent("Shortcut", "ToggleTheme");
        appStore.toggleTheme();
      } else if (e.altKey && e.shiftKey && e.code === "KeyF") { // alt+shift+f, browse
        Matomo.trackEvent("Shortcut", "Browse");
        navigate("/browse");
      } else if (e.altKey && e.code === "KeyD") { // alt+d, dashboard
        Matomo.trackEvent("Shortcut", "Home");
        navigate("/");
      } else if (e.code === "F1") { // F1, help
        Matomo.trackEvent("Shortcut", "Help");
        navigate("/help");
      } else if (e.altKey && e.code === "KeyW") { // alt+w, close
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
      } else if (e.altKey && e.code === "ArrowLeft") { // left arrow, previous
        const matchInstanceTab = appStore.matchInstancePath(location.pathname) as { params: { id: string }};
        appStore.focusPreviousInstance(matchInstanceTab && matchInstanceTab.params.id, location, navigate);
      } else if (e.altKey && e.code === "ArrowRight") { // right arrow, next
        const matchInstanceTab = appStore.matchInstancePath(location.pathname) as { params: { id: string }};
        appStore.focusNextInstance(matchInstanceTab && matchInstanceTab.params.id, location, navigate);
      } else {
        kCode.step = kCode.ref[kCode.step] === e.code ? kCode.step + 1 : 0;
        if (kCode.step === kCode.ref.length) {
          kCode.step = 0;
          Matomo.trackEvent("Shortcut", "KonamiCode", ":-D");
          appStore.setTheme("cupcake");
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
});
Shortcuts.displayName = "Shortcuts";

export default Shortcuts;
