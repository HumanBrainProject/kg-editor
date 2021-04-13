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

import { observable, computed, action, runInAction, makeObservable } from "mobx";
import { matchPath } from "react-router-dom";

import DefaultTheme from "../Themes/Default";
import BrightTheme from "../Themes/Bright";
import CupcakeTheme from "../Themes/Cupcake";

const themes = {};
themes[DefaultTheme.name] = DefaultTheme;
themes[BrightTheme.name] = BrightTheme;
themes[CupcakeTheme.name] = CupcakeTheme;

const getLinkedInstanceIds = (instanceStore, instanceIds) => {
  //window.console.log("list: ", instanceIds);
  const result = instanceIds.reduce((acc, id) => {
    const instance = instanceStore.instances.get(id);
    if (instance) {
      const linkedIds = instance.linkedIds;
      //window.console.log(id, linkedIds);
      acc.push(...linkedIds);
    }
    return acc;
  }, []);
  return Array.from(new Set(result));
};

export class AppStore{
  globalError = null;
  currentWorkspace = null;
  initializingMessage = null;
  initializationError = null;
  initialInstanceError = null;
  initialInstanceWorkspaceError = null;
  isInitialized = false;
  canLogin = true;
  _currentThemeName = DefaultTheme.name;
  historySettings = null;
  showSaveBar = false;
  instanceToDelete = null;
  isDeletingInstance = false;
  deleteInstanceError = null;
  isCreatingNewInstance = false;
  instanceCreationError = null;
  pathsToResolve = new Map();

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore) {
    makeObservable(this, {
      globalError: observable,
      currentWorkspace: observable,
      setCurrentWorkspace: action,
      initializingMessage: observable,
      initializationError: observable,
      initialInstanceError: observable,
      initialInstanceWorkspaceError: observable,
      isInitialized: observable,
      canLogin: observable,
      _currentThemeName: observable,
      currentTheme: computed,
      historySettings: observable,
      showSaveBar: observable,
      instanceToDelete: observable,
      isDeletingInstance: observable,
      deleteInstanceError: observable,
      isCreatingNewInstance: observable,
      instanceCreationError: observable,
      pathsToResolve: observable,
      currentWorkspaceName: computed,
      currentWorkspacePermissions: computed,
      delete: action,
      initialize: action,
      flush: action,
      initializeWorkspace: action,
      getInitialInstanceWorkspace: action,
      cancelInitialInstance: action,
      setGlobalError: action,
      dismissGlobalError: action,
      toggleSavebarDisplay: action,
      openInstance: action,
      focusPreviousInstance: action,
      focusNextInstance: action,
      closeAllInstances: action,
      closeInstance: action,
      saveInstance: action,
      deleteInstance: action,
      duplicateInstance: action,
      retryDeleteInstance: action,
      cancelDeleteInstance: action,
      login: action,
      setSizeHistorySetting: action,
      toggleViewedFlagHistorySetting: action,
      toggleEditedFlagHistorySetting: action,
      toggleBookmarkedFlagHistorySetting: action,
      toggleReleasedFlagHistorySetting: action,
      setTheme: action,
      toggleTheme: action,
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;

    this.canLogin = !matchPath(this.rootStore.history.location.pathname, { path: "/logout", exact: "true" });
    this.setTheme(localStorage.getItem("theme"));
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
    if (this.canLogin && !this.isInitialized) {
      this.initializingMessage = "Initializing the application...";
      this.initializationError = null;
      this.initialInstanceError = null;
      this.initialInstanceWorkspaceError = null;
      if(!this.rootStore.authStore.isAuthenticated) {
        this.initializingMessage = "User authenticating...";
        await this.rootStore.authStore.authenticate();
        if (this.rootStore.authStore.authError) {
          runInAction(() => {
            this.initializationError = this.rootStore.authStore.authError;
            this.initializingMessage = null;
          });
        }
      }
      if(this.rootStore.authStore.isAuthenticated && !this.rootStore.authStore.hasUserProfile) {
        runInAction(() => {
          this.initializingMessage = "Retrieving user profile...";
        });
        await this.rootStore.authStore.retrieveUserProfile();
        runInAction(() => {
          if (this.rootStore.authStore.userProfileError) {
            this.initializationError = this.rootStore.authStore.userProfileError;
            this.initializingMessage = null;
          } else if (!this.rootStore.authStore.isUserAuthorized && !this.rootStore.authStore.isRetrievingUserProfile) {
            this.isInitialized = true;
            this.initializingMessage = null;
          }
        });
      }
      if(this.rootStore.authStore.isAuthenticated && this.rootStore.authStore.isUserAuthorized) {
        await this.initializeWorkspace();
        runInAction(() => {
          this.initializingMessage = null;
          this.isInitialized = !!this.currentWorkspace || (!this.initialInstanceError && !this.initialInstanceWorkspaceError) ;
        });
      }
    }
  }

  flush() {
    this.rootStore.instanceStore.flush();
    this.rootStore.statusStore.flush();
    this.showSaveBar = false;
    this.isCreatingNewInstance = false;
    this.instanceCreationError = null;
    this.instanceToDelete = null;
    this.isDeletingInstance = false;
    this.deleteInstanceError = null;
    this.pathsToResolve.clear();
  }

  matchInstancePath = (id=":id") => {
    let path =  matchPath(this.rootStore.history.location.pathname, { path: `/instances/${id}/:mode`, exact: "true" });
    if(path) {
      return path;
    }
    path = matchPath(this.rootStore.history.location.pathname, { path: `/instances/${id}`, exact: "true" });
    if(!path) {
      return null;
    }
    return {
      params: {
        id: path.params.id,
        mode: "view"
      }
    };
  }

  async initializeWorkspace() {
    let workspace = null;
    this.initializingMessage = "Setting workspace...";
    const path = this.matchInstancePath();
    if (path && path.params.mode !== "create") {
      workspace = await this.getInitialInstanceWorkspace(path.params.id);
      if (workspace) {
        this.setCurrentWorkspace(workspace);
        if (!this.currentWorkspace || this.currentWorkspace.id !== workspace) {
          this.initialInstanceWorkspaceError = `Could not load instance "${path.params.id}" because you're not granted access to workspace "${workspace}".`;
        }
      }
      return this.currentWorkspace;
    } else {
      workspace = localStorage.getItem("workspace");
      this.setCurrentWorkspace(workspace);
      return this.currentWorkspace;
    }
  }

  async getInitialInstanceWorkspace(instanceId) {
    this.initializingMessage = `Retrieving instance "${instanceId}"...`;
    try{
      const response = await this.transportLayer.getInstance(instanceId);
      const data = response.data && response.data.data;
      if(data){
        const instance = this.rootStore.instanceStore.createInstanceOrGet(instanceId);
        if (!this.rootStore.typeStore.isFetched) {
          instance.initializeRawData(data);
        } else {
          instance.initializeData(this.transportLayer, this.rootStore, data);
        }
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

  cancelInitialInstance() {
    this.rootStore.history.replace("/browse");
    this.initializationError = null;
    this.initialInstanceError = null;
    this.initialInstanceWorkspaceError = null;
    this.initializingMessage = null;
    const workspace = localStorage.getItem("workspace");
    this.setCurrentWorkspace(workspace);
    this.isInitialized = true;
  }

  closeAllInstances() {
    this.rootStore.instanceStore.resetInstanceIdAvailability();
    if (!(matchPath(this.rootStore.history.location.pathname, { path: "/", exact: "true" })
      || matchPath(this.rootStore.history.location.pathname, { path: "/browse", exact: "true" })
      || matchPath(this.rootStore.history.location.pathname, { path: "/help/*", exact: "true" }))) {
      this.rootStore.history.push("/browse");
    }
    this.rootStore.viewStore.unregisterAllViews();
  }

  clearViews() {
    this.rootStore.instanceStore.resetInstanceIdAvailability();
    if (!(matchPath(this.rootStore.history.location.pathname, { path: "/", exact: "true" })
      || matchPath(this.rootStore.history.location.pathname, { path: "/browse", exact: "true" })
      || matchPath(this.rootStore.history.location.pathname, { path: "/help/*", exact: "true" }))) {
      this.rootStore.history.push("/browse");
    }
    this.rootStore.viewStore.clearViews();
  }

  setGlobalError(error, info) {
    this.globalError = {error, info};
  }

  dismissGlobalError() {
    this.globalError = null;
  }

  get currentTheme() {
    return themes[this._currentThemeName];
  }

  setTheme(name){
    this._currentThemeName = themes[name]? name: DefaultTheme.name;
    localStorage.setItem("theme", this._currentThemeName);
  }

  toggleTheme(){
    if(this._currentThemeName === BrightTheme.name){
      this.setTheme(DefaultTheme.name);
    } else {
      this.setTheme(BrightTheme.name);
    }
  }

  get currentWorkspaceName() {
    if (this.currentWorkspace) {
      return this.currentWorkspace.name || this.currentWorkspace.id;
    }
    return "";
  }

  get currentWorkspacePermissions() {
    return this.currentWorkspace?this.currentWorkspace.permissions:{};
  }

  setSizeHistorySetting(size){
    size = Number(size);
    this.historySettings.size = (!isNaN(size) && size > 0)?size:10;
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

  setCurrentWorkspace = space => {
    let workspace = space?this.rootStore.authStore.workspaces.find( w => w.id === space):null;
    if (!workspace && this.rootStore.authStore.hasWorkspaces && this.rootStore.authStore.workspaces.length === 1) {
      workspace = this.rootStore.authStore.workspaces[0];
    }
    if(this.currentWorkspace !== workspace) {
      if(this.rootStore.instanceStore.hasUnsavedChanges) {
        if (window.confirm("You are about to change workspace. All unsaved changes will be lost. Continue ?")) {
          this.rootStore.instanceStore.clearUnsavedChanges();
          this.clearViews();
          this.rootStore.browseStore.clearInstancesFilter();
        } else {
          return false;
        }
      } else if(this.rootStore.viewStore.views.size > 0) {
        this.clearViews();
        this.rootStore.browseStore.clearInstancesFilter();
      }
      this.currentWorkspace = workspace;
      if (this.currentWorkspace) {
        localStorage.setItem("workspace", workspace.id);
        this.rootStore.viewStore.restoreViews();
        this.rootStore.typeStore.fetch(true);
        this.rootStore.browseStore.clearInstances();
      } else {
        localStorage.removeItem("workspace");
      }
    }
  };

  toggleSavebarDisplay = state => {
    this.showSaveBar = state !== undefined? !!state: !this.showSaveBar;
  }

  openInstance(instanceId, instanceName, instancePrimaryType, viewMode = "view") {
    const instance = this.rootStore.instanceStore.instances.get(instanceId);
    const isFetched = instance && (instance.isLabelFetched || instance.isFetched);
    const name = isFetched?instance.name:instanceName;
    const primaryType = isFetched?instance.primaryType:instancePrimaryType;
    this.rootStore.viewStore.registerViewByInstanceId(instanceId, name, primaryType, viewMode);
    if(viewMode !== "create") {
      this.rootStore.historyStore.updateInstanceHistory(instanceId, "viewed");
    }
    this.rootStore.viewStore.syncStoredViews();
  }

  getReadMode() {
    const path = this.matchInstancePath();
    return !(path && (path.params.mode === "edit" || path.params.mode === "create"));
  }

  closeInstance(instanceId) {
    if (this.matchInstancePath(instanceId)) {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex - 1] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}`);
        } else {
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        this.rootStore.history.push("/browse");
        this.rootStore.browseStore.clearSelectedInstance();
      }
    }
    this.rootStore.instanceStore.instanceIdAvailability.delete(instanceId);
    this.rootStore.viewStore.unregisterViewByInstanceId(instanceId);
    const instance = this.rootStore.instanceStore.instances.get(instanceId);
    if (instance) {
      const instanceIdsToBeKept = getLinkedInstanceIds(this.rootStore.instanceStore, this.rootStore.viewStore.instancesIds);
      const instanceIdsToBeRemoved = instance.linkedIds.filter(id => !instanceIdsToBeKept.includes(id));
      this.rootStore.instanceStore.removeInstances(instanceIdsToBeRemoved);
    }
  }

  async saveInstance(instance) {
    const isNew = instance.isNew;
    const id = instance.id;
    await instance.save();
    const newId = instance.id;
    if (!instance.hasSaveError) {
      if (isNew) {
        runInAction(() => {
          const view = this.rootStore.viewStore.views.get(id);
          if(view) {
            if (newId !== id) {
              this.rootStore.viewStore.replaceViewByNewInstanceId(id, newId);
            } else {
              view.mode = "edit";
            }
            this.pathsToResolve.set(`/instances/${id}/create`, `/instances/${newId}/edit`);
            this.replaceInstanceResolvedIdPath(`/instances/${id}/create`);
          }
        });
        this.rootStore.viewStore.syncStoredViews();
      }
    }
    this.rootStore.historyStore.updateInstanceHistory(instance.id, "edited");
    this.rootStore.statusStore.flush();
  }

  syncInstancesHistory(instance, mode) {
    if(instance && this.rootStore.viewStore.views.has(instance.id)){
      this.rootStore.historyStore.updateInstanceHistory(instance.id, mode);
    }
  }

  async delete(instanceId) {
    if (instanceId) {
      this.instanceToDelete = instanceId;
      this.isDeletingInstance = true;
      this.deleteInstanceError = null;
      try{
        await this.transportLayer.deleteInstance(instanceId);
        runInAction(() => {
          this.instanceToDelete = null;
          this.isDeletingInstance = false;
          let nextLocation = null;
          if(this.matchInstancePath(instanceId)){
            const ids = this.rootStore.viewStore.instancesIds;
            if(ids.length > 1){
              const currentInstanceIndex = ids.indexOf(instanceId);
              const newInstanceId = currentInstanceIndex >= ids.length - 1 ? ids[currentInstanceIndex-1]: ids[currentInstanceIndex+1];
              const view = this.rootStore.viewStore.views.get(newInstanceId);
              nextLocation = `/instances/${newInstanceId}/${view.mode}`;
            } else {
              nextLocation = "/browse";
            }
          }
          this.rootStore.browseStore.refreshFilter();
          this.rootStore.viewStore.unregisterViewByInstanceId(instanceId);
          this.flush();
          if (nextLocation) {
            this.rootStore.history.push(nextLocation);
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

  async duplicateInstance(fromInstanceId) {
    const instanceToCopy = this.rootStore.instanceStore.instances.get(fromInstanceId);
    const payload = instanceToCopy.payload;
    const labelField = instanceToCopy.labelField;
    if(labelField) {
      payload[labelField] = `${payload[labelField]} (Copy)`;
    }
    this.isCreatingNewInstance = true;
    try{
      const { data } = await this.transportLayer.createInstance(this.currentWorkspace.id, null, payload);
      runInAction(() => {
        this.isCreatingNewInstance = false;
      });
      const newId = data.data.id;
      const newInstance = this.rootStore.instanceStore.createInstanceOrGet(newId);
      newInstance.initializeData(this.transportLayer, this.rootStore, data.data);
      this.rootStore.history.push(`/instances/${newId}/edit`);
    } catch(e){
      runInAction(() => {
        this.isCreatingNewInstance = false;
        this.instanceCreationError = e.message;
      });
    }
  }

  async retryDeleteInstance() {
    return await this.deleteInstance(this.instanceToDelete);
  }

  async deleteInstance(instanceId) {
    return await this.delete(instanceId);
  }

  cancelDeleteInstance() {
    this.instanceToDelete = null;
    this.deleteInstanceError = null;
  }

  replaceInstanceResolvedIdPath(path) {
    if (this.pathsToResolve.has(path)) {
      const newPath = this.pathsToResolve.get(path);
      this.pathsToResolve.delete(path);
      this.rootStore.history.replace(newPath);
    }
  }

  focusPreviousInstance(instanceId) {
    if (this.matchInstancePath(instanceId)) {
      if (this.rootStore.viewStore.views.size > 1) {
        let openedInstances = this.rootStore.viewStore.instancesIds;
        let currentInstanceIndex = openedInstances.indexOf(instanceId);
        let newCurrentInstanceId = currentInstanceIndex === 0 ? openedInstances[openedInstances.length - 1] : openedInstances[currentInstanceIndex - 1];

        let openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}`);
        } else {
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        this.rootStore.history.push("/browse");
      }
    } else {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[openedInstances.length - 1];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}`);
        } else {
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        this.rootStore.history.push("/browse");
      }
    }
  }

  focusNextInstance(instanceId) {
    if (this.matchInstancePath(instanceId)) {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[0] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}`);
        } else {
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        this.rootStore.history.push("/browse");
      }
    } else {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[0];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}`);
        } else {
          this.rootStore.history.push(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        this.rootStore.history.push("/browse");
      }
    }
  }

  goToDashboard = () => this.rootStore.history.push("/");

  login = () => {
    if (this.canLogin) {
      this.rootStore.authStore.login();
    } else {
      this.rootStore.history.replace("/");
      this.canLogin = true;
      this.initialize(true);
    }
  };

  logout = () => {
    if (!this.rootStore.instanceStore.hasUnsavedChanges || confirm("You have unsaved changes pending. Are you sure you want to logout?")) {
      this.rootStore.viewStore.flushStoredViews();
      this.rootStore.authStore.logout();
    }
  }
}

export default AppStore;