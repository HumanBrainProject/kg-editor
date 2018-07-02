import { observable, action, runInAction, computed } from "mobx";

import API from "../Services/API";

export default class NodeTypeStore{

  @observable nodeTypeLabel = "";
  @observable nodeTypeId = null;
  @observable instances = [];
  @observable instancesFilter = "";
  @observable isFetching = false;
  @observable error = null;

  constructor(nodeTypeId){
    this.nodeTypeId = nodeTypeId;
    const [, , schema, ] = nodeTypeId.split("/");
    this.nodeTypeLabel = schema;
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
      return terms.every(term => (label && label.includes(term)) || (description && description.includes(term)));
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
        if (data && data.label) {
          this.nodeTypeLabel = data.label;
        }
        this.instances = (data && data.data)?data.data:[];
      });
    } catch (e) {
      const message = e.message?e.message:e;
      this.error = `Error while retrieving instances "${this.nodeTypeId}" (${message})`;
      this.isFetching = false;
    }
  }
}