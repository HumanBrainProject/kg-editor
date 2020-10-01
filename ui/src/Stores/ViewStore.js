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

import React from "react";
import {observable, action, computed} from "mobx";
import {remove} from "lodash";
import appStore from "./AppStore";

const STORED_INSTANCE_VIEWS_KEY = "views";

const getStoredViews = () => {
  const value = localStorage.getItem(STORED_INSTANCE_VIEWS_KEY);
  if(!value) {
    return {};
  }
  try {
    const views = JSON.parse(value);
    if (views && typeof views === "object") {
      return views;
    }
    return {};
  } catch (e) {
    return {};
  }
};


class Pane {
  paneId = null;

  constructor(paneId) {
    this.paneId = paneId;
  }
}

class View {
  instanceId = null;
  @observable name = "";
  @observable mode = "edit";
  @observable instancePath = [];
  @observable instanceHighlight = {instanceId: null, provenance: null};
  @observable selectedPane;
  @observable panes = [];

  constructor(instanceId, name, mode) {
    this.instanceId = instanceId;
    this.name = name;
    this.mode = mode;
    this.instancePath = [instanceId];
  }

  @computed
  get currentInstanceId() {
    return this.instancePath[this.instancePath.length-1];
  }

  @computed
  get currentInstanceIdPane() {
    return this.panes[this.instancePath.length];
  }

  @action
  setCurrentInstanceId(pane, instanceId){
    const start = this.panes.findIndex(p => p === pane);
    this.instancePath.splice(start, this.instancePath.length-start, instanceId);
  }

  @action
  setInstanceHighlight(instanceId, provenance) {
    this.instanceHighlight.instanceId = instanceId;
    this.instanceHighlight.provenance = provenance;
  }

  @action
  resetInstanceHighlight() {
    this.setInstanceHighlight(null, null);
  }

  @computed
  get selectedPaneIndex() {
    return this.panes.indexOf(this.selectedPane);
  }

  getPaneIndex(pane) {
    return this.panes.indexOf(pane);
  }

  getPane(paneId) {
    return this.panes.find(p => p.paneId === paneId);
  }

  @action
  registerPane(paneId) {
    const pane = new Pane(paneId);
    this.panes.push(pane);
    if(!this.selectedPane){
      this.selectedPane = pane;
    }
  }

  @action
  selectPane(pane) {
    this.selectedPane = pane;
  }

  @action
  unregisterPane(paneId) {
    const pane = this.getPane(paneId);
    remove(this.panes, p => p === pane);
  }
}

class ViewStore{
  @observable views = new Map();
  @observable selectedView = null;

  syncStoredViews(){
    if (appStore.currentWorkspace) {
      const views = getStoredViews();
      views[appStore.currentWorkspace.id] = [...this.views].map(([id, view])=>[id, view.name, view.mode]);
      localStorage.setItem(STORED_INSTANCE_VIEWS_KEY, JSON.stringify(views));
    }
  }

  flushStoredViews(){
    localStorage.removeItem(STORED_INSTANCE_VIEWS_KEY);
  }

  restoreViews(){
    this.clearViews();
    if(appStore.currentWorkspace) {
      const views = getStoredViews();
      const workspaceViews = views[appStore.currentWorkspace.id];
      if (Array.isArray(workspaceViews)) {
        workspaceViews.forEach(view => this.views.set(view.id, new View(view.id, view.name, view.mode)));
      }
    }
  }

  @action
  selectViewByInstanceId(instanceId) {
    this.selectedView = this.views.get(instanceId);
  }

  @action
  unregisterViewByInstanceId(instanceId){
    if (this.selectedView && this.selectedView.instanceId === instanceId) {
      this.selectedView = null;
    }
    this.views.delete(instanceId);
    this.syncStoredViews();
  }

  @action
  unregisterAllViews(){
    this.clearViews();
    this.syncStoredViews();
  }

  @action
  clearViews() {
    this.selectedView = null;
    this.views.clear();
  }

  @action
  registerViewByInstanceId(instanceId, name, viewMode) {
    if (this.views.has(instanceId)) {
      this.views.get(instanceId).mode = viewMode;
    } else {
      this.views.set(instanceId, new View(instanceId, name, viewMode));
    }
  }

  @action
  replaceViewByNewInstanceId(id, newId) {
    const view = this.views.get(id);
    this.views.set(newId, new View(newId, view?view.name:"", "edit"));
    this.views.delete(id);
  }

  @computed
  get instancesIds() {
    return Array.from(this.views.keys());
  }
}

export const PaneContext = React.createContext(Pane);
export const ViewContext = React.createContext(View);

export default new ViewStore();