import {observable, action, runInAction} from "mobx";

import DefaultTheme from "../Themes/Default";
import BrightTheme from "../Themes/Bright";
import CupcakeTheme from "../Themes/Cupcake";
import authStore from "./AuthStore";
import instanceStore from "./InstanceStore";
import routerStore from "./RouterStore";
import API from "../Services/API";
import historyStore from "./HistoryStore";
import instanceTabStore from "./InstanceTabStore";
import typesStore from "./TypesStore";

class AppStore{
  @observable globalError = null;
  @observable currentTheme;
  @observable historySettings;
  @observable instanceIdAvailability = new Map();
  @observable currentWorkspace = null;

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
        type: " http://schema.org/Dataset",
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

  async initialize() {
    const openedTabs = instanceTabStore.getStoredInstanceTabs();
    if(!authStore.isAuthenticated) {
      await authStore.authenticate();
    }
    if(authStore.isAuthenticated && !authStore.hasUserProfile) {
      await authStore.retrieveUserProfile();
    }
    if(authStore.isFullyAuthenticated) {
      authStore.retrieveUserWorkspace();
      instanceTabStore.restoreOpenedTabs(openedTabs);
    }
  }

  @action
  retrieveUserWorkspace(){
    const savedWorkspace = localStorage.getItem("currentWorkspace");
    if (this.user.workspaces.includes(savedWorkspace)) {
      this.currentWorkspace = savedWorkspace;
    } else {
      if (this.user.workspaces.length) {
        if (this.user.workspaces.length > 1) {
          this.currentWorkspace = null;
        } else {
          localStorage.setItem("currentWorkspace", this.user.workspaces[0]);
        }
      }
    }
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

  setTypeHistorySetting(type){
    this.historySettings.type = type;
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
  setCurrentWorkspace = workspace => {
    if(authStore.currentWorkspace !== workspace) {
      if(instanceTabStore.openedInstances.size > 0 && window.confirm("You are about to change workspace. All opened instances will be closed. Continue ?")) {
        this.handleCloseAllInstances();
      } else {
        return;
      }
      this.currentWorkspace = workspace;
      localStorage.setItem("currentWorkspace", workspace);
      instanceStore.restoreOpenedTabs();
      typesStore.fetch(true);
    }
  }


  @action
  resetInstanceIdAvailability() {
    this.instanceIdAvailability.clear();
  }

  @action
  async checkInstanceIdAvailability(instanceId){
    this.instanceIdAvailability.set(instanceId, {
      resolvedId: null,
      isAvailable: false,
      isChecking: true,
      error: null
    });
    try{
      const { data } = await API.axios.get(API.endpoints.resolvedId(instanceId));
      runInAction(() => {
        const resolvedId = (data && data.data && data.data.uuid)?data.data.uuid:instanceId;
        this.instanceIdAvailability.delete(instanceId);
        routerStore.history.replace(`/instance/edit/${resolvedId}`);
      });
    } catch(e){
      runInAction(() => {
        const status =  this.instanceIdAvailability.get(instanceId);
        if (e.response && e.response.status === 404) {
          status.isAvailable = true;
          status.isChecking = false;
        } else {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          status.error = `Failed to check instance "${instanceId}" (${message}) ${errorMessage}`;
          status.isChecking = false;
          status.isAvailable = false;
        }
      });
    }

  }

  @action
  removeUnusedInstances(instanceId, linkedInstanceIds) {
    const instanceIdsToBeKept = instanceTabStore.getOpenedInstancesExceptCurrent(instanceId);
    const instanceIdsToBeRemoved = linkedInstanceIds.filter(id => !instanceIdsToBeKept.includes(id));
    instanceStore.removeInstances(instanceIdsToBeRemoved);
  }

  @action openInstance(instanceId, viewMode = "view", readMode = true){
    instanceTabStore.togglePreviewInstance();
    instanceStore.setReadMode(readMode);
    instanceTabStore.openInstance(instanceId, viewMode);
    if(viewMode === "create") {
      this.checkInstanceIdAvailability(instanceId);
    } else {
      const instance = instanceStore.createInstanceOrGet(instanceId);
      if(instance.isFetched && !instance.fetchError) {
        const types = instance.types.map(({name}) => name);
        historyStore.updateInstanceHistory(instance.id, types, "viewed");
      } else {
        instance.fetch();
      }
    }
    instanceStore.setCurrentInstanceId(instanceId, instanceId, 0);
    instanceTabStore.syncStoredInstanceTabs();
  }
}

export default new AppStore();