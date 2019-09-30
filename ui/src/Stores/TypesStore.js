import { observable, action, computed, runInAction } from "mobx";
import API from "../Services/API";

class TypesStore {
  @observable types = [];
  @observable fetchError = null;
  @observable isFetching = false;

  constructor() {
    this.fetch();
  }

  filteredList(term) {
    if(term.trim()) {
      return this.types.filter(type => type.label.toLowerCase().includes(term.trim().toLowerCase()));
    }
    return this.types;
  }

  @computed
  get hasTypes() {
    return (
      !this.fetchError && this.types.length
    );
  }

  @computed
  get typesMap() {
    const map = new Map();
    this.types.forEach(type => map.set(type.id, type));
    return map;
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
        this.fetchError = `Error while fetching api structure (${message})`;
        this.isFetching = false;
      }
    }
  }
}

export default new TypesStore();
