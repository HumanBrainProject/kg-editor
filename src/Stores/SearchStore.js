import { observable, action, runInAction, computed } from "mobx";

import API from "../Services/API";

export default class SearchStore{

  @observable nodeTypes = [];
  @observable nodeTypesFilter = "";
  @observable isFetching = false;
  @observable error = null;

  constructor(){
    this.fetchNodeTypes();
  }

  @computed get hasError() {
    return this.error !== null;
  }

  @computed get filteredNodeTypes() {
    const filter = this.nodeTypesFilter.trim().replace(/\s+/g," ").toLowerCase();
    if (filter === "") {
      return this.nodeTypes;
    }
    const terms = filter.split(" ");
    return this.nodeTypes.filter(nodeType => {
      if (!nodeType.label) {
        return false;
      }
      const label = nodeType.label.toLowerCase();
      return terms.every(term => label.indexOf(term) !== -1);
    });
  }

  @action
  filterNodeTypes(filter){
    this.nodeTypesFilter = filter;
  }

  @action
  async fetchNodeTypes() {
    try {
      this.error = null;
      this.isFetching = true;
      const { data } = await API.axios.get(API.endpoints.nodeTypes());
      runInAction(() => {
        this.isFetching = false;
        this.nodeTypes = data;
      });
    } catch (e) {
      this.error = "Couldn't fetch node types: " + e;
      this.isFetching = false;
    }
  }
}