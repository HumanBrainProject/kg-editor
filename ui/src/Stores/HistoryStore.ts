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

import { observable, action, runInAction, makeObservable } from 'mobx';

import Instance from './Instance';
import type RootStore from './RootStore';
import type { APIError } from '../Services/API';
import type API from '../Services/API';
import type { UUID, ViewMode } from '../types';

const maxItems = 100;

interface InstancesHistory {
  id: UUID;
  space: string;
  mode: ViewMode;
  color?: string;
  description?: string;
  name?: string;
  selected?: boolean;
}

export class HistoryStore {
  instancesHistory: InstancesHistory[] = [];
  instances: Instance[] = [];
  isFetching = false;
  fetchError?: string;

  api: API;
  rootStore: RootStore;

  constructor(api: API, rootStore: RootStore){
    makeObservable(this, {
      instancesHistory: observable,
      instances: observable,
      isFetching: observable,
      fetchError: observable,
      updateInstanceHistory: action,
      getFileredInstancesHistory: action,
      fetchInstances: action
    });

    this.api = api;
    this.rootStore = rootStore;
    const localStorageInstancesHistory = localStorage.getItem('instancesHistory');
    if (localStorageInstancesHistory) {
      try {
        this.instancesHistory = JSON.parse(localStorageInstancesHistory);
        if (!Array.isArray(this.instancesHistory)) {
          this.instancesHistory  = [];
        }
      } catch (e) {
        this.instancesHistory = [];
      }
    }
  }

  updateInstanceHistory(id: string, mode: ViewMode, remove?: boolean) {
    if (!this.rootStore.appStore.currentSpace) {
      return;
    }
    let index = -1;
    this.instancesHistory.some((instance, idx) => {
      if (instance.id === id && this.rootStore.appStore.currentSpace && instance.space === this.rootStore.appStore.currentSpace.id && instance.mode === mode) {
        index = idx;
        return true;
      }
      return false;
    });
    if (index !== -1) {
      this.instancesHistory.splice(index, 1);
    } else if (this.instancesHistory.length >= maxItems) {
      this.instancesHistory.pop();
    }
    if (!remove && this.rootStore.appStore.currentSpace) {
      this.instancesHistory.unshift({id: id, space: this.rootStore.appStore.currentSpace.id, mode: mode});
    }
    localStorage.setItem('instancesHistory', JSON.stringify(this.instancesHistory));
    return this.instancesHistory;
  }

  getFileredInstancesHistory(space: string | undefined, modes: string[], max=10) {
    if (!space) {
      return [];
    }
    if (!modes) {
      modes = [];
    } else if (!Array.isArray(modes)) {
      modes = [modes];
    }
    max = Number(max);
    const history = this.instancesHistory
      .filter(instance => {
        if (instance.space !== space) {
          return false;
        }
        if (!modes.length) {
          return true;
        }
        return modes.includes(instance.mode);
      })
      .reduce((result, instance) => {
        result.add(instance.id);
        return result;
      }, new Set<UUID>());
    return Array.from(history).slice(0, isNaN(max) || max < 0?0:max);
  }

  async fetchInstances(list: UUID[]) {
    if (!list.length) {
      this.instances = [];
      this.isFetching = false;
      this.fetchError = undefined;
    } else {
      try {
        this.instances = [];
        this.isFetching = true;
        this.fetchError = undefined;
        const { data:response } = await this.api.getInstancesSummary(undefined, list);
        runInAction(() => {
          list.forEach(identifier => {
            const data = response?.[identifier];
            if(data) {
              if (!data.error) {
                Object.values(data.fields).forEach(d => {
                  if(d.widget === 'TextArea') {
                    d.value = d.value && d.value.substring(0, 197) + '...';
                    delete d.label;
                  }
                });
                const instance = new Instance(identifier);
                instance.initializeData(this.api, this.rootStore, data);
                this.instances.push(instance);
              }
            }
          });
          this.isFetching = false;
        });
      } catch (e) {
        const err = e as APIError;
        runInAction(() => {
          this.fetchError = `Error while retrieving history instances (${err?.message})`;
          this.isFetching = false;
        });
      }
    }
  }

}

export default HistoryStore;