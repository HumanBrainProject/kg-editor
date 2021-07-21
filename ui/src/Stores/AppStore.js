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

import { observable, action, runInAction } from "mobx";
import { matchPath } from "react-router-dom";
import * as Sentry from "@sentry/browser";

import authStore from "./AuthStore";
import routerStore from "../Stores/RouterStore";

import DefaultTheme from "../Themes/Default";
import BrightTheme from "../Themes/Bright";
import CupcakeTheme from "../Themes/Cupcake";

class AppStore{
  @observable canLogin = true;
  @observable isInitialized = false;
  @observable globalError = null;
  @observable currentTheme;
  @observable historySettings;
  @observable initializingMessage = null;
  @observable initializationError = null;

  availableThemes = {
    "default": DefaultTheme,
    "bright": BrightTheme,
    "cupcake": CupcakeTheme
  }

  constructor(){
    let savedTheme = localStorage.getItem("currentTheme");
    this.currentTheme = savedTheme === "bright"? "bright": "default";
    let savedHistorySettings = null;
    if (localStorage.getItem("historySettings")) {
      try {
        savedHistorySettings = JSON.parse(localStorage.getItem("historySettings"));
      } catch (e) {
        savedHistorySettings = null;
      }
    }
    if (!savedHistorySettings) {
      savedHistorySettings = {
        size: 10,
        nodeType: "dataset",
        eventTypes: {
          viewed: false,
          edited: true,
          bookmarked: true,
          released: false
        }
      };
    }
    this.historySettings = savedHistorySettings;
    this.canLogin = !matchPath(routerStore.history.location.pathname, { path: "/logout", exact: "true" });
  }


  @action
  setGlobalError(error, info){
    this.globalError = {error, info};
  }

  @action
  dismissGlobalError(){
    this.globalError = null;
  }

  captureSentryException = e => {
    const { response } = e;
    const { status } = response;
    switch(status) {
    case 500:
    {
      Sentry.captureException(e);
      break;
    }
    }
  }

  setTheme(theme){
    this.currentTheme = this.availableThemes[theme]? theme: "default";
    localStorage.setItem("currentTheme", this.currentTheme);
  }

  toggleTheme(){
    if(this.currentTheme === "bright"){
      this.setTheme("default");
    } else {
      this.setTheme("bright");
    }
  }

  setSizeHistorySetting(size){
    size = Number(size);
    this.historySettings.size = (!isNaN(size) && size > 0)?size:10;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  setNodeTypeHistorySetting(nodeType){
    this.historySettings.nodeType = nodeType;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  toggleViewedFlagHistorySetting(on){
    this.historySettings.eventTypes.viewed = on?true:false;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  toggleEditedFlagHistorySetting(on){
    this.historySettings.eventTypes.edited = on?true:false;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  toggleBookmarkedFlagHistorySetting(on){
    this.historySettings.eventTypes.bookmarked = on?true:false;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  toggleReleasedFlagHistorySetting(on){
    this.historySettings.eventTypes.released = on?true:false;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  @action
  login(){
    if (this.canLogin) {
      authStore.login();
    } else {
      routerStore.history.replace("/");
      this.canLogin = true;
      this.initialize();
    }
  };

  @action
  async initialize() {
    if (this.canLogin && !this.isInitialized) {
      this.initializingMessage = "Initializing the application...";
      this.initializationError = null;
      if(!authStore.isAuthenticated) {
        this.initializingMessage = "User authenticating...";
        await authStore.authenticate();
        if (authStore.authError) {
          runInAction(() => {
            this.initializationError = authStore.authError;
            this.initializingMessage = null;
          });
        }
      }
      if(authStore.isAuthenticated && !authStore.hasUserProfile) {
        runInAction(() => {
          this.initializingMessage = "Retrieving user profile...";
        });
        await authStore.retrieveUserProfile();
        runInAction(() => {
          if (authStore.userProfileError) {
            this.initializationError = authStore.userProfileError;
            this.initializingMessage = null;
          } else if (authStore.isUserAuthorized && !authStore.isRetrievingUserProfile) {
            this.isInitialized = true;
            this.initializingMessage = null;
          }
        });
      }
    }
  }

}

export default new AppStore();