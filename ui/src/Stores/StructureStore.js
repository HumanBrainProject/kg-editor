import { observable, action, computed, runInAction } from "mobx";
import { sortBy, groupBy } from "lodash";
import API from "../Services/API";
import palette from "google-palette";

class StructureStore {
  @observable colorPaletteByLabel = new Map();
  @observable types = [];
  @observable fetchStuctureError = null;
  @observable isFetchingStructure = false;
  colorPalette = null;

  constructor() {
    this.fetchStructure();
  }

  @computed
  get groupedTypes() {
    return groupBy(this.types, "group");
  }

  @computed
  get sortedGroupedTypes() {
    return Object.keys(this.groupedTypes).sort();
  }

  @computed
  get hasTypes() {
    return (
      !this.fetchStuctureError && this.types.length
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

  getSortedTypesByGroup(group) {
    return sortBy(this.groupedTypes[group], ["label"]);
  }

  findTypeById(id) {
    return this.typesMap.get(id);
  }

  findLabelByType(type) {
    return this.typesLabel.get(type);
  }

  @action
  async fetchStructure(forceFetch=false) {
    if (!this.isFetchingStructure && (!this.types.length || !!forceFetch)) {
      this.isFetchingStructure = true;
      this.fetchStuctureError = null;
      try {
        const response = await API.axios.get(API.endpoints.structure());
        runInAction(() => {
          this.types = (response.data && response.data.data && response.data.data.length)?response.data.data:[];
          const typeNames = this.types.map(type=>type.id);
          this.colorPalette = palette("tol-dv", typeNames.length);
          typeNames.forEach((name, index) => {
            let color = "#" + this.colorPalette[index];
            this.colorPaletteByLabel[this.findLabelByType(name)] = color;
          });
          this.isFetchingStructure = false;
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        this.fetchStuctureError = `Error while fetching api structure (${message})`;
        this.isFetchingStructure = false;
      }
    }
  }

  colorPalletteByType(type) {
    return this.colorPaletteByLabel[this.findLabelByType(type)];
  }
}

export default new StructureStore();
