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
import debounce from "lodash/debounce";

interface StatusResponse {
  data: string;
}

interface Status {
  isFetching: boolean;
  isFetched: boolean;
  hasFetchError: boolean;
  fetchError?: string;
  isFetchingChildren: boolean;
  isFetchedChildren: boolean;
  hasFetchErrorChildren: boolean;
  fetchErrorChildren?: string;
  data?: string;
  childrenData?: string;
}

type Statuses = Map<string, Status>;

export class StatusStore {
  statuses: Statuses = new Map<string, Status>();
  isFetching = false;
  isFetchingChildren = false;

  processSize = 20;
  fetchQueue: string[] = [];
  fetchQueueChildren: string[] = [];

  api = null;

  constructor(api) {
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

    this.api = api;
  }

  getInstance(id) {
    return this.statuses.get(id);
  }

  _debouncedProcessQueue = debounce(() => {
    this.processQueue();
  }, 250);
  _debouncedProcessQueueChildren = debounce(() => {
    this.processQueueChildren();
  }, 250);

  flush() {
    this.statuses.clear();
  }

  fetchStatus(instanceIds: string[]) {
    if (!Array.isArray(instanceIds)) {
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if (!this.statuses.has(id) || this.statuses.get(id)?.hasFetchError) {
        this.statuses.set(id, {
          isFetching: false,
          isFetched: false,
          hasFetchError: false,
          fetchError: undefined,
          isFetchingChildren: false,
          isFetchedChildren: false,
          hasFetchErrorChildren: false,
          fetchErrorChildren: undefined,
          data: undefined,
          childrenData: undefined
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
    const toProcess = this.fetchQueue.splice(0, this.processSize);
    toProcess.forEach(id => {
      const status = this.statuses.get(id);
      if (status) {
        status.isFetching = true;
        status.hasFetchError = false;
        status.fetchError = undefined;
      }
    });
    try {
      const { data } = await this.api.getReleaseStatusTopInstance(toProcess);
      runInAction(() => {
        Object.entries(data).forEach(([id, responseStatus]) => {
          const status = this.statuses.get(id);
          if (status) {
            status.data = (responseStatus as StatusResponse).data;
            status.isFetching = false;
            status.isFetched = true;
          }
          this.isFetching = false;
          this.smartProcessQueue();
        });
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        toProcess.forEach(id => {
          const status = this.statuses.get(id);
          if (status) {
            status.isFetching = false;
            status.hasFetchError = true;
            status.fetchError = `Error while retrieving instance status (${message})`;
          }
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
    const toProcessChildren = this.fetchQueueChildren.splice(
      0,
      this.processSize
    );
    toProcessChildren.forEach(id => {
      const status = this.statuses.get(id);
      if (status) {
        status.isFetchingChildren = true;
        status.hasFetchErrorChildren = false;
        status.fetchErrorChildren = undefined;
      }
    });
    try {
      const { data } = await this.api.getReleaseStatusChildren(
        toProcessChildren
      );
      runInAction(() => {
        Object.entries(data).forEach(([id, responseStatus]) => {
          const status = this.statuses.get(id);
          if (status) {
            status.childrenData = (responseStatus as StatusResponse).data;
            status.isFetchingChildren = false;
            status.isFetchedChildren = true;
          }
          this.isFetchingChildren = false;
          this.smartProcessQueueChildren();
        });
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        toProcessChildren.forEach(id => {
          const status = this.statuses.get(id);
          if (status) {
            status.isFetchingChildren = false;
            status.hasFetchErrorChildren = true;
            status.fetchErrorChildren = `Error while retrieving instance child status (${message})`;
          }
        });
        this.isFetchingChildren = false;
        this.smartProcessQueueChildren();
      });
    }
  }
}

export default StatusStore;
