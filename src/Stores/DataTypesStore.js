import { computed } from "mobx";
import palette from "google-palette";

import structureStore from "./StructureStore";

const dataTypes = [
  {
    "label": "Dataset",
    "dataType": "https://schema.hbp.eu/minds/Dataset",
  },
  {
    "label": "Specimen group",
    "dataType": "https://schema.hbp.eu/minds/Specimengroup",
  },
  {
    "label": "Subject",
    "dataType": "https://schema.hbp.eu/minds/Subject",
  },
  {
    "label": "Activity",
    "dataType": "https://schema.hbp.eu/minds/Activity",
  },
  {
    "label": "Person",
    "dataType": "https://schema.hbp.eu/minds/Person",
  },
  {
    "label": "PLA Component",
    "dataType": "https://schema.hbp.eu/minds/Placomponent",
  },
  {
    "label": "Publication",
    "dataType": "https://schema.hbp.eu/minds/Publication",
  },
  {
    "label": "File Association",
    "dataType": "https://schema.hbp.eu/minds/FileAssociation",
  },
  {
    "label": "DOI",
    "dataType": "https://schema.hbp.eu/minds/DatasetDOI",
  },
  {
    "label": "Method",
    "dataType": "https://schema.hbp.eu/minds/Method",
  },
  {
    "label": "Reference space",
    "dataType": "https://schema.hbp.eu/minds/Referencespace",
  },
  {
    "label": "Parcellation Region",
    "dataType": "https://schema.hbp.eu/minds/Parcellationregion",
    "schema": "minds/core/parcellationregion/v1.0.0"
  },
  {
    "label": "Parcellation Atlas",
    "dataType": "https://schema.hbp.eu/minds/Parcellationatlas"
  },
  {
    "label": "Embargo Status",
    "dataType": "https://schema.hbp.eu/minds/Embargostatus"
  },
  {
    "label": "Approval",
    "dataType": "https://schema.hbp.eu/minds/Approval"
  },
  {
    "label": "Protocol",
    "dataType": "https://schema.hbp.eu/minds/Protocol"
  },
  {
    "label": "Preparation",
    "dataType": "https://schema.hbp.eu/minds/Preparation"
  },
  {
    "label": "Authority",
    "dataType": "https://schema.hbp.eu/minds/Authority"
  },
  {
    "label": "Format",
    "dataType": "https://schema.hbp.eu/minds/Format"
  },
  {
    "label": "License Type",
    "dataType": "https://schema.hbp.eu/minds/Licensetype"
  },
  {
    "label": "Sample",
    "dataType": "https://schema.hbp.eu/minds/ExperimentSample"
  },
  {
    "label": "File",
    "dataType": "https://schema.hbp.eu/minds/File"
  },
  {
    "label": "Software agent",
    "dataType": "https://schema.hbp.eu/minds/Softwareagent"
  },
  {
    "label": "Age category",
    "dataType": "https://schema.hbp.eu/minds/Agecategory"
  },
  {
    "label": "Sex",
    "dataType": "https://schema.hbp.eu/minds/Sex"
  },
  {
    "label": "Species",
    "dataType": "https://schema.hbp.eu/minds/Species"
  },
  {
    "label": "Role",
    "dataType": "https://schema.hbp.eu/minds/Role"
  }
];

class DataTypesStore {

  @computed
  get dataTypes() {
    return dataTypes;
  }

  @computed
  get sortedDataTypes() {
    return this.dataTypes.concat().sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
  }

  @computed
  get dataTypeLabelList() {
    return this.dataTypes.reduce((result, { label }) => {
      if (!result.map[label]) {
        result.map[label] = true;
        result.list.push(label);
      }
      return result;
    }, { list: [], map: {} }).list;
  }

  @computed
  get dataTypeLabels() {
    return structureStore.groupedSchemas.reduce((result, nodeType) => {
      result[nodeType.schema] = nodeType.label;
      return result;
    }, {});
  }

  @computed
  get colorScheme() {
    const colorPalette = palette("mpn65", this.dataTypeLabelList.length);
    return this.dataTypeLabelList.reduce((result, label, index) => {
      result[label] = "#" + colorPalette[index];
      return result;
    }, {});
  }
}

export default new DataTypesStore();