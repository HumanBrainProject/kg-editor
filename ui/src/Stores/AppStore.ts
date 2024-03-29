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
import { type Space, type Permissions,  ViewMode } from '../types';
import type { Instance } from './InstanceStore';
import type InstanceStore from './InstanceStore';
import type RootStore from './RootStore';
import type { View } from './ViewStore';
import type { SimpleType } from '../types';
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
  }, [] as string[]);
  return Array.from(new Set(result));
};

interface ExternalCreateModal {
  space: string;
  type: string;
  value: string;
  toSave?: number;
  saved?: number;
}

export interface EventType {
  [ViewMode.VIEW]: boolean,
  [ViewMode.EDIT]: boolean,
  [ViewMode.RELEASE]: boolean
}

interface HistorySettings {
  size: number,
  eventTypes: EventType
}
export class AppStore{
  commit?: string;
  globalError?: boolean;
  currentSpace?: Space;
  savePercentage?: number;
  _currentThemeName = DefaultTheme.name;
  historySettings?: HistorySettings;
  showSaveBar = false;
  externalCreateModal?: ExternalCreateModal;
  pathsToResolve = new Map();

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
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
      pathsToResolve: observable,
      currentSpaceName: computed,
      currentSpacePermissions: computed,
      flush: action,
      setGlobalError: action,
      dismissGlobalError: action,
      openInstance: action,
      focusPreviousInstance: action,
      focusNextInstance: action,
      closeAllInstances: action,
      closeInstance: action,
      saveInstance: action,
      setSizeHistorySetting: action,
      toggleViewedFlagHistorySetting: action,
      toggleEditedFlagHistorySetting: action,
      toggleReleasedFlagHistorySetting: action,
      setTheme: action,
      toggleTheme: action,
      createExternalInstance: action,
      updateExternalInstanceModal: action,
      clearExternalCreateModal: action,
      setCommit: action
    });

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
          [ViewMode.VIEW]: false,
          [ViewMode.EDIT]: true,
          [ViewMode.RELEASE]: false
        }
      };
    }
    this.historySettings = savedHistorySettings;
  }

  setCommit(commit: string) {
    this.commit = commit;
  }

  async createExternalInstance(space: string, typeName: string, value: string, location: Location, navigate: NavigateFunction) {
    if (this.rootStore.instanceStore.hasUnsavedChanges) {
      this.externalCreateModal = {space: space, type: typeName, value: value};
    } else {
      this.externalCreateModal = undefined;
      await this.switchSpace(location, navigate, space);
      const uuid = uuidv4();
      navigate(`/instances/${uuid}/create?space=${space}&type=${encodeURIComponent(typeName)}`);
    }
  }

  updateExternalInstanceModal(toSave:number|null=null) {
    if(this.externalCreateModal) {
      if (toSave !== null) {
        this.externalCreateModal.toSave = toSave;
        this.externalCreateModal.saved = 0;
      } else {
        if(this.externalCreateModal.saved !== undefined) {
          this.externalCreateModal.saved += 1;
        }
      }
      if(this.externalCreateModal.saved !== undefined && this.externalCreateModal.toSave !== undefined) {
        this.savePercentage = Math.round(this.externalCreateModal.saved/this.externalCreateModal.toSave*100);
      }
    }
  }

  clearExternalCreateModal() {
    this.externalCreateModal = undefined;
  }

  flush() {
    this.rootStore.instanceStore.flush();
    this.rootStore.statusStore.flush();
    this.showSaveBar = false;
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
        id: (path.params as unknown as {id: string}).id,
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
    this.rootStore.viewStore.unregisterAllViews();
  }

  clearViews(location: Location, navigate: NavigateFunction) {
    if (!(matchPath({ path: '/' }, location.pathname)
      || matchPath({ path: '/browse' }, location.pathname)
      || matchPath({ path: '/help/*' }, location.pathname))) {
      navigate('/browse');
    }
    this.rootStore.viewStore.clearViews();
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
      this.historySettings.eventTypes.view = on?true:false;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  toggleEditedFlagHistorySetting(on: boolean){
    if(this.historySettings) {
      this.historySettings.eventTypes.edit = on?true:false;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  toggleReleasedFlagHistorySetting(on: boolean) {
    if(this.historySettings) {
      this.historySettings.eventTypes.release = on?true:false;
      localStorage.setItem('historySettings', JSON.stringify(this.historySettings));
    }
  }

  setSpace = (spaceName: string) => {
    if (spaceName) {
      this.currentSpace = this.rootStore.userProfileStore.getSpace(spaceName);
      localStorage.setItem('space', spaceName);
    } else {
      this.currentSpace = undefined;
      localStorage.removeItem('space');
    }
  };

  async switchSpace(location: Location, navigate: NavigateFunction, spaceName: string) {
    const space = this.rootStore.userProfileStore.getSpaceOrDefault(spaceName);
    if(space && this.currentSpace !== space) {
      if(this.rootStore.instanceStore.hasUnsavedChanges) {
        if (window.confirm('You are about to change space. All unsaved changes will be lost. Continue ?')) {
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
      this.rootStore.instanceStore.flush();
      this.rootStore.browseStore.clearSelectedType();
      this.setSpace(space.id);
      const path = this.rootStore.viewStore.restoreViews();
      if (path) {
        navigate(path);
      }
      return true;
    }
  }

  openInstance(instanceId: string, instanceName: string, instancePrimaryType: SimpleType|undefined, viewMode: ViewMode = ViewMode.VIEW) {
    const instance = this.rootStore.instanceStore.instances.get(instanceId);
    const isFetched = instance && (instance.isLabelFetched || instance.isFetched);
    const name = isFetched?instance.name:instanceName;
    const primaryType = isFetched?instance.primaryType:instancePrimaryType;
    this.rootStore.viewStore.registerViewByInstanceId(instanceId, name, primaryType, viewMode);
    if(viewMode !== 'create') {
      this.rootStore.historyStore.updateInstanceHistory(instanceId, ViewMode.VIEW);
    }
    this.rootStore.viewStore.syncStoredViews();
  }

  closeInstance(location: Location, navigate: NavigateFunction, instanceId: string) {
    if (this.matchInstancePath(location.pathname, instanceId)) {
      if (this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex >= openedInstances.length - 1 ? openedInstances[currentInstanceIndex - 1] : openedInstances[currentInstanceIndex + 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId);
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance?.mode, openedInstance?.type);
      } else {
        navigate('/browse');
        this.rootStore.browseStore.clearSelectedInstance();
      }
    }
    this.rootStore.viewStore.unregisterViewByInstanceId(instanceId);
    if(this.rootStore.instanceStore) {
      const instance = this.rootStore.instanceStore.instances.get(instanceId);
      if (instance) {
        const instanceIdsToBeKept = getLinkedInstanceIds(this.rootStore.instanceStore, this.rootStore.viewStore.instancesIds);
        const instanceIdsToBeRemoved = instance.linkedIds.filter(id => !instanceIdsToBeKept.includes(id));
        this.rootStore.instanceStore.removeInstances(instanceIdsToBeRemoved);
      }
    }

  }

  async saveInstance(instance: Instance, navigate: NavigateFunction) {
    const isNew = instance.isNew;
    const id = instance.id;
    await instance.save();
    const newId = instance.id;
    if (!instance.hasSaveError) {
      if (isNew) {
        this.rootStore.browseStore.refreshFilter();
        runInAction(() => {
          const view = this.rootStore.viewStore.views.get(id);
          if(view) {
            if (newId !== id) {
              this.rootStore.viewStore.replaceViewByNewInstanceId(id, newId);
            } else {
              view.mode = ViewMode.EDIT;
            }
            this.pathsToResolve.set(`/instances/${id}/create`, `/instances/${newId}/edit`);
            this.replaceInstanceResolvedIdPath(`/instances/${id}/create`, navigate);
          }
        });
        this.rootStore.viewStore.syncStoredViews();
      }
    }
    this.rootStore.historyStore.updateInstanceHistory(instance.id, ViewMode.EDIT);
    this.rootStore.statusStore.flush();
  }

  syncInstancesHistory(instance: Instance, mode: ViewMode) {
    if(instance && this.rootStore.viewStore.views.has(instance.id)){
      this.rootStore.historyStore.updateInstanceHistory(instance.id, mode);
    }
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
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const currentInstanceIndex = openedInstances.indexOf(instanceId);
        const newCurrentInstanceId = currentInstanceIndex === 0 ? openedInstances[openedInstances.length - 1] : openedInstances[currentInstanceIndex - 1];

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId) as View;
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    } else {
      if (this.rootStore && this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[openedInstances.length - 1];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId) as View;
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

        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId) as View;
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    } else {
      if (this.rootStore && this.rootStore.viewStore && this.rootStore.viewStore.views.size > 1) {
        const openedInstances = this.rootStore.viewStore.instancesIds;
        const newCurrentInstanceId = openedInstances[0];
        const openedInstance = this.rootStore.viewStore.views.get(newCurrentInstanceId) as View;
        this.navigateToInstance(navigate, newCurrentInstanceId, openedInstance.mode, openedInstance.type);
      } else {
        navigate('/browse');
      }
    }
  }
}

export default AppStore;