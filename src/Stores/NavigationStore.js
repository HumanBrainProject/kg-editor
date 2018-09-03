import { observable, action, computed } from "mobx";

export default class NavigationStore {

  @observable showHomeLink = true;
  @observable instanceStore = null;
  @observable nodeTypeStore = null;
  @observable showGraph = true;

  @action
  setShowGraph(show) {
    this.showGraph = show;
  }

  showGraph() {
    return this.showGraph;
  }

  @computed get showSearchLink() {
    return !!this.nodeTypeId;
  }

  @computed get showNodeTypeLink() {
    return !!this.instanceStore;
  }

  @computed get nodeTypeLabel() {
    if (this.instanceStore) {
      const mainInstance = this.instanceStore.mainInstance;
      if (mainInstance.data && mainInstance.data.label) {
        return mainInstance.data.label;
      }
      const [, , schema, ,] = this.instanceStore.mainInstanceId.split("/");
      return schema;
    }
    if (this.nodeTypeStore) {
      return this.nodeTypeStore.nodeTypeLabel;
    }
    return "";
  }

  @computed get nodeTypeId() {
    if (this.instanceStore) {
      const [organization, domain, schema, version,] = this.instanceStore.mainInstanceId.split("/");
      return `${organization}/${domain}/${schema}/${version}`;
    }
    if (this.nodeTypeStore) {
      return this.nodeTypeStore.nodeTypeId;
    }
    return null;
  }

  @action
  setHomeLinkVisibility(visible) {
    this.showHomeLink = !!visible;
  }

  @action
  setInstanceStore(store) {
    this.instanceStore = store;
  }

  @action
  setNodeTypeStore(store) {
    this.nodeTypeStore = store;
  }
}