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

import { observable, computed, action, runInAction, makeObservable } from 'mobx';
import { matchPath } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import BrightTheme from '../Themes/Bright';
import CupcakeTheme from '../Themes/Cupcake';
import DefaultTheme from '../Themes/Default';
import type InstanceStore from './InstanceStore';
import type RootStore from './RootStore';
import type API from '../Services/API';
import type { APIError } from '../Services/API';
import type { Space, Permissions, StructureOfType } from '../types';
import type { Location, NavigateFunction} from 'react-router-dom';

const themes = {
  [DefaultTheme.name]: DefaultTheme,
  [BrightTheme.name]: BrightTheme,
  [CupcakeTheme.name]: CupcakeTheme
};

const getLinkedInstanceIds = (instanceStore: InstanceStore, instanceIds: string []) => {
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

interface ExternalCreateModal {
  space: string;
  type: string;
  value: string;
  toSave?: boolean;
  saved?: number;
}

interface InstanceToMove {
  id: string;
  space: string;
}

interface HistorySettings {
  size: number,
  eventTypes: {
    viewed: boolean,
    edited: boolean,
    released: boolean
  }
}
export class AppStore{
  commit?: string;
  globalError?: boolean;
  currentSpace?: Space;
  savePercentage = null;
  _currentThemeName = DefaultTheme.name;
  historySettings?: HistorySettings;
  showSaveBar = false;
  externalCreateModal?: ExternalCreateModal;
  instanceToDelete?: string;
  isDeletingInstance = false;
  deleteInstanceError?: string;
  isCreatingNewInstance = false;
  instanceCreationError = null;
  isMovingInstance = false;
  instanceMovingError?: string;
  instanceToMove?: InstanceToMove;
  pathsToResolve = new Map();

  api: API;
  rootStore?: RootStore;

  constructor(api: API, rootStore: RootStore) {
    makeObservable(this, {
      commit: observable,
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
      cancelMoveInstance: action,
      setCommit: action
    });

    this.api = api;
    this.rootStore = rootStore;

    this.setTheme(localStorage.getItem('theme') as string);
    let savedHistorySettings = null;
    const localStorageHistorySettings = localStorage.getItem('historySettings');
    if (localStorageHistorySettings) {
      try {
        savedHistorySettings = JSON.parse(localStorageHistorySettings);
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

  setCommit(commit: string) {
    this.commit = commit;
  }

  async createExternalInstance(space: string, typeName: string, value: string, location: Location, navigate: NavigateFunction) {
    if (this.rootStore?.instanceStore.hasUnsavedChanges) {
      this.externalCreateModal = {space: space, type: typeName, value: value};
    } else {
      this.externalCreateModal = undefined;
      await this.switchSpace(location, navigate, space);
      const uuid = uuidv4();
      navigate(`/instances/${uuid}/create?space=${space}&type=${encodeURIComponent(typeName)}`);
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
    this.externalCreateModal = undefined;
  }

  flush() {
    this.rootStore?.instanceStore.flush();
    this.rootStore?.statusStore.flush();
    this.showSaveBar = false;
    this.isCreatingNewInstance = false;
    this.instanceCreationError = null;
    this.instanceToMove = undefined;
    this.isMovingInstance = false;
    this.instanceMovingError = undefined;
    this.instanceToDelete = undefined;
    this.isDeletingInstance = false;
    this.deleteInstanceError = undefined;
    this.pathsToResolve.clear();
  }

  matchInstancePath = (pathname: string, id=':id') => { //NOSONAR
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
        mode: 'view'
      }
    };
  };

  closeAllInstances(location: Location, navigate: NavigateFunction) {
    if (!(matchPath({ path: '/' }, location.pathname)
      || matchPath({ path: '/browse' }, location.pathname)
      || matchPath({ path: '/help/*' }, location.pathname))) {
      navigate('/browse');
    }
    this.rootStore?.viewStore.unregisterAllViews();
  }

  clearViews(location: Location, navigate: NavigateFunction) {
    if (!(matchPath({ path: '/' }, location.pathname)
      || matchPath({ path: '/browse' }, location.pathname)
      || matchPath({ path: '/help/*' }, location.pathname))) {
      navigate('/browse');
    }
    this.rootStore?.viewStore.clearViews();
  }

  setGlobalError() {
    this.globalError = true;
  }

  dismissGlobalError() {
    this.globalError = undefined;
  }

  get currentTheme() {
    return themes[this._currentThemeName];
  }

  setTheme(name: string){
    this._currentThemeName = themes[name]? name: DefaultTheme.name;
    localStorage.setItem('theme', this._currentThemeName);
  }

  toggleTheme(){
    if(this._currentThemeName === BrightTheme.name){
      this.setTheme(DefaultTheme.name);
    } else {
      this.setTheme(BrightTheme.name);
    }
  }

  navigateToInstance(navigate:NavigateFunction, instanceId: string, mode?: string, type?: string) {
    if(mode === 'view'){
      navigate(`/instances/${instanceId}`);
    } else if(mode === 'create'){
      if (type) {
        navigate(`/instances/${instanceId}/create?space=${this.currentSpaceName}&type=${encodeURIComponent(type)}`);
      }
      navigate(`/instances/${instanceId}/${mode}`);
    } else {
      navigate(`/instances/${instanceId}/${mode}`);
    }
  }


  get currentSpaceName() {
    if (this.currentSpace) {
      return this.currentSpace.name || this.currentSpace.id;
    }
    return '';
  }

  get currentSpacePermissions() {
    if (this.currentSpace) {
      return this.currentSpace.permissions;
    }

    return {
      canCreate: false,
      canInviteForReview: false,
      canDelete: false,
      canInviteForSuggestion: false,
      canRead: false,
      canSuggest: false,
      canWrite: false,
      canRelease: false
    } as Permissions;
  }

  setSizeHistorySetting(size: string){
    const sizeAsNumber = Number(size);
    if(this.historySettings) {
      this.historySettings.size = (!isNaN(sizeAsNumber) && sizeAsNumber > 0)?sizeAsNumber:10;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  toggleViewedFlagHistorySetting(on: boolean){
    if(this.historySettings) {
      this.historySettings.eventTypes.viewed = on?true:false;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  toggleEditedFlagHistorySetting(on: boolean){
    if(this.historySettings) {
      this.historySettings.eventTypes.edited = on?true:false;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  toggleReleasedFlagHistorySetting(on: boolean) {
    if(this.historySettings) {
      this.historySettings.eventTypes.released = on?true:false;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  setSpace = (spaceName: string) => {
    if (spaceName) {
      this.currentSpace = this.rootStore?.userProfileStore.getSpace(spaceName);
      localStorage.setItem('space', spaceName);
    } else {
      this.currentSpace = undefined;
      localStorage.removeItem('space');
    }
  };

  async switchSpace(location: Location, navigate: NavigateFunction, spaceName: string) {
    const space = this.rootStore?.userProfileStore.getSpaceOrDefault(spaceName);
    if(space && this.currentSpace !== space) {
      if(this.rootStore?.instanceStore.hasUnsavedChanges) {
        if (window.confirm('You are about to change space. All unsaved changes will be lost. Continue ?')) {
          this.rootStore.instanceStore.clearUnsavedChanges();
          this.clearViews(location, navigate);
          this.rootStore.browseStore.clearInstancesFilter();
        } else {
          return false;
        }
      } else {
        this.clearViews(location, navigate);
        this.rootStore?.browseStore.clearInstancesFilter();
      }
      this.rootStore?.instanceStore.flush();
      this.rootStore?.browseStore.clearInstances();
      this.setSpace(space.id);
      const path = this.rootStore?.viewStore.restoreViews();
      if (path) {
        navigate(path);
      }
    }
  }

  openInstance(instanceId: string, instanceName: string, instancePrimaryType: StructureOfType|undefined, viewMode = 'view') {
    const instance = this.rootStore?.instanceStore.instances.get(instanceId);
    const isFetched = instance && (instance.isLabelFetched || instance.isFetched);
    const name = isFetched?instance.name:instanceName;
    const primaryType = isFetched?instance.primaryType:instancePrimaryType;
    this.rootStore?.viewStore.registerViewByInstanceId(instanceId, name, primaryType, viewMode);
    if(viewMode !== 'create') {
      this.rootStore?.historyStore.updateInstanceHistory(instanceId, 'viewed');
    }
    this.rootStore?.viewStore.syncStoredViews();
  }

  closeInstance(location: Location, navigate: NavigateFunction, instanceId: string) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore?.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex - 1] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance?.mode, openedInstance?.type);
      } else {
        navigate('/browse');
        this.rootStore?.browseStore.clearSelectedInstance();
      }
    }
    this.rootStore?.viewStore.unregisterViewByInstanceId(instanceId);
    const instance = this.rootStore?.instanceStore.instances.get(instanceId);
    if (instance) {
      const instanceIdsToBeKept = getLinkedInstanceIds(this.rootStore?.instanceStore, this.rootStore?.viewStore.instancesIds);
      const instanceIdsToBeRemoved = instance.linkedIds.filter(id => !instanceIdsToBeKept.includes(id));
      this.rootStore?.instanceStore.removeInstances(instanceIdsToBeRemoved);
    }
  }

  async saveInstance(instance, navigate: NavigateFunction) {
    const isNew = instance.isNew;
    const id = instance.id;
    await instance.save();
    const newId = instance.id;
    if (!instance.hasSaveError) {
      if (isNew) {
        runInAction(() => {
          const view = this.rootStore?.viewStore.views.get(id);
          if(view) {
            if (newId !== id) {
              this.rootStore?.viewStore.replaceViewByNewInstanceId(id, newId);
            } else {
              view.mode = 'edit';
            }
            this.pathsToResolve.set(`/instances/${id}/create`, `/instances/${newId}/edit`);
            this.replaceInstanceResolvedIdPath(`/instances/${id}/create`, navigate);
          }
        });
        this.rootStore?.viewStore.syncStoredViews();
      }
    }
    this.rootStore?.historyStore.updateInstanceHistory(instance.id, 'edited');
    this.rootStore?.statusStore.flush();
  }

  syncInstancesHistory(instance, mode: string) {
    if(instance && this.rootStore?.viewStore.views.has(instance.id)){
      this.rootStore.historyStore.updateInstanceHistory(instance.id, mode);
    }
  }

  async delete(instanceId: string, location: Location, navigate: NavigateFunction) {
    if (instanceId) {
      this.instanceToDelete = instanceId;
      this.isDeletingInstance = true;
      this.deleteInstanceError = undefined;
      try{
        await this.api.deleteInstance(instanceId);
        runInAction(() => {
          this.instanceToDelete = undefined;
          this.isDeletingInstance = false;
          let nextLocation = null;
          if(this.matchInstancePath(location.pathname, instanceId)){
            const ids = this.rootStore?.viewStore.instancesIds;
            if(ids && ids.length > 1){
              const currentInstanceIndex = ids.indexOf(instanceId);
              const newInstanceId = currentInstanceIndex >= ids.length - 1 ? ids[currentInstanceIndex-1]: ids[currentInstanceIndex+1];
              const view = this.rootStore?.viewStore.views.get(newInstanceId);
              nextLocation = `/instances/${newInstanceId}/${view.mode}`;
            } else {
              nextLocation = '/browse';
            }
          }
          this.rootStore?.browseStore.refreshFilter();
          this.rootStore?.viewStore.unregisterViewByInstanceId(instanceId);
          this.flush();
          if (nextLocation) {
            navigate(nextLocation);
          }
        });
      } catch(e){
        const err = e as APIError;
        runInAction(() => {
          const errorMessage = err.response && err.response.status !== 500 ? err.response.data:'';
          this.deleteInstanceError = `Failed to delete instance "${instanceId}" (${err?.message}) ${errorMessage}`;
          this.isDeletingInstance = false;
        });
      }
    }
  }

  async duplicateInstance(fromInstanceId: string, navigate: NavigateFunction) {
    const instanceToCopy = this.rootStore?.instanceStore.instances.get(fromInstanceId);
    const payload = instanceToCopy.payload;
    const labelField = instanceToCopy.labelField;
    if(labelField) {
      payload[labelField] = `${payload[labelField]} (Copy)`;
    }
    this.isCreatingNewInstance = true;
    try{
      const { data } = await this.api.createInstance(this.currentSpace?.id, null, payload);
      runInAction(() => {
        this.isCreatingNewInstance = false;
      });
      const newId = data?.id;
      if(newId) {
        const newInstance = this.rootStore?.instanceStore.createInstanceOrGet(newId);
        newInstance.initializeData(this.api, this.rootStore, data);
        navigate(`/instances/${newId}/edit`);
      }
    } catch(e){
      runInAction(() => {
        this.isCreatingNewInstance = false;
        this.instanceCreationError = e.message;
      });
    }
  }

  async moveInstance(instanceId: string, space: string, location: Location, navigate: NavigateFunction) {
    this.instanceToMove = {
      id: instanceId,
      space: space
    };
    this.instanceMovingError = undefined;
    this.isMovingInstance = true;
    try{
      await this.api.moveInstance(instanceId, space);
      runInAction(() => {
        this.isMovingInstance = false;
        this.instanceToMove = undefined;
      });
      this.rootStore?.browseStore.refreshFilter();
      this.rootStore?.viewStore.unregisterViewByInstanceId(instanceId);
      this.flush();
      await this.switchSpace(location, navigate, space);
      navigate(`/instances/${instanceId}`);
    } catch(e){
      const err = e as APIError;
      runInAction(() => {
        const message = err.message?err.message:err;
        const errorMessage = err.response && err.response.status !== 500 ? err.response.data:'';
        this.instanceMovingError = `Failed to move instance "${instanceId}" to space "${space}" (${message}) ${errorMessage}`;
        this.isMovingInstance = false;
      });
    }
  }

  async retryMoveInstance(location: Location, navigate: NavigateFunction) {
    return this.moveInstance(this.instanceToMove?.id, this.instanceToMove?.space, location, navigate);
  }

  cancelMoveInstance() {
    this.instanceToMove = undefined;
    this.instanceMovingError = undefined;
  }

  async retryDeleteInstance(location: Location, navigate: NavigateFunction) {
    return this.deleteInstance(this.instanceToDelete, location, navigate);
  }

  async deleteInstance(instanceId: string, location: Location, navigate: NavigateFunction) {
    return this.delete(instanceId, location, navigate);
  }

  cancelDeleteInstance() {
    this.instanceToDelete = undefined;
    this.deleteInstanceError = undefined;
  }

  replaceInstanceResolvedIdPath(path: string, navigate: NavigateFunction) {
    if (this.pathsToResolve.has(path)) {
      const newPath = this.pathsToResolve.get(path);
      this.pathsToResolve.delete(path);
      navigate(newPath, {replace:true});
    }
  }

  focusPreviousInstance(instanceId: string, location: Location, navigate: NavigateFunction) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore && this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore?.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances?.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex === 0 ? openedInstances[openedInstances.length - 1] : openedInstances[currentInstanceIndex - 1];

        const openedInstance = this.rootStore?.viewStore.views.get(newCurrentInstanceId);
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    } else {
      if (this.rootStore && this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[openedInstances.length - 1];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    }
  }

  focusNextInstance(instanceId: string, location: Location, navigate: NavigateFunction) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore && this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[0] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    } else {
      if (this.rootStore && this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[0];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    }
  }
}

export default AppStore;