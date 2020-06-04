/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { observable, action, computed, runInAction } from "mobx";
import { sortBy, groupBy } from "lodash";
import palette from "google-palette";
import API from "../Services/API";
import appStore from "./AppStore";

class StructureStore {
  @observable colorPaletteByLabel = new Map();
  @observable structure = null;
  @observable fetchStuctureError = null;
  @observable isFetchingStructure = false;
  colorPalette = null;

  constructor() {
    this.fetchStructure();
  }

  @computed
  get groupedSchemas() {
    return groupBy(this.structure.schemas, "group");
  }

  @computed
  get sortedGroupedSchemas() {
    return Object.keys(this.groupedSchemas).sort();
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

  @computed
  get schemasMap() {
    const map = new Map();
    this.structure && this.structure.schemas && this.structure.schemas.length && this.structure.schemas.forEach(schema => map.set(schema.id, schema));
    return map;
  }

  @computed
  get schemasLabel() {
    const map = new Map();
    this.structure && this.structure.schemas && this.structure.schemas.length && this.structure.schemas.forEach(schema => map.set(schema.id, schema.label));
    return map;
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

  colorPalletteBySchema(schema) {
    return this.colorPaletteByLabel[this.findLabelBySchema(schema)];
  }

  @action
  async fetchStructure(forceFetch=false) {
    if (!this.isFetchingStructure && (!this.structure || !!forceFetch)) {
      this.isFetchingStructure = true;
      this.fetchStuctureError = null;
      try {
        const response = await API.axios.get(API.endpoints.structure());
        let schemas = response.data && response.data.schemas.map(schema=>schema.id);
        runInAction(() => {
          this.structure = response.data;
          this.colorPalette = palette("tol-dv", schemas.length);
          schemas.forEach((schema, index) => {
            let color = "#" + this.colorPalette[index];
            this.colorPaletteByLabel[this.findLabelBySchema(schema)] = color;
          });
          this.isFetchingStructure = false;
        });
      } catch (e) {
        runInAction(() => {
          const message = e.message ? e.message : e;
          this.fetchStuctureError = `Error while fetching api structure (${message})`;
          this.isFetchingStructure = false;
        });
        appStore.captureSentryException(e);
      }
    }
  }
}

export default new StructureStore();
