import { observable, action } from "mobx";

class NavigationStore {
  @observable browseFilterTerm = "";

  @action
  setBrowseFilterTerm(filter) {
    this.browseFilterTerm = filter;
  }

}
export default new NavigationStore();