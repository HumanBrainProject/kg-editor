import { observable, action, computed, runInAction } from "mobx";
import { sortBy, groupBy } from "lodash";
import API from "../Services/API";

class StructureStore {
  @observable structure = null;
  @observable fetchStuctureError = null;
  @observable isFetchingStructure = false;
  @observable schemasMap = new Map();
  @observable schemasLabel = new Map();

  @computed
  get groupedSchemas() {
    return groupBy(this.structure.schemas, "group");
  }

  @computed
  get hasSchemas() {
    return (
      !this.fetchStuctureError &&
      this.structure &&
      this.structure.schemas &&
      this.structure.schemas.length
    );
  }

  constructor() {
    this.fetchStructure();
  }

  getSortedSchemaGroups() {
    return Object.keys(this.groupedSchemas).sort();
  }

  getSortedSchemasByGroup(group) {
    return sortBy(this.groupedSchemas[group], ["label"]);
  }

  findSchemaById(id) {
    return this.schemasMap.get(id);
  }

  findLabelBySchema(schema) {
    return this.schemasLabel.get(schema);
  }

  @action
  async fetchStructure() {
    if (!this.isFetchingStructure) {
      this.isFetchingStructure = true;
      this.fetchStuctureError = null;
      try {
        const response = await API.axios.get(API.endpoints.structure());
        runInAction(() => {
          this.isFetchingStructure = false;
          this.structure = response.data;
          this.structure &&
            this.structure.schemas &&
            this.structure.schemas.length &&
            this.structure.schemas.forEach(schema => {
              this.schemasMap.set(schema.id, schema);
              this.schemasLabel.set(schema.id, schema.label);
            });
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        this.fetchStuctureError = `Error while fetching api structure (${message})`;
        this.isFetchingStructure = false;
      }
    }
  }
}

export default new StructureStore();
