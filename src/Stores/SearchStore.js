import { observable, action, runInAction, computed } from "mobx";
import { debounce } from "lodash";

import API from "../Services/API";

class SearchStore{

  @observable lists = [];
  @observable listsFilter = "";
  @observable isFetching = {
    lists: false,
    instances: false
  };
  @observable fetchError = {
    lists: null,
    instances: null
  };
  @observable selectedList = null;
  @observable selectedInstance = null;

  @observable instances = [];
  @observable instancesFilter = "";

  @observable canLoadMoreInstances = false;

  pageStart = 0;
  pageSize = 20;

  constructor(){
    this.fetchLists();
  }

  //Lists related methods
  @computed get filteredLists() {
    const terms = this.listsFilter.split(" ");
    return this.lists.filter(list => {
      if (!list.label) {
        return false;
      }
      const label = list.label.toLowerCase();
      return terms.every(term => label.includes(term));
    });
  }

  @action setListsFilter(filter){
    this.listsFilter = filter.trim().replace(/\s+/g," ").toLowerCase();
  }

  @action
  async fetchLists() {
    try {
      this.fetchError.lists = null;
      this.isFetching.lists = true;
      const { data } = await API.axios.get(API.endpoints.nodeTypes());
      runInAction(() => {
        this.isFetching.lists = false;
        this.lists = [];
        this.lists.push({
          folderName:"Common node types",
          expand:true,
          lists:(data && data.data)? data.data.filter(type => type.ui_info && type.ui_info.promote):[]
        });
        this.lists.push({
          folderName:"Other node types",
          expand:true,
          lists:(data && data.data)? data.data.filter(type => !type.ui_info || !type.ui_info.promote):[]
        });
      });
    } catch (e) {
      const message = e.message? e.message: e;
      this.fetchError.lists = `Error while retrieving lists (${message})`;
      this.isFetching.lists = false;
    }
  }

  @action toggleFolder(folder, state){
    folder.expand = state !== undefined? !!state: !folder.expand;
  }

  @action selectList(list){
    this.instancesFilter = "";
    this.selectedList = list;
    this.fetchInstances();
  }

  @action selectInstance(selectedInstance){
    this.selectedInstance = selectedInstance;
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
    try {
      if(loadMore){
        this.pageStart++;
      } else {
        this.pageStart = 0;
        this.isFetching.instances = true;
        this.selectedInstance = null;
      }
      this.fetchError.instances = null;
      const { data } = await API.axios.get(API.endpoints.listInstances(this.selectedList.path, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter));
      runInAction(() => {
        this.isFetching.instances = false;
        if(loadMore){
          this.instances = [...this.instances, ...((data && data.data)?data.data:[])];
        } else {
          this.instances = (data && data.data)?data.data:[];
        }
        this.canLoadMoreInstances = this.instances.length < data.total;
      });
    } catch (e) {
      const message = e.message?e.message:e;
      this.fetchError.instances = `Error while retrieving instances "${this.nodeTypeId}" (${message})`;
      this.isFetching.instances = false;
    }
  }
}

export default new SearchStore();