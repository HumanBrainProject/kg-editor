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

import Instance from "./Instance";

const normalizeInstancesData = (transportLayer, rootStore, data) => {
  return (data && Array.isArray(data.data))?data.data.map(rowData => {
    Object.values(rowData.fields).forEach(d => {
      if(d.widget === "TextArea") {
        d.value = d.value && d.value.substr(0, 197) + "...";
        delete d.label;
      }
    });
    const instance = new Instance(rowData.id);
    instance.initializeData(transportLayer, rootStore, rowData);
    return instance;
  }):[];
};

export class BrowseStore {
  isFetching = false;
  isFetched = false;
  fetchError = null;
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
      refreshFilter: action,
      clearInstancesFilter: action
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  selectItem(item) {
    this.clearInstancesFilter();
    this.selectedItem = item;
    this.fetchInstances();
  }

  clearInstances() {
    this.instances.length = 0;
    this.totalInstances = 0;
    this.clearSelectedInstance();
    this.selectedItem = null;
    this.clearInstancesFilter();
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
    this.isFetching = true;
    this.applyInstancesFilter();
  }

  clearInstancesFilter() {
    this.instancesFilter = "";
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
      this.isFetching = true;
      this.selectedInstance = null;
      this.instances = [];
    }
    this.fetchError = null;
    try {
      const { data } = await this.transportLayer.searchInstancesByType(this.rootStore.appStore.currentSpace.id, this.selectedItem.name, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter);
      runInAction(() => {
        this.isFetching = false;
        const instances = normalizeInstancesData(this.transportLayer, this.rootStore, data);
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
        this.fetchError = `Error while retrieving instances of type "${this.selectedItem.type}" (${message})`;
        this.isFetching = false;
      });
    }
  }

  refreshFilter() {
    this.applyInstancesFilter();
  }
}

export default BrowseStore;