import { observable, action, computed, runInAction } from "mobx";
import API from "../Services/API";

class TypesStore {
  @observable types = [];
  @observable fetchError = null;
  @observable isFetching = false;

  filteredList(term) {
    term = typeof term === "string" && term.trim().toLowerCase();
    if(term) {
      return this.types.filter(type => type && typeof type.label === "string" && type.label.toLowerCase().includes(term));
    }
    return this.types;
  }

  @computed
  get isFetched() {
    return !this.fetchError && this.types.length;
  }

  @action
  async fetch(forceFetch=false) {
    if (!this.isFetching && (!this.types.length || !!forceFetch)) {
      this.isFetching = true;
      this.fetchError = null;
      try {
        const response = await API.axios.get(API.endpoints.workspaceTypes());
        runInAction(() => {
          this.types = (response.data && response.data.data && response.data.data.length)?response.data.data:[];
          this.isFetching = false;
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        this.fetchError = `Error while fetching types (${message})`;
        this.isFetching = false;
      }
    }
  }
}

export default new TypesStore();
