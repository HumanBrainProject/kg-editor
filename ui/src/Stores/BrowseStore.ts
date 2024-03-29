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

import debounce from 'lodash/debounce';
import { observable, action, runInAction, makeObservable } from 'mobx';

import Instance from './Instance';
import type RootStore from './RootStore';
import type API from '../Services/API';
import type { APIError } from '../Services/API';
import type { InstanceSummary, StructureOfType } from '../types';

const normalizeInstancesData = (api: API, rootStore: RootStore, data:InstanceSummary[]) => (Array.isArray(data))?data.map(rowData => {
  Object.values(rowData.fields).forEach(d => {
    if(d.widget === 'TextArea') {
      d.value = d.value && d.value.substring(0, 197) + '...';
      d.label = undefined;
    }
  });
  const instance = new Instance(rowData.id);
  instance.initializeData(api, rootStore, rowData);
  return instance;
}):[];

export class BrowseStore {
  isFetching = false;
  isFetched = false;
  fetchError?: string;
  selectedType?: StructureOfType;
  selectedInstance?: Instance;

  instances: Instance[] = [];
  instancesFilter = '';

  canLoadMoreInstances = false;
  totalInstances = 0;

  navigationFilter = '';

  pageStart = 0;
  pageSize = 20;

  api: API;
  rootStore: RootStore;

  constructor(api: API, rootStore: RootStore) {
    makeObservable(this, {
      isFetching: observable,
      isFetched: observable,
      fetchError: observable,
      selectedType: observable,
      selectedInstance: observable,
      instances: observable,
      instancesFilter: observable,
      canLoadMoreInstances: observable,
      totalInstances: observable,
      navigationFilter: observable,
      selectType: action,
      clearSelectedType: action,
      setNavigationFilterTerm: action,
      selectInstance: action,
      clearSelectedInstance: action,
      setInstancesFilter: action,
      fetchInstances: action,
      refreshFilter: action,
      clearInstancesFilter: action
    });

    this.api = api;
    this.rootStore = rootStore;
  }

  selectType(type: StructureOfType) {
    this.clearInstancesFilter();
    this.selectedType = type;
    this.fetchInstances();
  }

  clearSelectedType() {
    this.selectedType = undefined;
    this.instances = [];
    this.totalInstances = 0;
    this.clearSelectedInstance();
    this.clearInstancesFilter();
  }

  setNavigationFilterTerm(filter: string) {
    this.navigationFilter = filter;
  }

  selectInstance(selectedInstance: Instance) {
    this.selectedInstance = selectedInstance;
  }

  clearSelectedInstance() {
    this.selectedInstance = undefined;
  }

  setInstancesFilter(filter: string) {
    this.instancesFilter = filter;
    this.isFetching = true;
    this.applyInstancesFilter();
  }

  clearInstancesFilter() {
    this.instancesFilter = '';
  }

  applyInstancesFilter = debounce(() => {
    this.fetchInstances();
  }, 750);

  async fetchInstances(loadMore = false) {
    if(!this.selectedType) {
      return;
    }
    if(loadMore){
      this.pageStart++;
    } else {
      this.pageStart = 0;
      this.isFetching = true;
      this.selectedInstance = undefined;
      this.instances = [];
    }
    this.fetchError = undefined;
    try {
      const space = this.rootStore.appStore.currentSpace?.id as string;
      const data  = await this.api.searchInstancesByType(space, this.selectedType.name, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter);
      runInAction(() => {
        this.isFetching = false;
        const instances = normalizeInstancesData(this.api, this.rootStore, data.data);
        if(loadMore){
          this.instances = [...this.instances, ...instances];
        } else {
          this.instances = instances;
        }
        this.canLoadMoreInstances = this.instances.length < data.total;
        this.totalInstances = data.total;
      });
    } catch (e) {
      const err = e as APIError;
      runInAction(() => {
        this.fetchError = `Error while retrieving instances of type "${this.selectedType?.name}" (${err?.message})`;
        this.isFetching = false;
      });
    }
  }

  refreshFilter() {
    this.applyInstancesFilter();
  }
}

export default BrowseStore;