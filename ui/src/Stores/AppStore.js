import {observable, action, runInAction} from "mobx";
import { matchPath } from "react-router-dom";

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
  @observable initializingMessage = "Initializing...";
  @observable initializationError = null;
  @observable isInitialized = false;
  @observable currentTheme;
  @observable historySettings;
  @observable instanceIdAvailability = new Map();
  @observable currentWorkspace = null;
  @observable previewInstance = null;
  @observable showSaveBar = false;

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

  @action
  async initialize() {
    if (!this.isInitialized) {
      this.initializingMessage = "Initializing...";
      this.initializationError = null;
      if(!authStore.isAuthenticated) {
        this.initializingMessage = "Authenticating...";
        await authStore.authenticate();
        if (authStore.authError) {
          runInAction(() => {
            this.initializationError = authStore.authError;
            this.initializingMessage = null;
          });
        }
      }
      if(authStore.isAuthenticated && !authStore.hasUserProfile) {
        this.initializingMessage = "Retrieving user profile...";
        await authStore.retrieveUserProfile();
        if (authStore.userProfileError) {
          runInAction(() => {
            this.initializationError = authStore.userProfileError;
            this.initializingMessage = null;
          });
        }
      }
      if(authStore.isFullyAuthenticated) {
        await this.initializeWorkspace();
        runInAction(() => {
          this.initializingMessage = null;
          this.isInitialized = true;
        });
      }
    }
  }

  async initializeWorkspace() {
    let workspace = null;
    const path = matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" });
    if (path && path.params.mode !== "create") {
      workspace = await this.getInitialInstanceWorkspace(path.params.id);
    }
    this.initializingMessage = "Setting workspace...";
    if (!workspace) {
      workspace = localStorage.getItem("currentWorkspace");
    }
    if (!workspace || !authStore.workspaces.includes(workspace)) {
      if (authStore.hasWorkspaces) {
        workspace = authStore.workspaces[0];
      } else {
        workspace = null;
      }
    }
    this.setCurrentWorkspace(workspace);
    this.restoreWorkspaceInstanceTabs();
    if (path) {
      if (workspace && workspace != this.currentWorkspace) {
        routerStore.history.push("/browse");
      }
    }
  }

  async getInitialInstanceWorkspace(instanceId){
    this.initializingMessage = `Retrieving instance "${instanceId}"...`;
    try{
      let response = await API.axios.post(API.endpoints.instancesList("LIVE"), [instanceId]);
      const data = find(response.data.data, item => item.id === instanceId);
      if(data){
        if(data.workspace){
          return data.workspace;
        }
        runInAction(() => {
          this.initializationError = `Instance "${instanceId}" does not have a workspace.`;
          this.initializingMessage = null;
        });
        return null;
      } else {
        runInAction(() => {
          this.initializationError = `Instance "${instanceId}" can not be found - it either could have been removed or it is not accessible by your user account.`;
          this.initializingMessage = null;
        });
      }
    } catch(e){
      runInAction(() => {
        const message = e.message?e.message:e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
        if(e.response && e.response.status === 404){
          this.initializationError = `Instance "${instanceId}" can not be found - it either could have been removed or it is not accessible by your user account.`;
        }
        else {
          this.initializationError = `Error while retrieving instance "${instanceId}" (${message}) ${errorMessage}`;
        }
        this.initializingMessage = null;
      });
    }
    return null;
  }

  restoreWorkspaceInstanceTabs() {
    const instanceTabs = instanceTabStore.getWorkspaceStoredInstanceTabs();
    instanceTabs.forEach(([id, viewMode]) => {
      this.openInstance(id, viewMode, viewMode !== "edit" && viewMode !== "create");
    });
  }

  closeAllInstances() {
    this.resetInstanceIdAvailability();
    if (!(matchPath(routerStore.history.location.pathname, { path: "/", exact: "true" })
      || matchPath(routerStore.history.location.pathname, { path: "/browse", exact: "true" })
      || matchPath(routerStore.history.location.pathname, { path: "/help/*", exact: "true" }))) {
      routerStore.history.push("/browse");
    }
    instanceTabStore.closeAllInstanceTabs();
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
    if (!workspace || !authStore.workspaces.includes(workspace)) {
      if (authStore.hasWorkspaces) {
        workspace = authStore.workspaces[0];
      } else {
        workspace = null;
      }
    }
    if(this.currentWorkspace !== workspace) {
      if(instanceTabStore.instancesTabs.size > 0 && window.confirm("You are about to change workspace. All opened instances will be closed. Continue ?")) {
        this.closeAllInstances();
      } else {
        return;
      }
      this.currentWorkspace = workspace;
      localStorage.setItem("currentWorkspace", workspace);
      this.restoreWorkspaceInstanceTabs();
      typesStore.fetch(true);
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
    const instanceIdsToBeKept = instanceTabStore.getOpenedInstanceTabsExceptCurrent(instanceId);
    const instanceIdsToBeRemoved = linkedInstanceIds.filter(id => !instanceIdsToBeKept.includes(id));
    instanceStore.removeInstances(instanceIdsToBeRemoved);
  }

  @action openInstance(instanceId, viewMode = "view", readMode = true){
    instanceTabStore.togglePreviewInstance();
    instanceStore.setReadMode(readMode);
    instanceTabStore.openInstanceTab(instanceId, viewMode);
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