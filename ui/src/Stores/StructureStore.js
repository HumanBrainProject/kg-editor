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

  findTypeById(id) {
    return this.typesMap.get(id);
  }

  findLabelByType(type) {
    return this.typesLabel.get(type);
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
          this.colorPalette = palette("tol-dv", this.types.length);
          this.types.forEach((type, index) => {
            let color = "#" + this.colorPalette[index];
            this.colorPaletteByLabel[this.findLabelByType(type.id)] = color;
            type.color = color;
          });
          this.isFetching = false;
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        this.fetchError = `Error while fetching api structure (${message})`;
        this.isFetching = false;
      }
    }
  }

  colorPalletteByType(type) {
    return this.colorPaletteByLabel[this.findLabelByType(type)];
  }
}

export default new StructureStore();
