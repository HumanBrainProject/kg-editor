import {observable, action} from "mobx";
import PaneStore from "./PaneStore";
import authStore from "./AuthStore";
import instanceStore from "./InstanceStore";
import appStore from "./AppStore";

const STORED_INSTANCE_TABS_KEY = "openedTabs";

class InstanceTabStore{
  @observable openedInstances = new Map();
  @observable previewInstance = null;

  syncStoredInstanceTabs(){
    const instanceTabs = this.getStoredInstanceTabs();
    let obj = instanceTabs?JSON.parse(instanceTabs):{};
    obj[authStore.currentWorkspace] = [...this.openedInstances].map(([id, infos])=>[id, infos.viewMode]);
    localStorage.setItem(STORED_INSTANCE_TABS_KEY, JSON.stringify(obj));
  }

  flushStoredInstanceTabs(){
    localStorage.removeItem(STORED_INSTANCE_TABS_KEY);
  }

  getStoredInstanceTabs() {
    return localStorage.getItem(STORED_INSTANCE_TABS_KEY);
  }

  @action
  restoreOpenedTabs(instanceTabs){
    if(authStore.currentWorkspace) {
      if (!instanceTabs) {
        instanceTabs = this.getStoredInstanceTabs();
      }
      if(instanceTabs) {
        const storedOpenedTabs = JSON.parse(instanceTabs);
        const tabs = storedOpenedTabs[authStore.currentWorkspace];
        tabs instanceof Array && tabs.forEach(([id, viewMode]) => {
          appStore.openInstance(id, viewMode, viewMode !== "edit" && viewMode !== "create");
        });
      }
    }
  }

  @action
  toggleSavebarDisplay(state){
    this.showSaveBar = state !== undefined? !!state: !this.showSaveBar;
  }

  @action
  togglePreviewInstance(instanceId, instanceName, options) {
    if (!instanceId || (this.previewInstance && this.previewInstance.id === instanceId)) {
      this.previewInstance = null;
    } else {
      this.previewInstance = {id: instanceId, name: instanceName, options: options};
    }
  }

  @action
  closeInstance(instanceId){
    this.openedInstances.delete(instanceId);
    this.syncStoredInstanceTabs();
  }

  @action
  closeAllInstances(){
    this.openedInstances.clear();
    this.syncStoredInstanceTabs();
  }

  @action
  clearOpenedInstances() {
    this.openedInstances.clear();
  }

  @action
  openInstance(instanceId, viewMode) {
    if (this.openedInstances.has(instanceId)) {
      this.openedInstances.get(instanceId).viewMode = viewMode;
    } else {
      this.openedInstances.set(instanceId, {
        currentInstancePath: [],
        viewMode: viewMode,
        paneStore: new PaneStore()
      });
    }
  }

  getOpenedInstancesExceptCurrent(instanceId) {
    let result = [];
    Array.from(this.openedInstances.keys()).forEach(id => {
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