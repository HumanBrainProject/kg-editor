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

import { observable, action, runInAction, makeObservable } from "mobx";
import debounce from "lodash/debounce";

export class StatusStore {
  statuses = new Map();
  isFetching = false;
  isFetchingChildren = false;

  processSize = 20;
  fetchQueue = [];
  fetchQueueChildren = [];

  transportLayer = null;

  constructor(transportLayer) {
    makeObservable(this, {
      statuses: observable,
      isFetching: observable,
      isFetchingChildren: observable,
      flush: action,
      fetchStatus: action,
      smartProcessQueue: action,
      smartProcessQueueChildren: action,
      processQueue: action,
      processQueueChildren: action
    });

    this.transportLayer = transportLayer;
  }

  getInstance(id) {
    return this.statuses.get(id);
  }

  _debouncedProcessQueue = debounce(() => { this.processQueue(); }, 250);
  _debouncedProcessQueueChildren = debounce(() => { this.processQueueChildren(); }, 250);

  flush() {
    this.statuses.clear();
  }

  fetchStatus(instanceIds) {
    if (!Array.isArray(instanceIds)) {
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
          data: null,
          childrenData: null
        });
        this.fetchQueue.push(id);
        this.fetchQueueChildren.push(id);
      }
    });
    this.smartProcessQueue();
    this.smartProcessQueueChildren();
  }


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
      let { data } = await this.transportLayer.getReleaseStatusTopInstance(toProcess);
      runInAction(() => {
        Object.entries(data.data).forEach(([id, responseStatus]) => {
          const status = this.statuses.get(id);
          status.data = responseStatus.data;
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
    }

  }

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
      let { data } = await this.transportLayer.getReleaseStatusChildren(toProcessChildren);
      runInAction(() => {
        Object.entries(data.data).forEach(([id, responseStatus]) => {
          const status = this.statuses.get(id);
          status.childrenData = responseStatus.data;
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
    }
  }
}

export default StatusStore;