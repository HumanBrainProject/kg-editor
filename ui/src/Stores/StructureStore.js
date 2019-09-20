import { observable, action, computed, runInAction } from "mobx";
import { groupBy } from "lodash";
import API from "../Services/API";
import palette from "google-palette";

class StructureStore {
  @observable colorPaletteByLabel = new Map();
  @observable types = [];
  @observable fetchError = null;
  @observable isFetching = false;
  colorPalette = null;

  constructor() {
    this.fetch();
  }

  filteredList(term) {
    if(term.trim()) {
      return this.typesBySpace.reduce((acc, space) => {
        const types = space.types.filter(type => type.label.toLowerCase().includes(term.trim().toLowerCase()));
        if(types.length) {
          acc.push({label: space.label, types: types});
        }
        return acc;
      },[]);
    }
    return this.typesBySpace;
  }

  findTypeById(id) {
    return this.typesMap.get(id);
  }

  findLabelByType(type) {
    return this.typesLabel.get(type);
  }

  @computed
  get typesBySpace() {
    return Object.entries(groupBy(this.types, "space")).map(([label, types]) => ({label: label, types: types}));
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
  get typesLabel() {
    const map = new Map();
    this.types.forEach(type => map.set(type.id, type.label));
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
        const response = await API.axios.get(API.endpoints.structure());
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

  // TODO: applay space to all the places referring to this method
  colorPalletteByType(type, space) {
    return this.types && this.types.filter(t => (t.space === space && t.type === type))[0].color;
  }
}

export default new StructureStore();
