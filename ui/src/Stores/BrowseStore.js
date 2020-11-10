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

import API from "../Services/API";
import InstanceStore from "./InstanceStore";

const normalizeInstancesData = (transportLayer, data) => {
  return (data && Array.isArray(data.data))?data.data.map(rowData => {
    Object.values(rowData.fields).forEach(d => {
      if(d.type === "TextArea") {
        d.value = d.value && d.value.substr(0, 197) + "...";
        delete d.label;
      }
    });
    const instance = new InstanceStore(rowData.id);
    instance.initializeData(transportLayer, rowData);
    return instance;
  }):[];
};

export class BrowseStore {
  lists = [];
  isFetching = {
    lists: false,
    instances: false
  };
  isFetched = {
    lists: false
  };
  fetchError = {
    lists: null,
    instances: null
  };
  selectedItem = null;
  selectedInstance = null;

  instances = [];
  instancesFilter = "";

  canLoadMoreInstances = false;
  totalInstances = 0;

  navigationFilter = "";

  pageStart = 0;
  pageSize = 20;

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore) {
    makeObservable(this, {
      lists: observable,
      isFetching: observable,
      isFetched: observable,
      fetchError: observable,
      selectedItem: observable,
      selectedInstance: observable,
      instances: observable,
      instancesFilter: observable,
      canLoadMoreInstances: observable,
      totalInstances: observable,
      navigationFilter: observable,
      selectItem: action,
      clearInstances: action,
      setNavigationFilterTerm: action,
      selectInstance: action,
      clearSelectedInstance: action,
      setInstancesFilter: action,
      fetchInstances: action,
      refreshFilter: action
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  selectItem(item) {
    this.instancesFilter = "";
    this.selectedItem = item;
    this.fetchInstances();
  }

  clearInstances() {
    this.instances.length = 0;
    this.totalInstances = 0;
    this.clearSelectedInstance();
  }

  setNavigationFilterTerm(filter) {
    this.navigationFilter = filter;
  }

  selectInstance(selectedInstance) {
    this.selectedInstance = selectedInstance;
  }

  clearSelectedInstance() {
    this.selectedInstance = null;
  }

  setInstancesFilter(filter) {
    this.instancesFilter = filter;
    this.isFetching.instances = true;
    this.applyInstancesFilter();
  }

  applyInstancesFilter = debounce(() => {
    this.fetchInstances();
  }, 750);

  async fetchInstances(loadMore = false) {
    if(!this.selectedItem) {
      return;
    }
    if(loadMore){
      this.pageStart++;
    } else {
      this.pageStart = 0;
      this.isFetching.instances = true;
      this.selectedInstance = null;
      this.instances = [];
    }
    this.fetchError.instances = null;
    if(this.selectedItem.list) {
      if(this.selectedItem.list.length > 0) {
        try {
          const { data } = await this.transportLayer.searchInstancesByBookmark(this.rootStore.appStore.currentWorkspace.id, this.selectedItem.id, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter);
          runInAction(() => {
            this.isFetching.instances = false;
            const instances = normalizeInstancesData(this.transportLayer, data);
            if(loadMore){
              this.instances = [...this.instances, ...instances];
            } else {
              this.instances = instances;
            }
            this.canLoadMoreInstances = this.instances.length < data.total;
            this.totalInstances = data.total;
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message?e.message:e;
            this.fetchError.instances = `Error while retrieving instances of bookmark "${this.selectedItem.id}" (${message})`;
            this.isFetching.instances = false;
          });
        }
      }
    } else {
      try {
        const { data } = await this.transportLayer.searchInstancesByType(this.rootStore.appStore.currentWorkspace.id, this.selectedItem.name, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter);
        runInAction(() => {
          this.isFetching.instances = false;
          const instances = normalizeInstancesData(this.transportLayer, data);
          if(loadMore){
            this.instances = [...this.instances, ...instances];
          } else {
            this.instances = instances;
          }
          this.canLoadMoreInstances = this.instances.length < data.total;
          this.totalInstances = data.total;
        });
      } catch (e) {
        runInAction(() => {
          const message = e.message?e.message:e;
          this.fetchError.instances = `Error while retrieving instances of type "${this.selectedItem.type}" (${message})`;
          this.isFetching.instances = false;
        });
        this.transportLayer.captureException(e);
      }
    }
  }

  refreshFilter() {
    this.applyInstancesFilter();
  }
}

export default BrowseStore;