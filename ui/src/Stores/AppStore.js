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

import { observable, computed, action, runInAction, makeObservable } from "mobx";
import { matchPath } from "react-router-dom";
import _ from "lodash-uuid";

import DefaultTheme from "../Themes/Default";
import BrightTheme from "../Themes/Bright";
import CupcakeTheme from "../Themes/Cupcake";

const themes = {};
themes[DefaultTheme.name] = DefaultTheme;
themes[BrightTheme.name] = BrightTheme;
themes[CupcakeTheme.name] = CupcakeTheme;

const getLinkedInstanceIds = (instanceStore, instanceIds) => {
  const result = instanceIds.reduce((acc, id) => {
    const instance = instanceStore.instances.get(id);
    if (instance) {
      const linkedIds = instance.linkedIds;
      if(linkedIds) {
        acc.push(...linkedIds);
      }
    }
    return acc;
  }, []);
  return Array.from(new Set(result));
};

export class AppStore{
  globalError = null;
  currentSpace = null;
  savePercentage = null;
  _currentThemeName = DefaultTheme.name;
  historySettings = null;
  showSaveBar = false;
  externalCreateModal = false;
  instanceToDelete = null;
  isDeletingInstance = false;
  deleteInstanceError = null;
  isCreatingNewInstance = false;
  instanceCreationError = null;
  isMovingInstance = false;
  instanceMovingError = null;
  instanceToMove = null;
  pathsToResolve = new Map();

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore) {
    makeObservable(this, {
      externalCreateModal: observable,
      globalError: observable,
      currentSpace: observable,
      savePercentage: observable,
      switchSpace: action,
      setSpace: action,
      _currentThemeName: observable,
      currentTheme: computed,
      historySettings: observable,
      showSaveBar: observable,
      instanceToDelete: observable,
      isDeletingInstance: observable,
      deleteInstanceError: observable,
      isCreatingNewInstance: observable,
      instanceCreationError: observable,
      isMovingInstance: observable,
      instanceMovingError: observable,
      instanceToMove: observable,
      pathsToResolve: observable,
      currentSpaceName: computed,
      currentSpacePermissions: computed,
      delete: action,
      flush: action,
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
      setSizeHistorySetting: action,
      toggleViewedFlagHistorySetting: action,
      toggleEditedFlagHistorySetting: action,
      toggleReleasedFlagHistorySetting: action,
      setTheme: action,
      toggleTheme: action,
      createExternalInstance: action,
      updateExternalInstanceModal: action,
      clearExternalCreateModal: action,
      moveInstance: action,
      cancelMoveInstance: action
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;

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
          released: false
        }
      };
    }
    this.historySettings = savedHistorySettings;
  }

  async createExternalInstance(space, typeName, value, location, navigate) {
    if (this.rootStore.instanceStore.hasUnsavedChanges) {
      this.externalCreateModal = {space: space, type: typeName, value: value};
    } else {
      this.externalCreateModal = null;
      await this.switchSpace(location, navigate, space);
      const type = this.rootStore.typeStore.typesMap.get(typeName);
      const uuid = _.uuid();
      this.rootStore.instanceStore.createNewInstance(type, uuid, value);
      navigate(`/instances/${uuid}/create`);
    }
  }

  updateExternalInstanceModal(toSave=null) {
    if (toSave) {
      this.externalCreateModal.toSave = toSave;
      this.externalCreateModal.saved = 0;
    } else {
      this.externalCreateModal.saved += 1;
    }
    this.savePercentage = Math.round(this.externalCreateModal.saved/this.externalCreateModal.toSave*100);
  }

  clearExternalCreateModal() {
    this.externalCreateModal = null;
  }

  flush() {
    this.rootStore.instanceStore.flush();
    this.rootStore.statusStore.flush();
    this.showSaveBar = false;
    this.isCreatingNewInstance = false;
    this.instanceCreationError = null;
    this.instanceToMove = null;
    this.isMovingInstance = false;
    this.instanceMovingError = null;
    this.instanceToDelete = null;
    this.isDeletingInstance = false;
    this.deleteInstanceError = null;
    this.pathsToResolve.clear();
  }

  matchInstancePath = (pathname, id=":id") => { //NOSONAR
    let path =  matchPath({ path: `/instances/${id}/:mode` }, pathname);
    if(path) {
      return path;
    }
    path = matchPath({ path: `/instances/${id}` }, pathname);
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

  closeAllInstances(location, navigate) {
    this.rootStore.instanceStore.resetInstanceIdAvailability();
    if (!(matchPath({ path: "/" }, location.pathname)
      || matchPath({ path: "/browse" }, location.pathname)
      || matchPath({ path: "/help/*" }, location.pathname))) {
      navigate("/browse");
    }
    this.rootStore.viewStore.unregisterAllViews();
  }

  clearViews(location, navigate) {
    this.rootStore.instanceStore.resetInstanceIdAvailability();
    if (!(matchPath({ path: "/" }, location.pathname)
      || matchPath({ path: "/browse" }, location.pathname)
      || matchPath({ path: "/help/*" }, location.pathname))) {
        navigate("/browse");
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

  get currentSpaceName() {
    if (this.currentSpace) {
      return this.currentSpace.name || this.currentSpace.id;
    }
    return "";
  }

  get currentSpacePermissions() {
    return this.currentSpace?this.currentSpace.permissions:{};
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

  toggleReleasedFlagHistorySetting(on){
    this.historySettings.eventTypes.released = on?true:false;
    localStorage.setItem("historySettings", JSON.stringify(this.historySettings));
  }

  setSpace = spaceName => {
    if (spaceName) {
      this.currentSpace = this.rootStore.authStore.spaces.find( w => w.id === spaceName);
      localStorage.setItem("space", spaceName);
      this.rootStore.viewStore.restoreViews();
      this.rootStore.browseStore.clearInstances();
    } else {
      this.currentSpace = null;
      localStorage.removeItem("space");
    }
  }

  async switchSpace(location, navigate, selectedSpace) {
    let space = selectedSpace?this.rootStore.authStore.spaces.find( w => w.id === selectedSpace):null;
    if (!space && this.rootStore.authStore.hasSpaces && this.rootStore.authStore.spaces.length === 1) {
      space = this.rootStore.authStore.spaces[0];
    }
    if(this.currentSpace !== space) {
      if(this.rootStore.instanceStore.hasUnsavedChanges) {
        if (window.confirm("You are about to change space. All unsaved changes will be lost. Continue ?")) {
          this.rootStore.instanceStore.clearUnsavedChanges();
          this.clearViews(location, navigate);
          this.rootStore.browseStore.clearInstancesFilter();
        } else {
          return false;
        }
      } else {
        this.clearViews(location, navigate);
        this.rootStore.browseStore.clearInstancesFilter();
      }
      this.setSpace(space.id);
    }
  }

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

  closeInstance(location, navigate, instanceId) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex - 1] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          navigate(`/instances/${newCurrentInstanceId}`);
        } else {
          navigate(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        navigate("/browse");
        this.rootStore.browseStore.clearSelectedInstance();
      }
    }
    this.rootStore.viewStore.unregisterViewByInstanceId(instanceId);
    const instance = this.rootStore.instanceStore.instances.get(instanceId);
    if (instance) {
      const instanceIdsToBeKept = getLinkedInstanceIds(this.rootStore.instanceStore, this.rootStore.viewStore.instancesIds);
      const instanceIdsToBeRemoved = instance.linkedIds.filter(id => !instanceIdsToBeKept.includes(id));
      this.rootStore.instanceStore.removeInstances(instanceIdsToBeRemoved);
    }
  }

  async saveInstance(instance, navigate) {
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
            this.replaceInstanceResolvedIdPath(`/instances/${id}/create`, navigate);
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

  async delete(instanceId, location, navigate) {
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
          if(this.matchInstancePath(location.pathname, instanceId)){
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
            navigate(nextLocation);
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

  async duplicateInstance(fromInstanceId, navigate) {
    const instanceToCopy = this.rootStore.instanceStore.instances.get(fromInstanceId);
    const payload = instanceToCopy.payload;
    const labelField = instanceToCopy.labelField;
    if(labelField) {
      payload[labelField] = `${payload[labelField]} (Copy)`;
    }
    this.isCreatingNewInstance = true;
    try{
      const { data } = await this.transportLayer.createInstance(this.currentSpace.id, null, payload);
      runInAction(() => {
        this.isCreatingNewInstance = false;
      });
      const newId = data.data.id;
      const newInstance = this.rootStore.instanceStore.createInstanceOrGet(newId);
      newInstance.initializeData(this.transportLayer, this.rootStore, data.data);
      navigate(`/instances/${newId}/edit`);
    } catch(e){
      runInAction(() => {
        this.isCreatingNewInstance = false;
        this.instanceCreationError = e.message;
      });
    }
  }

  async moveInstance(instanceId, space, location, navigate) {
    this.instanceToMove = {
      id: instanceId,
      space: space
    };
    this.instanceMovingError = null;
    this.isMovingInstance = true;
    try{
      await this.transportLayer.moveInstance(instanceId, space);
      runInAction(() => {
        this.isMovingInstance = false;
        this.instanceToMove = null;
      });
      this.rootStore.browseStore.refreshFilter();
      this.rootStore.viewStore.unregisterViewByInstanceId(instanceId);
      this.flush();
      await this.switchSpace(location, navigate, space);
      navigate(`/instances/${instanceId}`);
    } catch(e){
      runInAction(() => {
        const message = e.message?e.message:e;
        const errorMessage = e.response && e.response.status !== 500 ? e.response.data:"";
        this.instanceMovingError = `Failed to move instance "${instanceId}" to space "${space}" (${message}) ${errorMessage}`;
        this.isMovingInstance = false;
      });
    }
  }

  async retryMoveInstance(location, navigate) {
    return this.moveInstance(this.instanceToMove.id, this.instanceToMove.space, location, navigate);
  }

  cancelMoveInstance() {
    this.instanceToMove = null;
    this.instanceMovingError = null;
  }

  async retryDeleteInstance(location, navigate) {
    return this.deleteInstance(this.instanceToDelete, location, navigate);
  }

  async deleteInstance(instanceId, location, navigate) {
    return this.delete(instanceId, location, navigate);
  }

  cancelDeleteInstance() {
    this.instanceToDelete = null;
    this.deleteInstanceError = null;
  }

  replaceInstanceResolvedIdPath(path, navigate) {
    if (this.pathsToResolve.has(path)) {
      const newPath = this.pathsToResolve.get(path);
      this.pathsToResolve.delete(path);
      navigate(newPath, {replace:true});
    }
  }

  focusPreviousInstance(instanceId, location, navigate) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore.viewStore.views.size > 1) {
        let openedInstances = this.rootStore.viewStore.instancesIds;
        let currentInstanceIndex = openedInstances.indexOf(instanceId);
        let newCurrentInstanceId = currentInstanceIndex === 0 ? openedInstances[openedInstances.length - 1] : openedInstances[currentInstanceIndex - 1];

        let openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          navigate(`/instances/${newCurrentInstanceId}`);
        } else {
          navigate(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        navigate("/browse");
      }
    } else {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[openedInstances.length - 1];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          navigate(`/instances/${newCurrentInstanceId}`);
        } else {
          navigate(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        navigate("/browse");
      }
    }
  }

  focusNextInstance(instanceId, location, navigate) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[0] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          navigate(`/instances/${newCurrentInstanceId}`);
        } else {
          navigate(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        navigate("/browse");
      }
    } else {
      if (this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[0];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        if(openedInstance.mode === "view"){
          navigate(`/instances/${newCurrentInstanceId}`);
        } else {
          navigate(`/instances/${newCurrentInstanceId}/${openedInstance.mode}`);
        }
      } else {
        navigate("/browse");
      }
    }
  }
}

export default AppStore;