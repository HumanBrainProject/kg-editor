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

import { observable, action, runInAction, makeObservable } from "mobx";

import Instance from "./Instance";

const maxItems = 100;

export class HistoryStore {
  instancesHistory = [];
  instances = [];
  isFetching = false;
  fetchError = null;

  api = null;
  rootStore = null;

  constructor(api, rootStore){
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

    if (localStorage.getItem("instancesHistory")) {
      try {
        this.instancesHistory = JSON.parse(localStorage.getItem("instancesHistory"));
        if (!(this.instancesHistory instanceof Array)) {
          this.instancesHistory  = [];
        }
      } catch (e) {
        this.instancesHistory = [];
      }
    }
  }

  updateInstanceHistory(id, mode, remove) {
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
    localStorage.setItem("instancesHistory", JSON.stringify(this.instancesHistory));
    return this.instancesHistory;
  }

  getFileredInstancesHistory(space, modes, max=10) {
    if (!space) {
      return [];
    }
    if (!modes) {
      modes = [];
    } else if (!Array.isArray(modes)) {
      modes = [modes];
    }
    max = Number(max);
    return this.instancesHistory
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
        if (!result.map[instance.id]) {
          result.map[instance.id] = true;
          result.history.push(instance.id);
        }
        return result;
      }, {map: {}, history: []}).history
      .slice(0, isNaN(max) || max < 0?0:max);
  }

  async fetchInstances(list) {
    if (!list.length) {
      this.instances = [];
      this.isFetching = false;
      this.fetchError = null;
    } else {
      try {
        this.instances = [];
        this.isFetching = true;
        this.fetchError = null;
        const { data:response } = await this.api.getInstancesSummary(null, list);
        runInAction(() => {
          list.forEach(identifier => {
            const data = response?.[identifier];
            if(data) {
              if (!data.error) {
                Object.values(data.fields).forEach(d => {
                  if(d.widget === "TextArea") {
                    d.value = d.value && d.value.substr(0, 197) + "...";
                    delete d.label;
                  }
                });
                const instance = new Instance(identifier);
                instance.initializeData(this.api, this.rootStore, data);
                this.instances.push(instance);
              }
              // else {
              //   if(data.error.code && [401, 403, 404, 410].includes(data.error.code)) {
              //     //TO DO: ignore those errors because instance id in localstorage may have been deleted or permissions may have changed
              //   } else {
              //     //TO DO: set error message to the instance
              //   }
              // }
            }
          });
          this.isFetching = false;
        });
      } catch (e) {
        runInAction(() => {
          const message = e.message?e.message:e;
          this.fetchError = `Error while retrieving history instances (${message})`;
          this.isFetching = false;
        });
      }
    }
  }

}

export default HistoryStore;