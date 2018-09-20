import { observable, action, runInAction, computed } from "mobx";

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

  @observable instances = [];
  @observable instancesFilter = "";

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
    this.selectedList = list;
    this.fetchInstances();
  }


  //Instances related methods
  @computed get filteredInstances() {
    const terms = this.instancesFilter.split(" ");
    return this.instances.filter(instance => {
      const label = instance.label && instance.label.toLowerCase();
      const description = instance.description && instance.description.toLowerCase();
      return terms.every(term => (label && label.includes(term)) || (description && description.includes(term)));
    });
  }

  @action setInstancesFilter(filter){
    this.instancesFilter = filter.trim().replace(/\s+/g," ").toLowerCase();
  }

  @action
  async fetchInstances() {
    try {
      this.fetchError.instances = null;
      this.isFetching.instances = true;
      const { data } = await API.axios.get(API.endpoints.instances(this.selectedList.path));
      runInAction(() => {
        this.isFetching.instances = false;
        this.instances = (data && data.data)?data.data:[];
      });
    } catch (e) {
      const message = e.message?e.message:e;
      this.fetchError.instances = `Error while retrieving instances "${this.nodeTypeId}" (${message})`;
      this.isFetching.instances = false;
    }
  }
}

export default new SearchStore();