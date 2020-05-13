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
  },
  {
    "schema": "demo/core/dataset/v1.0.0"
  },
  {
    "schema": "demo/core/person/v1.0.0"
  },
  {
    "schema": "demo/core/subject/v1.0.0"
  },
  {
    "schema": "demo/core/file/v1.0.0"
  },
  {
    "schema": "simpsons/core/person/v1.0.0"
  },
  {
    "schema": "simpsons/core/episode/v1.0.0"
  },
  {
    "schema": "simpsons/core/food/v1.0.0"
  },
  {
    "schema": "simpsons/core/address/v1.0.0"
  },
  {
    "schema": "simpsons/core/saying/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/applicationcategory/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/applicationsubcategory/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/device/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/fileformat/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/keyword/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/language/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/license/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/operatingsystem/v1.0.0"
  },
  {
    "schema": "softwarecatalog/options/programminglanguage/v1.0.0"
  },
  {
    "schema": "softwarecatalog/software/software/v0.1.2"
  },
  {
    "schema": "softwarecatalog/software/software/v1.0.0"
  },
  {
    "schema": "softwarecatalog/software/softwarefeature/v0.1.0"
  },
  {
    "schema": "softwarecatalog/software/softwarefeature/v1.0.0"
  },
  {
    "schema": "softwarecatalog/software/softwarefeaturecategory/v0.1.0"
  },
  {
    "schema": "softwarecatalog/software/softwarefeaturecategory/v1.0.0"
  },
  {
    "schema": "softwarecatalog/software/softwarefeaturesubcategory/v0.1.0"
  },
  {
    "schema": "softwarecatalog/software/softwareproject/v0.1.0"
  },
  {
    "schema": "softwarecatalog/software/softwareproject/v1.0.0"
  },
  {
    "schema": "neuralactivity/core/person/v0.1.0"
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
