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

import API from "../Services/API";
import appStore from "./AppStore";

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
    let [,,nodeType,,] = (typeof id === "string")?id.split("/"):[null, null, null, null, null];
    if (!nodeType) {
      return this.instancesHistory;
    }
    nodeType = nodeType.toLowerCase();
    let index = -1;
    this.instancesHistory.some((instance, idx) => {
      if (instance.id === id && instance.mode === mode) {
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
    if (!remove) {
      this.instancesHistory.unshift({id: id, type: nodeType, mode: mode});
    }
    localStorage.setItem("instancesHistory", JSON.stringify(this.instancesHistory));
    return this.instancesHistory;
  }

  @action
  getFileredInstancesHistory(nodeType, modes, max=10) {

    if (typeof nodeType === "string") {
      nodeType = nodeType.toLowerCase().trim();
      if (nodeType === "") {
        nodeType = null;
      }
    }
    if (!modes) {
      modes = [];
    } else if (!Array.isArray(modes)) {
      modes = [modes];
    }
    max = Number(max);
    return this.instancesHistory
      .filter(instance => {
        if (typeof nodeType === "string" && instance.type !== nodeType) {
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
        const { data } = await API.axios.post(API.endpoints.listedInstances(), list);
        runInAction(() => {
          this.isFetching = false;
          this.instances = (data && data.data)?data.data:[];
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