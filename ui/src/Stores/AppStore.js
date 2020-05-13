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

import { observable, action } from "mobx";

import DefaultTheme from "../Themes/Default";
import BrightTheme from "../Themes/Bright";
import CupcakeTheme from "../Themes/Cupcake";

class AppStore{
  @observable globalError = null;
  @observable currentTheme;
  @observable historySettings;

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
  }

  @action
  setGlobalError(error, info){
    this.globalError = {error, info};
  }

  @action
  dismissGlobalError(){
    this.globalError = null;
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
}

export default new AppStore();