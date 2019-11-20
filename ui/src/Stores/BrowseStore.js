import { observable, action, runInAction } from "mobx";
import { debounce } from "lodash";
import { FormStore } from "hbp-quickfire";

import { normalizeInstanceData } from "../Helpers/InstanceHelper";

import API from "../Services/API";

const transformField = field  =>  {
  if(field.type === "TextArea") {
    field.value = field.value.substr(0, 197) + "...";
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

class BrowseStore{

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
      }
    }
  }

  @action
  refreshFilter() {
    this.applyInstancesFilter();
  }

}

export default new BrowseStore();