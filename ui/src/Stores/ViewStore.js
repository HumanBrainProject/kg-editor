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

import React from "react";
import { observable, action, computed, makeObservable } from "mobx";

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

class View {
  instanceId = null;
  name = "";
  mode = "edit";
  color = "";
  instancePath = [];
  instanceHighlight = {instanceId: null, provenance: null};
  selectedPane = null;
  panes = [];

  constructor(instanceId, name, color, mode) {
    makeObservable(this, {
      instanceId: observable,
      name: observable,
      mode: observable,
      color: observable,
      instancePath: observable,
      instanceHighlight: observable,
      selectedPane: observable,
      panes: observable,
      currentInstanceId: computed,
      currentInstanceIdPane: computed,
      setCurrentInstanceId: action,
      setInstanceHighlight: action,
      resetInstanceHighlight: action,
      setNameAndColor: action,
      selectedPaneIndex: computed,
      registerPane: action,
      selectPane: action,
      unregisterPane: action
    });

    this.instanceId = instanceId;
    this.name = name;
    this.color = color;
    this.mode = mode;
    this.instancePath = [instanceId];
  }

  get currentInstanceId() {
    return this.instancePath[this.instancePath.length-1];
  }

  get currentInstanceIdPane() {
    return this.panes[this.instancePath.length];
  }

  setCurrentInstanceId(pane, instanceId) {
    const start = this.panes.findIndex(p => p === pane);
    this.instancePath.splice(start, this.instancePath.length-start, instanceId);
  }

  setInstanceHighlight(pane, instanceId, provenance) {
    this.instanceHighlight.pane = pane;
    this.instanceHighlight.instanceId = instanceId;
    this.instanceHighlight.provenance = provenance;
  }

  resetInstanceHighlight() {
    this.setInstanceHighlight(null, null, null);
  }

  setNameAndColor(name, color) {
    this.name = name;
    this.color = color;
  }

  get selectedPaneIndex() {
    const index = this.getPaneIndex(this.selectedPane);
    return index;
  }

  getPaneIndex(paneId) {
    return this.panes.indexOf(paneId);
  }

  getPane(paneId) {
    return this.panes.find(p => p.paneId === paneId);
  }

  registerPane(paneId) {
    this.panes.push(paneId);
    if(!this.selectedPane){
      this.selectedPane = paneId;
    }
  }

  selectPane(pane) {
    this.selectedPane = pane;
  }

  unregisterPane(paneId) {
    this.panes = this.panes.filter(p => p !== paneId);
  }
}

export class ViewStore{
  views = new Map();
  selectedView = null;

  transportLayer = null;

  rootStore = null;

  constructor(transportLayer, rootStore) {
    makeObservable(this, {
      views: observable,
      selectedView: observable,
      selectViewByInstanceId: action,
      unregisterViewByInstanceId: action,
      unregisterAllViews: action,
      clearViews: action,
      registerViewByInstanceId: action,
      replaceViewByNewInstanceId: action,
      instancesIds: computed
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  syncStoredViews(){
    if (this.rootStore.appStore.currentSpace) {
      const views = getStoredViews();
      views[this.rootStore.appStore.currentSpace.id] = [...this.views.entries()].filter(([, view]) => view.mode !== "create").map(([id, view])=> ({id:id, name:view.name, color:view.color, mode: view.mode, selected:this.selectedView ? this.selectedView.instanceId === id:false}));
      localStorage.setItem(STORED_INSTANCE_VIEWS_KEY, JSON.stringify(views));
    }
  }

  flushStoredViews(){
    localStorage.removeItem(STORED_INSTANCE_VIEWS_KEY);
  }

  restoreViews(preventSelectView=false){
    this.clearViews();
    if(this.rootStore.appStore.currentSpace) {
      const views = getStoredViews();
      const workspaceViews = views[this.rootStore.appStore.currentSpace.id];
      let selectedView = null;
      if (Array.isArray(workspaceViews)) {
        workspaceViews.forEach(view => {
          if (!preventSelectView && view.selected) {
            selectedView = view;
          }
          const {id, name, color, mode} = view;
          this.views.set(id, new View(id, name, color, mode));
        });
      }
      if (selectedView) {
        selectedView.mode === "view" ? this.rootStore.history.push(`/instances/${selectedView.id}`):this.rootStore.history.push(`/instances/${selectedView.id}/${selectedView.mode}`);
      }
    }
  }

  selectViewByInstanceId(instanceId) {
    this.selectedView = this.views.get(instanceId);
    this.syncStoredViews();
  }

  unregisterViewByInstanceId(instanceId) {
    if (this.selectedView && this.selectedView.instanceId === instanceId) {
      this.selectedView = null;
    }
    this.views.delete(instanceId);
    this.syncStoredViews();
  }

  unregisterAllViews() {
    this.clearViews();
    this.syncStoredViews();
  }

  clearViews() {
    this.selectedView = null;
    this.views.clear();
  }

  registerViewByInstanceId(instanceId, name, type, viewMode) {
    if (this.views.has(instanceId)) {
      this.views.get(instanceId).mode = viewMode;
    } else {
      this.views.set(instanceId, new View(instanceId, name, type?type.color:"", viewMode));
    }
  }

  replaceViewByNewInstanceId(id, newId) {
    const view = this.views.get(id);
    this.views.set(newId, new View(newId, view?view.name:"", "edit"));
    this.views.delete(id);
  }

  get instancesIds() {
    return Array.from(this.views.keys());
  }
}

export const PaneContext = React.createContext(null);
export const ViewContext = React.createContext(null);

export default ViewStore;