import { observable, action, runInAction, computed } from "mobx";

import API from "../Services/API";

export default class NodeTypeStore{

  @observable nodeTypeId = null;
  @observable instances = [];
  @observable instancesFilter = "";
  @observable isFetching = false;
  @observable error = null;

  constructor(nodeTypeId){
    this.nodeTypeId = nodeTypeId;
    this.fetchInstances();
  }

  @computed get hasError() {
    return this.error !== null;
  }

  @computed get filteredInstances() {
    const filter = this.instancesFilter.trim().replace(/\s+/g," ").toLowerCase();
    if (filter === "") {
      return this.instances;
    }
    const terms = filter.split(" ");
    return this.instances.filter(instance => {
      const label = instance.label && instance.label.toLowerCase();
      const description = instance.description && instance.description.toLowerCase();
      return terms.every(term => (label && label.indexOf(term) !== -1) || (description && description.indexOf(term) !== -1));
    });
  }

  @action
  filterInstances(filter){
    this.instancesFilter = filter;
  }

  @action
  async fetchInstances() {
    try {
      this.error = null;
      this.isFetching = true;
      const { data } = await API.axios.get(API.endpoints.instances(this.nodeTypeId));
      runInAction(() => {
        this.isFetching = false;
        this.instances = data;
      });
    } catch (e) {
      this.error = "Couldn't fetch instances: " + e;
      this.isFetching = false;
    }
  }
}