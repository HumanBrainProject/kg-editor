import { observable, action, runInAction } from "mobx";
import { debounce } from "lodash";

import API from "../Services/API";

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

  @action selectItem(item){
    this.instancesFilter = "";
    this.selectedItem = item;
    this.fetchInstances();
  }

  @action
  setNavigationFilterTerm(filter) {
    this.navigationFilter = filter;
  }


  @action selectInstance(selectedInstance){
    this.selectedInstance = selectedInstance;
  }

  @action clearSelectedInstance() {
    this.selectedInstance = null;
  }

  @action setInstancesFilter(filter){
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
    try {
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
          const { data } = await API.axios.get(API.endpoints.filterBookmarkInstances(this.selectedItem.id, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter));
          runInAction(() => {
            this.isFetching.instances = false;
            if(loadMore){
              this.instances = [...this.instances, ...((data && data.data)?data.data:[])];
            } else {
              this.instances = (data && data.data)?data.data:[];
            }
            this.canLoadMoreInstances = this.instances.length < data.total;
            this.totalInstances = data.total;
          });
        }
      } else {
        const { data } = await API.axios.get(API.endpoints.searchInstances(this.selectedItem.id, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter));
        runInAction(() => {
          this.isFetching.instances = false;
          if(loadMore){
            this.instances = [...this.instances, ...((data && data.data)?data.data:[])];
          } else {
            this.instances = (data && data.data)?data.data:[];
          }
          this.canLoadMoreInstances = this.instances.length < data.total;
          this.totalInstances = data.total;
        });
      }
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        this.fetchError.instances = `Error while retrieving instances "${this.nodeTypeId}" (${message})`;
        this.isFetching.instances = false;
      });
    }
  }

  @action
  refreshFilter() {
    this.applyInstancesFilter();
  }

}

export default new BrowseStore();