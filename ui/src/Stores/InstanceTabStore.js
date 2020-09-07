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

import {observable, action} from "mobx";
import PaneStore from "./PaneStore";
import instanceStore from "./InstanceStore";
import appStore from "./AppStore";

const STORED_INSTANCE_TABS_KEY = "openedTabs";

const getStoredInstanceTabs = () => {
  const value = localStorage.getItem(STORED_INSTANCE_TABS_KEY);
  if(!value) {
    return {};
  }
  try {
    const tabs = JSON.parse(value);
    if (tabs && typeof tabs === "object" && !(tabs instanceof Array)) {
      return tabs;
    }
    return {};
  } catch (e) {
    return {};
  }
};

class InstanceTabStore{
  @observable instanceTabs = new Map();

  syncStoredInstanceTabs(){
    if (appStore.currentWorkspace) {
      const tabs = getStoredInstanceTabs();
      tabs[appStore.currentWorkspace.id] = [...this.instanceTabs].map(([id, infos])=>[id, infos.viewMode]);
      localStorage.setItem(STORED_INSTANCE_TABS_KEY, JSON.stringify(tabs));
    }
  }

  flushStoredInstanceTabs(){
    localStorage.removeItem(STORED_INSTANCE_TABS_KEY);
  }

  getWorkspaceStoredInstanceTabs(){
    if(!appStore.currentWorkspace) {
      return [];
    }
    const tabs = getStoredInstanceTabs();
    const workspaceTabs = tabs[appStore.currentWorkspace.id];
    if (workspaceTabs instanceof Array) {
      return workspaceTabs;
    }
    return [];
  }

  @action
  closeInstanceTab(instanceId){
    this.instanceTabs.delete(instanceId);
    this.syncStoredInstanceTabs();
  }

  @action
  closeAllInstanceTabs(){
    this.instanceTabs.clear();
    this.syncStoredInstanceTabs();
  }

  @action
  clearInstanceTabs() {
    this.instanceTabs.clear();
  }

  @action
  openInstanceTab(instanceId, viewMode) {
    if (this.instanceTabs.has(instanceId)) {
      this.instanceTabs.get(instanceId).viewMode = viewMode;
    } else {
      this.instanceTabs.set(instanceId, {
        currentInstancePath: [],
        viewMode: viewMode,
        paneStore: new PaneStore()
      });
    }
  }

  @action
  replaceInstanceId(id, newId) {
    const instanceTab = this.instanceTabs.get(id);
    this.instanceTabs.set(newId, {
      currentInstancePath: instanceTab.currentInstancePath,
      viewMode: "edit",
      paneStore: instanceTab.paneStore
    });
    this.instanceTabs.delete(id);
  }

  getOpenedInstanceTabsExceptCurrent(instanceId) {
    const result = Array.from(this.instanceTabs.keys()).reduce((acc, id) => {
      if (id !== instanceId) {
        const instance = instanceStore.instances.get(id);
        if (instance) {
          const linkedIds = instance.linkedIds;
          acc.push(...linkedIds);
        }
      }
      return acc;
    }, []);
    return Array.from(new Set(result));
  }

  @action
  setCurrentInstanceId(mainInstanceId, currentInstanceId, level){
    let currentInstancePath = this.instanceTabs.get(mainInstanceId).currentInstancePath;
    currentInstancePath.splice(level, currentInstancePath.length-level, currentInstanceId);
  }

  getCurrentInstanceId(instanceId){
    let currentInstancePath = this.instanceTabs.get(instanceId).currentInstancePath;
    return currentInstancePath[currentInstancePath.length-1];
  }

}

export default new InstanceTabStore();