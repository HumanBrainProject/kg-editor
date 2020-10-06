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

import { observable, action, runInAction } from "mobx";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";
import appStore from "./AppStore";
import { normalizeInstanceData, transformSummaryField } from "../Helpers/InstanceHelper";

const maxItems = 100;

class HistoryStore {
  @observable instancesHistory = [];
  @observable instances = [];
  @observable isFetching = false;
  @observable fetchError = null;

  constructor(){
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

  @action
  updateInstanceHistory(id, mode, remove) {
    if (!appStore.currentWorkspace) {
      return;
    }
    let index = -1;
    this.instancesHistory.some((instance, idx) => {
      if (instance.id === id && appStore.currentWorkspace && instance.workspace === appStore.currentWorkspace.id && instance.mode === mode) {
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
    if (!remove && appStore.currentWorkspace) {
      this.instancesHistory.unshift({id: id, workspace: appStore.currentWorkspace.id, mode: mode});
    }
    localStorage.setItem("instancesHistory", JSON.stringify(this.instancesHistory));
    return this.instancesHistory;
  }

  @action
  getFileredInstancesHistory(modes, max=10) {
    if (!appStore.currentWorkspace) {
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
        if (appStore.currentWorkspace && instance.workspace !== appStore.currentWorkspace.id) {
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

  @action
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
        const response = await API.axios.post(API.endpoints.instancesSummary(), list);
        runInAction(() => {
          list.forEach(identifier => {
            const data =  response && response.data && response.data.data && response.data.data[identifier];
            if(data){
              if (data.error && data.error.code && [401, 403, 404, 410].includes(data.error.code)) {
                // ignore those errors because instance id in localstorage may have been deleted or permissions may have changed
              } else if (data.error) {
                // TODO: check if we need to handle error
              } else {
                const instance = normalizeInstanceData(data, transformSummaryField);
                instance.formStore = new FormStore(instance);
                instance.formStore.toggleReadMode(true);
                this.instances.push(instance);
              }
            } else {
              // should never happen
              // TODO: check if we need to handle error
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
        appStore.captureSentryException(e);
      }
    }
  }

}

export default new HistoryStore();