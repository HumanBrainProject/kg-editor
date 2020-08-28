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
import { debounce } from "lodash";
import { FormStore } from "hbp-quickfire";

import appStore from "./AppStore";
import { normalizeInstanceData } from "../Helpers/InstanceHelper";

import API from "../Services/API";

const transformField = field  =>  {
  if(field.type === "TextArea") {
    field.value = field.value?field.value.substr(0, 197) + "...": null;
    delete field.label;
  }
};

const normalizeInstancesData = data => {
  return (data && data.data instanceof Array)?data.data.map(item => {
    const instance = normalizeInstanceData(item, transformField);
    instance.formStore = new FormStore(instance);
    instance.formStore.toggleReadMode(true);
    return instance;
  }):[];
};

class BrowseStore {
  @observable lists = [];
  @observable isFetching = {
    lists: false,
    instances: false
  };
  @observable isFetched = {
    lists: false
  };
  @observable fetchError = {
    lists: null,
    instances: null
  };
  @observable selectedItem = null;
  @observable selectedInstance = null;

  @observable instances = [];
  @observable instancesFilter = "";

  @observable canLoadMoreInstances = false;
  @observable totalInstances = 0;

  @observable navigationFilter = "";

  pageStart = 0;
  pageSize = 20;

  @action
  selectItem(item){
    this.instancesFilter = "";
    this.selectedItem = item;
    this.fetchInstances();
  }

  @action
  clearInstances() {
    this.instances.length = 0;
    this.clearSelectedInstance();
  }

  @action
  setNavigationFilterTerm(filter) {
    this.navigationFilter = filter;
  }

  @action
  selectInstance(selectedInstance){
    this.selectedInstance = selectedInstance;
  }

  @action
  clearSelectedInstance() {
    this.selectedInstance = null;
  }

  @action
  setInstancesFilter(filter){
    this.instancesFilter = filter;
    this.isFetching.instances = true;
    this.applyInstancesFilter();
  }

  applyInstancesFilter = debounce(() => {
    this.fetchInstances();
  }, 750);

  @action
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
          const { data } = await API.axios.get(API.endpoints.filterBookmarkInstances(this.selectedItem.id, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter));
          runInAction(() => {
            this.isFetching.instances = false;
            const instances = normalizeInstancesData(data);
            if(loadMore){
              this.instances = [...this.instances, ...instances];
            } else {
              this.instances = (data && data.data)?data.data:[];
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
        const { data } = await API.axios.get(API.endpoints.searchInstances(this.selectedItem.name, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter));
        runInAction(() => {
          this.isFetching.instances = false;
          const instances = normalizeInstancesData(data);
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
        appStore.captureSentryException(e);
      }
    }
  }

  @action
  refreshFilter() {
    this.applyInstancesFilter();
  }

}

export default new BrowseStore();