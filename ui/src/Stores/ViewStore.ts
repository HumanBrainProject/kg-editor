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

import { observable, action, computed, makeObservable } from 'mobx';
import React from 'react';
import { ViewMode } from '../types';
import type RootStore from './RootStore';
import type API from '../Services/API';
import type { SimpleType, UUID} from '../types';

interface StoredSpaceView {
  id: UUID;
  name: string;
  mode: ViewMode;
  color: string;
  description: string;
  selected: boolean;
}

interface StoredViews {
  [space: string]: StoredSpaceView[];
}

const STORED_INSTANCE_VIEWS_KEY = 'views';

const getStoredViews = (): StoredViews => {
  const value = localStorage.getItem(STORED_INSTANCE_VIEWS_KEY);
  if(!value) {
    return {};
  }
  try {
    const views = JSON.parse(value);
    if (views && typeof views === 'object') {
      return views;
    }
    return {};
  } catch (e) {
    return {};
  }
};

interface InstanceHighlight {
  pane?: string;
  instanceId?: string | null;
  provenance?: string;
}

export class View {
  instanceId: UUID;
  name: string;
  mode: ViewMode;
  color: string;
  type?: string;
  description: string;
  instancePath: string[] = [];
  instanceHighlight: InstanceHighlight = {pane: undefined, instanceId: undefined, provenance: undefined};
  selectedPane?: string;
  panes: string[] = [];

  constructor(instanceId: string, name: string, color: string, mode: ViewMode, description?: string) {
    makeObservable(this, {
      instanceId: observable,
      name: observable,
      mode: observable,
      color: observable,
      description: observable,
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
      unregisterPane: action,
      setType: action
    });

    this.instanceId = instanceId;
    this.name = name;
    this.color = color;
    this.description = description??'';
    this.mode = mode;
    this.instancePath = [instanceId];
  }

  get currentInstanceId() {
    return this.instancePath[this.instancePath.length-1];
  }

  get currentInstanceIdPane() {
    return this.panes[this.instancePath.length];
  }

  getPaneByInstanceId(instanceId?: UUID | null) {
    const index = this.instancePath.findIndex(id => id === instanceId);
    if (index != -1) {
      return this.panes[index];
    }
    return null;
  }

  setCurrentInstanceId(pane: string, instanceId: UUID) {
    const start = this.panes.findIndex(p => p === pane);
    this.instancePath.splice(start, this.instancePath.length-start, instanceId);
  }

  setInstanceHighlight(pane?: string, instanceId?: UUID|null, provenance?: string) {
    this.instanceHighlight.pane = pane;
    this.instanceHighlight.instanceId = instanceId;
    this.instanceHighlight.provenance = provenance;
  }

  resetInstanceHighlight() {
    this.setInstanceHighlight();
  }

  setNameAndColor(name: string, color: string) {
    this.name = name;
    this.color = color;
  }

  get selectedPaneIndex() {
    if(this.selectedPane) {
      return this.getPaneIndex(this.selectedPane);
    }
    return undefined;
  }

  getPaneIndex(paneId: string) {
    return this.panes.indexOf(paneId);
  }

  getPane(paneId: string) {
    return this.panes.find(p => p === paneId);
  }

  registerPane(paneId: string) {
    this.panes.push(paneId);
    if(!this.selectedPane){
      this.selectedPane = paneId;
    }
  }

  selectPane(pane: string) {
    this.selectedPane = pane;
  }

  unregisterPane(paneId: string) {
    this.panes = this.panes.filter(p => p !== paneId);
  }

  setType(type?: string) {
    this.type = type??'';
  }
}

export class ViewStore{
  views = new Map<string, View>();
  selectedView?: View;

  api: API;
  rootStore: RootStore;

  constructor(api: API, rootStore: RootStore) {
    makeObservable(this, {
      views: observable,
      selectedView: observable,
      restoreViews: action,
      selectViewByInstanceId: action,
      unregisterViewByInstanceId: action,
      unregisterAllViews: action,
      clearViews: action,
      registerViewByInstanceId: action,
      replaceViewByNewInstanceId: action,
      instancesIds: computed,
      syncStoredViews: action
    });

    this.api = api;
    this.rootStore = rootStore;
  }

  syncStoredViews(){
    if (this.rootStore.appStore.currentSpace) {
      const views = getStoredViews();
      views[this.rootStore.appStore.currentSpace.id] = [...this.views.entries()].filter(([, view]) => view.mode !== 'create').map(([id, view])=> ({id:id, name:view.name, color:view.color, description: view.description, mode: view.mode, selected:this.selectedView ? this.selectedView.instanceId === id:false}));
      localStorage.setItem(STORED_INSTANCE_VIEWS_KEY, JSON.stringify(views));
    }
  }

  flushStoredViewsforSpace(){
    if (this.rootStore.appStore.currentSpace) {
      const views = getStoredViews();
      delete views[this.rootStore.appStore.currentSpace.id];
      localStorage.setItem(STORED_INSTANCE_VIEWS_KEY, JSON.stringify(views));
    }
  }

  flushStoredViews(){
    localStorage.removeItem(STORED_INSTANCE_VIEWS_KEY);
  }

  restoreViews(): string|null{
    this.clearViews();
    if(this.rootStore.appStore.currentSpace) {
      const views = getStoredViews();
      const spaceViews = views[this.rootStore.appStore.currentSpace.id];
      let selectedView: StoredSpaceView|undefined;
      if (Array.isArray(spaceViews)) {
        spaceViews.forEach(view => {
          if (view.selected) {
            selectedView = view;
          }
          const {id, name, color, mode, description} = view;
          this.views.set(id, new View(id, name, color, mode, description));
        });
      }
      if (!selectedView) {
        return null;
      }
      if (selectedView.mode === 'view') {
        return `/instances/${selectedView.id}`;
      }
      return `/instances/${selectedView.id}/${selectedView.mode}`;
    }
    return null;
  }

  selectViewByInstanceId(instanceId: string) {
    this.selectedView = this.views.get(instanceId);
    this.syncStoredViews();
  }

  unregisterViewByInstanceId(instanceId: string) {
    if (this.selectedView && this.selectedView.instanceId === instanceId) {
      this.selectedView = undefined;
    }
    this.views.delete(instanceId);
    this.syncStoredViews();
  }

  unregisterAllViews() {
    this.clearViews();
    this.syncStoredViews();
  }

  clearViews() {
    this.selectedView = undefined;
    this.views.clear();
  }

  registerViewByInstanceId(instanceId: string, name: string, type: SimpleType|undefined, viewMode: ViewMode) {
    const existingView = this.views.get(instanceId);
    if (existingView) {
      existingView.mode = viewMode;
    } else {
      const typeDescription = type?.description??type?.name;
      const view = new View(instanceId, name, type?type.color:'', viewMode, typeDescription);
      if (viewMode === 'create') {
        view.setType(type?.name);
      }
      this.views.set(instanceId, view);
    }
  }

  replaceViewByNewInstanceId(id: string, newId: string) {
    const view = this.views.get(id);
    this.views.set(newId, new View(newId, view?view.name:'', view?.color??'', ViewMode.EDIT, view?.description??''));
    this.views.delete(id);
  }

  get instancesIds() {
    return Array.from(this.views.keys());
  }
}

export const PaneContext = React.createContext<string|undefined>(undefined);
export const ViewContext = React.createContext<View|undefined>(undefined);

export default ViewStore;