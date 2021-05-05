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

import { observable, action, runInAction } from "mobx";
import { isArray, debounce } from "lodash";
import API from "../Services/API";
import appStore from "./AppStore";

class StatusStore {
  @observable statuses = new Map();
  @observable isFetching = false;
  @observable isFetchingChildren = false;

  processSize = 20;
  fetchQueue = [];
  fetchQueueChildren = [];

  getInstance(id) {
    return this.statuses.get(id);
  }

  _debouncedProcessQueue = debounce(() => { this.processQueue(); }, 250);
  _debouncedProcessQueueChildren = debounce(() => { this.processQueueChildren(); }, 250);

  @action flush() {
    this.statuses = new Map();
  }

  @action
  fetchStatus(instanceIds) {
    if (!isArray(instanceIds)) {
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if (!this.statuses.has(id) || this.statuses.get(id).hasFetchError) {
        this.statuses.set(id, {
          isFetching: false,
          isFetched: false,
          hasFetchError: false,
          fetchError: null,
          isFetchingChildren: false,
          isFetchedChildren: false,
          hasFetchErrorChildren: false,
          fetchErrorChildren: null,
          data: null
        });
        this.fetchQueue.push(id);
        this.fetchQueueChildren.push(id);
      }
    });
    this.smartProcessQueue();
    this.smartProcessQueueChildren();
  }


  @action
  smartProcessQueue() {
    if (this.fetchQueue.length <= 0) {
      this._debouncedProcessQueue.cancel();
    } else if (this.fetchQueue.length < this.processSize) {
      this._debouncedProcessQueue();
    } else {
      this._debouncedProcessQueue.cancel();
      this.processQueue();
    }
  }

  @action
  smartProcessQueueChildren() {
    if (this.fetchQueueChildren.length <= 0) {
      this._debouncedProcessQueueChildren.cancel();
    } else if (this.fetchQueueChildren.length < this.processSize) {
      this._debouncedProcessQueueChildren();
    } else {
      this._debouncedProcessQueueChildren.cancel();
      this.processQueueChildren();
    }
  }

  @action
  async processQueue() {
    if (this.isFetching) {
      return;
    }
    this.isFetching = true;
    let toProcess = this.fetchQueue.splice(0, this.processSize);
    toProcess.forEach(id => {
      const status = this.statuses.get(id);
      status.isFetching = true;
      status.hasFetchError = false;
      status.fetchError = null;
    });
    try {
      let response = await API.axios.post(API.endpoints.releaseStatusTopInstance(), toProcess);
      runInAction(() => {
        response.data.forEach(responseStatus => {
          const status = this.statuses.get(responseStatus.id);
          status.data = responseStatus;
          status.isFetching = false;
          status.isFetched = true;
          this.isFetching = false;
          this.smartProcessQueue();
        });
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        toProcess.forEach(id => {
          const status = this.statuses.get(id);
          status.isFetching = false;
          status.hasFetchError = true;
          status.fetchError = `Error while fetching instance status (${message})`;
        });
        this.isFetching = false;
        this.smartProcessQueue();
      });
      appStore.captureSentryException(e);
    }

  }

  @action
  async processQueueChildren() {
    if (this.isFetchingChildren) {
      return;
    }
    this.isFetchingChildren = true;
    let toProcessChildren = this.fetchQueueChildren.splice(0, this.processSize);
    toProcessChildren.forEach(id => {
      const status = this.statuses.get(id);
      status.isFetchingChildren = true;
      status.hasFetchErrorChildren = false;
      status.fetchErrorChildren = null;
    });
    try {
      let responseChildren = await API.axios.post(API.endpoints.releaseStatusChildren(), toProcessChildren);
      runInAction(() => {
        responseChildren.data.forEach(responseStatus => {
          const status = this.statuses.get(responseStatus.id);
          status.data.childrenStatus = responseStatus.childrenStatus;
          status.isFetchingChildren = false;
          status.isFetchedChildren = true;
          this.isFetchingChildren = false;
          this.smartProcessQueueChildren();
        });
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        toProcessChildren.forEach(id => {
          const status = this.statuses.get(id);
          status.isFetchingChildren = false;
          status.hasFetchErrorChildren = true;
          status.fetchErrorChildren = `Error while fetching instance child status (${message})`;
        });
        this.isFetchingChildren = false;
        this.smartProcessQueueChildren();
      });
      appStore.captureSentryException(e);
    }
  }
}




export default new StatusStore();