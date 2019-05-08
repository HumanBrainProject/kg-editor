import { computed } from "mobx";
import palette from "google-palette";

import structureStore from "./StructureStore";

const dataTypes = [
  {
    "schema": "minds/core/dataset/v1.0.0"
  },
  {
    "schema": "minds/core/specimengroup/v1.0.0"
  },
  {
    "schema": "minds/experiment/subject/v1.0.0"
  },
  {
    "schema": "minds/core/activity/v1.0.0"
  },
  {
    "schema": "minds/core/person/v1.0.0"
  },
  {
    "schema": "minds/core/placomponent/v1.0.0"
  },
  {
    "schema": "minds/core/publication/v1.0.0"
  },
  {
    "schema": "minds/core/fileassociation/v1.0.0"
  },
  {
    "schema": "minds/core/doi/v1.0.0"
  },
  {
    "schema": "minds/experiment/method/v1.0.0"
  },
  {
    "schema": "minds/core/referencespace/v1.0.0"
  },
  {
    "schema": "minds/core/parcellationregion/v1.0.0",
  },
  {
    "schema": "minds/core/parcellationatlas/v1.0.0",
  },
  {
    "schema": "minds/core/embargostatus/v1.0.0",
  },
  {
    "schema": "minds/ethics/approval/v1.0.0",
  },
  {
    "schema": "minds/experiment/protocol/v1.0.0",
  },
  {
    "schema": "minds/core/preparation/v1.0.0",
  },
  {
    "schema": "minds/ethics/authority/v1.0.0",
  },
  {
    "schema": "minds/core/format/v1.0.0",
  },
  {
    "schema": "minds/core/licensetype/v1.0.0",
  },
  {
    "schema": "minds/experiment/sample/v1.0.0",
  },
  {
    "schema": "cscs/core/file/v1.0.0",
  },
  {
    "schema": "minds/core/softwareagent/v1.0.0",
  },
  {
    "schema": "minds/core/agecategory/v1.0.0",
  },
  {
    "schema": "minds/core/sex/v1.0.0"
  },
  {
    "schema": "minds/core/species/v1.0.0",
  },
  {
    "schema": "minds/core/role/v1.0.0",
  }
];

class DataTypesStore {

  @computed
  get dataTypes() {
    return dataTypes;
  }

  @computed
  get sortedDataTypes() {
    return this.dataTypes.concat().sort((a, b) => a.schema < b.schema ? -1 : a.schema > b.schema ? 1 : 0);
  }

  @computed
  get dataTypeLabelList() {
    return this.dataTypes.reduce((result, { schema }) => {
      if (!result.map[schema]) {
        result.map[schema] = true;
        result.list.push(schema);
      }
      return result;
    }, { list: [], map: {} }).list;
  }

  @computed
  get dataTypeLabels() {
    return structureStore.groupedSchemas.reduce((result, nodeType) => {
      result[nodeType.schema] = structureStore.findLabelBySchema(nodeType.schema);
      return result;
    }, {});
  }

  @computed
  get colorScheme() {
    const colorPalette = palette("mpn65", this.dataTypeLabelList.length);
    return this.dataTypeLabelList.reduce((result, schema, index) => {
      result[schema] = "#" + colorPalette[index];
      return result;
    }, {});
  }
}

export default new DataTypesStore();