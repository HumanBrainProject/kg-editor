import {observable, action, runInAction} from "mobx";
import { matchPath } from "react-router-dom";
import { find } from "lodash";
import _  from "lodash-uuid";

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
import browseStore from "./BrowseStore";

const kCode = { step: 0, ref: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] };

class AppStore{
  @observable globalError = null;
  @observable initializingMessage = "Initializing the application...";
  @observable initializationError = null;
  @observable initialInstanceError = null;
  @observable initialInstanceWorkspaceError = null;
  @observable isInitialized = false;
  @observable currentTheme;
  @observable historySettings;
  @observable instanceIdAvailability = new Map();
  @observable currentWorkspace = null;
  @observable previewInstance = null;
  @observable showSaveBar = false;
  @observable instanceToDelete = null;
  @observable isDeletingInstance = false;
  @observable deleteInstanceError = null;
  @observable isCreatingNewInstance = false;
  @observable instanceCreationError = null;
  @observable pathsToResolve = new Map();
  @observable comparedInstanceId = null;
  @observable comparedWithReleasedVersionInstance = null;

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
      this.initializingMessage = "Initializing the application...";
      this.initializationError = null;
      this.initialInstanceError = null;
      this.initialInstanceWorkspaceError = null;
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
          this.isInitialized = !!this.currentWorkspace || (!this.initialInstanceError && !this.initialInstanceWorkspaceError) ;
        });
      }
    }
  }

  @action flush(){
    instanceStore.flush();
    this.resetInstanceIdAvailability();
    this.showSaveBar = false;
    this.isCreatingNewInstance = false;
    this.instanceCreationError = null;
    this.instanceToDelete = null;
    this.isDeletingInstance = false;
    this.deleteInstanceError = null;
    this.pathsToResolve = new Map();
  }

  @action
  async initializeWorkspace() {
    let workspace = null;
    this.initializingMessage = "Setting workspace...";
    const path = matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" });
    if (path && path.params.mode !== "create") {
      workspace = await this.getInitialInstanceWorkspace(path.params.id);
      if (workspace) {
        this.setCurrentWorkspace(workspace);
        if (this.currentWorkspace !== workspace) {
          this.initialInstanceWorkspaceError = `Could not load instance "${path.params.id}" because you're not granted access to workspace "${workspace}".`;
        }
      }
      return this.currentWorkspace;
    } else {
      workspace = localStorage.getItem("currentWorkspace");
      this.setCurrentWorkspace(workspace);
      return this.currentWorkspace;
    }
  }

  @action
  async getInitialInstanceWorkspace(instanceId){
    this.initializingMessage = `Retrieving instance "${instanceId}"...`;
    try{
      const response = await API.axios.post(API.endpoints.instancesList("LIVE"), [instanceId]);
      const data = find(response.data.data, item => item.id === instanceId);
      if(data){
        if(data.workspace){
          return data.workspace;
        }
        runInAction(() => {
          this.initialInstanceError = `Instance "${instanceId}" does not have a workspace.`;
          this.initializingMessage = null;
        });
        return null;
      } else {
        runInAction(() => {
          this.initialInstanceError = `Instance "${instanceId}" can not be found - it either could have been removed or it is not accessible by your user account.`;
          this.initializingMessage = null;
        });
        return null;
      }
    } catch(e){
      runInAction(() => {
        const message = e.message?e.message:e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
        if(e.response && e.response.status === 404){
          this.initialInstanceError = `Instance "${instanceId}" can not be found - it either could have been removed or it is not accessible by your user account.`;
        }
        else {
          this.initialInstanceError = `Error while retrieving instance "${instanceId}" (${message}) ${errorMessage}`;
        }
        this.initializingMessage = null;
      });
    }
    return null;
  }

  @action
  cancelInitialInstance() {
    routerStore.history.replace("/browse");
    this.initializationError = null;
    this.initialInstanceError = null;
    this.initialInstanceWorkspaceError = null;
    this.initializingMessage = null;
    const workspace = localStorage.getItem("currentWorkspace");
    this.setCurrentWorkspace(workspace);
    this.isInitialized = true;
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

  clearInstanceTabs() {
    this.resetInstanceIdAvailability();
    if (!(matchPath(routerStore.history.location.pathname, { path: "/", exact: "true" })
      || matchPath(routerStore.history.location.pathname, { path: "/browse", exact: "true" })
      || matchPath(routerStore.history.location.pathname, { path: "/help/*", exact: "true" }))) {
      routerStore.history.push("/browse");
    }
    instanceTabStore.clearInstanceTabs();
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
      if (authStore.hasWorkspaces && authStore.workspaces.length === 1) {
        workspace = authStore.workspaces[0];
      } else {
        workspace = null;
      }
    }
    if(this.currentWorkspace !== workspace) {
      if(instanceTabStore.instanceTabs.size > 0) {
        if (window.confirm("You are about to change workspace. All opened instances will be closed. Continue ?")) {
          this.clearInstanceTabs();
        } else {
          return;
        }
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

  createInstance = () => {
    const uuid = _.uuid();
    routerStore.history.push(`/instance/create/${uuid}`);
  }

  @action openInstance(instanceId, viewMode = "view", readMode = true){
    this.togglePreviewInstance();
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
    instanceTabStore.setCurrentInstanceId(instanceId, instanceId, 0);
    instanceTabStore.syncStoredInstanceTabs();
  }


  closeInstance(instanceId) {
    if (matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" })) {
      if (matchPath(routerStore.history.location.pathname, { path: `/instance/:mode/${instanceId}`, exact: "true" })) {
        if (instanceTabStore.instanceTabs.size > 1) {
          let openedInstances = Array.from(instanceTabStore.instanceTabs.keys());
          let currentInstanceIndex = openedInstances.indexOf(instanceId);
          let newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex - 1] : openedInstances[currentInstanceIndex + 1];

          let openedInstance = instanceTabStore.instanceTabs.get(newCurrentInstanceId);
          routerStore.history.push(`/instance/${openedInstance.viewMode}/${newCurrentInstanceId}`);
        } else {
          routerStore.history.push("/browse");
          browseStore.clearSelectedInstance();
        }
      }
    }
    this.instanceIdAvailability.delete(instanceId);
    instanceTabStore.closeInstanceTab(instanceId);
    const instance = instanceStore.instances.get(instanceId);
    this.removeUnusedInstances(instanceId, instance.linkedIds);
  }

  @action
  async saveInstance(instance) {

    await instance.save();
    const types = this.types.map(({name}) => name);
    historyStore.updateInstanceHistory(this.id, types, "edited");

    this.cancelChangesPending = false;
    this.hasSaveError = false;
    this.isSaving = true;

    const payload = this.form.getValues();
    if (this.fieldsToSetAsNull.length > 0) {
      this.fieldsToSetAsNull.forEach(key=> payload[key] = null);
    }
    payload["@type"] = this.types.map(t => t.name);

    try {
      if (this.isNew) {
        const { data } = await API.axios.post(API.endpoints.createInstance(this.id), payload);
        runInAction(() => {
          const newId = data.data.id;
          this.isNew = false;
          this.hasChanged = false;
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          this.fieldsToSetAsNull = [];
          const instance = instanceTabStore.instanceTabs.get(this.id);
          if (newId !== this.id) {
            instanceTabStore.instanceTabs.set(newId, {
              currentInstancePath: instance.currentInstancePath,
              viewMode: "edit",
              paneStore: instance.paneStore
            });
            instanceTabStore.instanceTabs.delete(this.id);
            this.instanceStore.instances.set(newId, instance);
            this.instanceStore.instance.delete(this.id);
            this.instanceStore.pathsToResolve.set(`/instance/create/${this.id}`, `/instance/edit/${newId}`);
            this.id = newId;
          } else {
            instance.viewMode = "edit";
            this.instanceStore.pathsToResolve.set(`/instance/create/${this.id}`, `/instance/edit/${this.id}`);
          }
          this.initializeData(data.data, this.globalReadMode, false);
          const types = this.types.map(({name}) => name);
          historyStore.updateInstanceHistory(this.id, types, "edited");
          instanceTabStore.syncStoredInstanceTabs();
        });
      } else {
        const { data } = await API.axios.patch(API.endpoints.instance(this.id), payload);
        runInAction(() => {
          this.hasChanged = false;
          this.saveError = null;
          this.hasSaveError = false;
          this.isSaving = false;
          this.fieldsToSetAsNull = [];
          this.data = data.data;
        });
      }

      // TODO: Check if reload is still neeeded or if we only need to  update the instance object using the result of the save
      // this.fetch(true);
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
        this.saveError = `Error while saving instance "${this.id}" (${message}) ${errorMessage}`;
        this.hasSaveError = true;
        this.isSaving = false;
      });
    } finally {
      statusStore.flush();
    }
  }

  @action
  async deleteInstance(instanceId){
    if (instanceId) {
      this.instanceToDelete = instanceId;
      this.isDeletingInstance = true;
      this.deleteInstanceError = null;
      try{
        await API.axios.delete(API.endpoints.instance(instanceId));
        runInAction(() => {
          this.instanceToDelete = null;
          this.isDeletingInstance = false;
          let nextLocation = null;
          if(matchPath(routerStore.history.location.pathname, {path:"/instance/:mode/:id*", exact:"true"})){
            if(matchPath(routerStore.history.location.pathname, {path:`/instance/:mode/${instanceId}`, exact:"true"})){
              if(this.openedInstances.size > 1){
                let openedInstances = Array.from(this.openedInstances.keys());
                let currentInstanceIndex = openedInstances.indexOf(instanceId);
                let newInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex-1]: openedInstances[currentInstanceIndex+1];

                let openedInstance = this.openedInstances.get(newInstanceId);
                nextLocation = `/instance/${openedInstance.viewMode}/${newInstanceId}`;
              } else {
                nextLocation = "/browse";
              }
            }
          }
          browseStore.refreshFilter();
          instanceTabStore.closeInstanceTab(instanceId);
          this.flush();
          if (nextLocation) {
            routerStore.history.push(nextLocation);
          }
        });
      } catch(e){
        runInAction(() => {
          const message = e.message?e.message:e;
          const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
          this.deleteInstanceError = `Failed to delete instance "${instanceId}" (${message}) ${errorMessage}`;
          this.isDeletingInstance = false;
        });
      }
    }
  }

  @action
  async duplicateInstance(fromInstanceId){
    let instanceToCopy = instanceStore.instances.get(fromInstanceId);
    let values = JSON.parse(JSON.stringify(instanceToCopy.initialValues));
    delete values.id;
    const labelField = instanceToCopy.data && instanceToCopy.data.ui_info && instanceToCopy.data.ui_info.labelField;
    if(labelField) {
      values[labelField] = (values[labelField]?(values[labelField] + " "):"") + "(Copy)";
    }
    this.isCreatingNewInstance = true;
    try{
      const { data } = await API.axios.post(API.endpoints.instance(), values);
      runInAction(() => {
        this.isCreatingNewInstance = false;
      });
      return data.data.id;
    } catch(e){
      runInAction(() => {
        this.isCreatingNewInstance = false;
        this.instanceCreationError = e.message;
      });
    }
  }

  @action
  async retryDeleteInstance() {
    return await this.deleteInstance(this.instanceToDelete);
  }

  @action
  cancelDeleteInstance() {
    this.instanceToDelete = null;
    this.deleteInstanceError = null;
  }

  replaceInstanceResolvedIdPath(path) {
    if (this.pathsToResolve.has(path)) {
      const newPath = this.pathsToResolve.get(path);
      this.pathsToResolve.delete(path);
      routerStore.history.replace(newPath);
      return true;
    }
    return false;
  }

  focusPreviousInstance(instanceId) {
    if (instanceId && matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" }) && matchPath(routerStore.history.location.pathname, { path: `/instance/:mode/${instanceId}`, exact: "true" })) {
      if (instanceTabStore.instanceTabs.size > 1) {
        let openedInstances = Array.from(instanceTabStore.instanceTabs.keys());
        let currentInstanceIndex = openedInstances.indexOf(instanceId);
        let newCurrentInstanceId = currentInstanceIndex === 0 ? openedInstances[openedInstances.length - 1] : openedInstances[currentInstanceIndex - 1];

        let openedInstance = instanceTabStore.instanceTabs.get(newCurrentInstanceId);
        routerStore.history.push(`/instance/${openedInstance.viewMode}/${newCurrentInstanceId}`);
      } else {
        routerStore.history.push("/browse");
      }
    } else {
      if (instanceTabStore.instanceTabs.size > 1) {
        const openedInstances = Array.from(instanceTabStore.instanceTabs.keys());
        const newCurrentInstanceId = openedInstances[openedInstances.length - 1];
        const openedInstance = instanceTabStore.instanceTabs.get(newCurrentInstanceId);
        routerStore.history.push(`/instance/${openedInstance.viewMode}/${newCurrentInstanceId}`);
      } else {
        routerStore.history.push("/browse");
      }
    }
  }

  focusNextInstance(instanceId) {
    if (instanceId && matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" }) && matchPath(routerStore.history.location.pathname, { path: `/instance/:mode/${instanceId}`, exact: "true" })) {
      if (instanceTabStore.instanceTabs.size > 1) {
        let openedInstances = Array.from(instanceTabStore.instanceTabs.keys());
        let currentInstanceIndex = openedInstances.indexOf(instanceId);
        let newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[0] : openedInstances[currentInstanceIndex + 1];

        let openedInstance = instanceTabStore.instanceTabs.get(newCurrentInstanceId);
        routerStore.history.push(`/instance/${openedInstance.viewMode}/${newCurrentInstanceId}`);
      } else {
        routerStore.history.push("/browse");
      }
    } else {
      if (instanceTabStore.instanceTabs.size > 1) {
        const openedInstances = Array.from(instanceTabStore.instanceTabs.keys());
        const newCurrentInstanceId = openedInstances[0];
        const openedInstance = instanceTabStore.instanceTabs.get(newCurrentInstanceId);
        routerStore.history.push(`/instance/${openedInstance.viewMode}/${newCurrentInstanceId}`);
      } else {
        routerStore.history.push("/browse");
      }
    }
  }

  @action
  setComparedInstance(instanceId){
    this.comparedInstanceId = instanceId;
  }

  @action
  setComparedWithReleasedVersionInstance(instanceId){
    this.comparedWithReleasedVersionInstance = instanceId;
  }

  goToDashboard = () => {
    routerStore.history.push("/");
  }

  logout = () => {
    if (!instanceStore.hasUnsavedChanges || confirm("You have unsaved changes pending. Are you sure you want to logout?")) {
      instanceStore.flushStoredInstanceTabs();
      authStore.logout();
      window.location.href = window.rootPath + "/";
    }
  }

  handleGlobalShortcuts = e => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.keyCode === 84) {
      this.toggleTheme();
    } else if (e.altKey && e.keyCode === 66) { // alt+b, browse
      routerStore.history.push("/browse");
    } else if (e.altKey && e.keyCode === 78) { // alt+n, new
      this.createInstance();
    } else if (e.altKey && e.keyCode === 68) { // alt+d, dashboard
      routerStore.history.push("/");
    } else if (e.keyCode === 112) { // F1, help
      routerStore.history.push("/help");
    } else if (e.altKey && e.keyCode === 87) { // alt+w, close
      if (e.shiftKey) { // alt+shift+w, close all
        this.closeAllInstances();
      } else {
        let matchInstanceTab = matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" });
        if (matchInstanceTab) {
          this.handleCloseInstance(matchInstanceTab.params.id);
        }
      }
    } else if (e.altKey && e.keyCode === 37) { // left arrow, previous
      let matchInstanceTab = matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" });
      this.focusPreviousInstance(matchInstanceTab && matchInstanceTab.params.id);
    } else if (e.altKey && e.keyCode === 39) { // right arrow, next
      let matchInstanceTab = matchPath(routerStore.history.location.pathname, { path: "/instance/:mode/:id*", exact: "true" });
      this.focusNextInstance(matchInstanceTab && matchInstanceTab.params.id);
    } else {
      kCode.step = kCode.ref[kCode.step] === e.keyCode ? kCode.step + 1 : 0;
      if (kCode.step === kCode.ref.length) {
        kCode.step = 0;
        this.setTheme("cupcake");
      }
    }
  }
}



export default new AppStore();