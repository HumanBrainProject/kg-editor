import { computed } from "mobx";

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
    "schema": "datacite/core/doi/v1.0.0"
  },
  {
    "schema": "minds/experiment/method/v1.0.0"
  },
  {
    "schema": "minds/core/referencespace/v1.0.0"
  },
  {
    "schema": "minds/core/parcellationregion/v1.0.0"
  },
  {
    "schema": "minds/core/parcellationatlas/v1.0.0"
  },
  {
    "schema": "minds/core/embargostatus/v1.0.0"
  },
  {
    "schema": "minds/ethics/approval/v1.0.0"
  },
  {
    "schema": "minds/experiment/protocol/v1.0.0"
  },
  {
    "schema": "minds/core/preparation/v1.0.0"
  },
  {
    "schema": "minds/ethics/authority/v1.0.0"
  },
  {
    "schema": "minds/core/format/v1.0.0"
  },
  {
    "schema": "minds/core/licensetype/v1.0.0"
  },
  {
    "schema": "minds/experiment/sample/v1.0.0"
  },
  {
    "schema": "cscs/core/file/v1.0.0"
  },
  {
    "schema": "minds/core/softwareagent/v1.0.0"
  },
  {
    "schema": "minds/core/agecategory/v1.0.0"
  },
  {
    "schema": "minds/core/sex/v1.0.0"
  },
  {
    "schema": "minds/core/species/v1.0.0"
  },
  {
    "schema": "minds/prov/role/v1.0.0"
  },
  {
    "schema": "neuroglancer/viewer/neuroglancer/v1.0.0"
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
}

export default new DataTypesStore();