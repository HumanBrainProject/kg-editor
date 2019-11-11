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
    if (tabs && typeof tabs === "object") {
      return tabs;
    }
    return {};
  } catch (e) {
    return {};
  }
};

class InstanceTabStore{
  @observable instancesTabs = new Map();

  syncStoredInstanceTabs(){
    const tabs = getStoredInstanceTabs();
    tabs[appStore.currentWorkspace] = [...this.instancesTabs].map(([id, infos])=>[id, infos.viewMode]);
    localStorage.setItem(STORED_INSTANCE_TABS_KEY, JSON.stringify(tabs));
  }

  flushStoredInstanceTabs(){
    localStorage.removeItem(STORED_INSTANCE_TABS_KEY);
  }

  getWorkspaceStoredInstanceTabs(){
    if(!appStore.currentWorkspace) {
      return [];
    }
    const tabs = getStoredInstanceTabs();
    const workspaceTabs = tabs[appStore.currentWorkspace];
    if (workspaceTabs instanceof Array) {
      return workspaceTabs;
    }
    return [];
  }

  @action
  closeInstanceTab(instanceId){
    this.instancesTabs.delete(instanceId);
    this.syncStoredInstanceTabs();
  }

  @action
  closeAllInstanceTabs(){
    this.instancesTabs.clear();
    this.syncStoredInstanceTabs();
  }

  @action
  clearInstanceTabs() {
    this.instancesTabs.clear();
  }

  @action
  openInstanceTab(instanceId, viewMode) {
    if (this.instancesTabs.has(instanceId)) {
      this.instancesTabs.get(instanceId).viewMode = viewMode;
    } else {
      this.instancesTabs.set(instanceId, {
        currentInstancePath: [],
        viewMode: viewMode,
        paneStore: new PaneStore()
      });
    }
  }

  getOpenedInstanceTabsExceptCurrent(instanceId) {
    let result = [];
    Array.from(this.instancesTabs.keys()).forEach(id => {
      if (id !== instanceId) {
        const instance = instanceStore.instances.get(id);
        const instancesToBeKept = instance.linkedIds;
        result = [...result, ...instancesToBeKept];
      }
    });
    return Array.from(new Set(result));
  }


}

export default new InstanceTabStore();