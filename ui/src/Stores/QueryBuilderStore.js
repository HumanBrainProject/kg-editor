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

import { observable, action, computed, runInAction, toJS } from "mobx";
import { uniqueId, isEqual } from "lodash";
import API from "../Services/API";
import { remove } from "lodash";
import jsonld from "jsonld";

import authStore from "./AuthStore";
import structureStore from "./StructureStore";

const defaultContext = {
  "@vocab": "https://schema.hbp.eu/graphQuery/",
  "query": "https://schema.hbp.eu/myQuery/",
  "fieldname": {
    "@id": "fieldname",
    "@type": "@id"
  },
  "merge": {
    "@type": "@id",
    "@id": "merge"
  },
  "relative_path": {
    "@id": "relative_path",
    "@type": "@id"
  }
};

const rootFieldReservedProperties = ["root_schema", "schema:root_schema", "http://schema.org/root_schema", "identifier", "schema:identifier", "http://schema.org/identifier", "_id", "_key", "_rev", "_createdByUser", "@context", "fields", "merge", "label", "description"];
const fieldReservedProperties = ["fieldname", "relative_path", "merge", "fields"];

const defaultOptions = [
  {
    name: "required",
    value: undefined
  },
  {
    name: "sort",
    value: undefined
  },
  {
    name: "ensure_order",
    value: undefined
  }
];

const namespaceReg = /^(.+):(.+)$/;
const attributeReg = /^https?:\/\/.+\/(.+)$/;
const modelReg = /^\/?((.+)\/(.+)\/(.+)\/(.+))$/;

const getProperties = query => {
  if (!query) {
    return {};
  }
  return Object.entries(query)
    .filter(([name,]) => !rootFieldReservedProperties.includes(name))
    .reduce((result, [name, value]) => {
      result[name] = value;
      return result;
    }, {});
};

class Field {
  @observable schema = null;
  @observable merge = [];
  @observable fields = [];
  @observable alias = null;
  @observable isFlattened = false;
  @observable isMerge = false;
  @observable optionsMap = new Map();
  @observable isUnknown = null;;
  @observable isInvalid = null;
  @observable aliasError = null;

  constructor(schema, parent) {
    this.schema = schema;
    this.parent = parent;
    defaultOptions.forEach(option => this.optionsMap.set(option.name, option.value));
  }

  @computed
  get options() {
    return Array.from(this.optionsMap).map(([name, value]) => ({
      name: name,
      value: toJS(value)
    }));
  }

  @computed
  get _key() {
    if (this.alias) {
      return this.alias;
    }
    return this.schema && this.schema.attribute;
  }

  @computed
  get _uniqueKey() {
    if (this.parent && this.parent.fields && this.parent.fields.length) {
      if (this.parent.fields.some(field => field !== this && field._key === this._key)) {
        return uniqueId("QueryBuilderField_" + this._key);
      }
    }
    return this._key;
  }

  @computed
  get isRootMerge() {
    return this.isMerge && (!this.parent || !this.parent.isMerge);
  }

  @computed
  get parentIsRootMerge() {
    return !this.isRootMerge && this.parent && this.parent.isRootMerge;
  }

  @computed
  get rootMerge() {
    if (!this.isMerge) {
      return null;
    }
    let field = this;
    while (field && !field.isRootMerge) {
      field = field.parent;
    }
    return field;
  }

  @computed
  get hasMergeChild() {
    return this.isRootMerge ? (this.merge && !!this.merge.length) : (this.fields && !!this.fields.length);
  }

  @computed
  get lookups() {
    if (this.merge && !!this.merge.length) {
      const canBe = [];
      this.merge.forEach(field => {
        let mergeField = field;
        while (mergeField) {
          if (mergeField.fields && !!mergeField.fields.length) {
            mergeField = mergeField.fields[0];
          } else {
            if (mergeField.schema && mergeField.schema.canBe && !!mergeField.schema.canBe.length) {
              mergeField.schema.canBe.forEach(schema => {
                if (!canBe.includes(schema)) {
                  canBe.push(schema);
                }
              });
            }
            mergeField = null;
          }
        }
      });
      return canBe;
    }
    return (this.schema && this.schema.canBe && !!this.schema.canBe) ? this.schema.canBe : [];
  }

  getDefaultAlias() {
    let currentField = this;
    while (currentField.isFlattened && currentField.fields[0] && currentField.fields[0].schema && currentField.fields[0].schema.canBe) {
      currentField = currentField.fields[0];
    }
    if (!currentField.schema) {
      return "";
    }
    return currentField.schema.simpleAttributeName || currentField.schema.simplePropertyName || currentField.schema.label || "";
  }

  getOption(name) {
    return this.optionsMap.has(name) ? this.optionsMap.get(name) : undefined;
  }

  @action
  setAlias(value) {
    this.alias = value;
    this.aliasError = (value.trim() === "" && this.isRootMerge);
  }

  @action
  setOption(name, value, preventRecursivity) {
    this.optionsMap.set(name, value);
    if (name === "sort" && value && !preventRecursivity) {
      this.parent.fields.forEach(field => {
        if (field !== this) {
          field.setOption("sort", undefined, true);
        }
      });
    }
  }
}

class QueryBuilderStore {
  @observable queryId = "";
  @observable label = "";
  @observable description = "";
  @observable databaseScope = "RELEASED";
  @observable sourceQuery = null;
  @observable context = null;
  @observable rootField = null;
  @observable fetchQueriesError = null;
  @observable isFetchingQueries = false;
  @observable isSaving = false;
  @observable saveError = null;
  @observable isRunning = false;
  @observable runError = null;
  @observable saveAsMode = false;
  @observable showHeader = true;
  @observable showQueries = false;
  @observable showMyQueries = true;
  @observable showOthersQueries = true;
  @observable saveAsMode = false;
  @observable compareChanges = false;
  @observable specifications = [];
  @observable runStripVocab = true;
  @observable resultSize = 20;
  @observable resultStart = 0;
  @observable.shallow result = null;
  @observable tableViewRoot = ["results"];
  @observable currentTab = "query";
  @observable currentField = null;

  constructor(){
    structureStore.fetchStructure();
  }

  get queryIdRegex() {
    return /^[A-Za-z0-9_-]+$/;
  }

  get queryIdPattern() {
    return this.queryIdRegex.source;
  }

  getLookupsAttributes(lookups) {
    if (!lookups || !lookups.length) {
      return [];
    }
    const result = [];
    lookups.forEach(schemaId => {
      const schema = structureStore.findSchemaById(schemaId);
      const lookup = {
        id: schema.id,
        label: schema.label,
        properties: schema.properties
          .filter(prop => !prop.canBe || !prop.canBe.length)
          .sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0)
      };
      if (lookup.properties.length) {
        result.push(lookup);
      }
    });
    return result;
  }

  getLookupsLinks(lookups) {
    if (!lookups || !lookups.length) {
      return [];
    }
    const result = [];
    lookups.forEach(schemaId => {
      const schema = structureStore.findSchemaById(schemaId);
      const lookup = {
        id: schema.id,
        label: schema.label,
        properties: schema.properties
          .filter(prop => prop.canBe && !!prop.canBe.length)
          .sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0)
      };
      if (lookup.properties.length) {
        result.push(lookup);
      }
    });
    return result;
  }

  @computed
  get currentFieldLookups() {
    if (!this.currentField) {
      return [];
    }
    return this.currentField.lookups;
  }

  @computed
  get currentFieldLookupsAttributes() {
    return this.getLookupsAttributes(this.currentFieldLookups);
  }

  @computed
  get currentFieldLookupsLinks() {
    return this.getLookupsLinks(this.currentFieldLookups);
  }

  @computed
  get currentFieldParentLookups() {
    if (!this.currentField || !this.currentField.parent) {
      return [];
    }
    return this.currentField.parent.lookups;
  }

  @computed
  get currentFieldParentLookupsAttributes() {
    return this.getLookupsAttributes(this.currentFieldParentLookups);
  }

  @computed
  get currentFieldParentLookupsLinks() {
    return this.getLookupsLinks(this.currentFieldParentLookups);
  }

  @computed
  get hasRootSchema() {
    return !!this.rootField && !!this.rootField.schema;
  }

  @computed
  get rootSchema() {
    return this.rootField && this.rootField.schema;
  }

  @computed
  get isQuerySaved() {
    return this.sourceQuery !== null;
  }

  @computed
  get isOneOfMySavedQueries() {
    return this.sourceQuery !== null && this.sourceQuery.user === authStore.user.id;
  }

  @computed
  get isQueryEmpty() {
    //return !this.rootField || !((this.rootField.fields && this.rootField.fields.length) || this.rootField.isMerge);
    return !this.rootField || !this.rootField.fields || !this.rootField.fields.length;
  }

  @computed
  get queryIdAlreadyExists() {
    return this.myQueries.some(spec => spec.id === this.queryId);
  }

  @computed
  get queryIdAlreadyInUse() {
    return this.othersQueries.some(spec => spec.id === this.queryId);
  }

  @computed
  get isQueryIdValid() {
    //window.console.log(this.queryIdRegex.test(this.queryId));
    return this.queryIdRegex.test(this.queryId);
  }

  @computed
  get hasQueryChanged() {
    /*
    if (this.sourceQuery) {
      if (!isEqual(this.JSONQueryFields, toJS(this.sourceQuery.fields))) {
        //window.console.log("Fields:", this.JSONQueryFields, toJS(this.sourceQuery.fields));
        this.JSONQueryFields.forEach((field, index) => {
          const origin = this.sourceQuery.fields[index];
          if (!isEqual(field, toJS(origin))) {
            window.console.log("Field:", field, toJS(origin));
          }
        });
      }
      if (!isEqual(this.JSONQueryProperties, toJS(this.sourceQuery.properties))) {
        window.console.log("Properties:", this.JSONQueryProperties, toJS(this.sourceQuery.properties));
      }
    }
    */
    return !isEqual(this.JSONQuery, this.JSONSourceQuery);
  }

  @computed
  get hasChanged() {
    return (!this.isQueryEmpty && (this.sourceQuery === null
      || (this.saveAsMode && this.queryId !== this.sourceQuery.id)
      || this.hasQueryChanged))
      || (this.isQueryEmpty && this.sourceQuery);
  }

  @computed
  get hasQueries() {
    return this.specifications.length > 0;
  }

  @computed
  get hasMyQueries() {
    return this.myQueries.length > 0;
  }

  @computed
  get hasOthersQueries() {
    return this.othersQueries.length > 0;
  }

  @computed
  get myQueries() {
    if (authStore.hasUserProfile) {
      return this.specifications.filter(spec => spec.user === authStore.user.id).sort((a, b) => a.label - b.label);
    }
    return [];
  }

  @computed
  get othersQueries() {
    if (authStore.hasUserProfile) {
      return this.specifications.filter(spec => spec.user !== authStore.user.id).sort((a, b) => a.label - b.label);
    }
    return this.specifications.sort((a, b) => a.label - b.label);
  }

  @computed
  get JSONQueryFields() {
    const json = {};
    if (this.rootField.merge) {
      this._processMergeFields(json, this.rootField.merge);
    }
    this._processFields(json, this.rootField);
    if (!json.fields) {
      return undefined;
    }
    //Gets rid of the undefined values
    return JSON.parse(JSON.stringify(json.fields));
  }

  @computed
  get JSONQueryProperties() {
    const json = {};
    this.rootField.options.forEach(({ name, value }) => {
      const cleanValue = toJS(value);
      if (cleanValue !== undefined) {
        json[name] = cleanValue;
      }
    });
    const label = this.label ? this.label.trim() : "";
    const description = this.description ? this.description.trim() : "";
    if (label) {
      json["label"] = label;
    }
    if (description) {
      json["description"] = description;
    }
    return json;
  }

  @computed
  get JSONQuery() {
    return Object.assign({}, { "@context": toJS(this.context) }, this.JSONQueryProperties, this.JSONQueryFields ? { fields: this.JSONQueryFields } : {});
  }

  @computed
  get JSONSourceQuery() {
    if (!this.sourceQuery) {
      return null;
    }
    const json = toJS(this.sourceQuery.properties);
    if (this.sourceQuery.label) {
      json["label"] = this.sourceQuery.label;
    }
    if (this.sourceQuery.description) {
      json["description"] = this.sourceQuery.description;
    }
    json["@context"] = toJS(this.sourceQuery.context);
    if (this.sourceQuery.fields) {
      json.fields = toJS(this.sourceQuery.fields);
    }
    return json;
  }

  _processMergeFields(json, merge) {
    const jsonMerge = [];
    merge && !!merge.length && merge.forEach(field => {
      let jsonMergeFields = [];
      let mergeField = field;
      while (mergeField) {
        if (mergeField.schema.attribute) {
          const attribute = (!attributeReg.test(mergeField.schema.attribute) && modelReg.test(mergeField.schema.attribute)) ? mergeField.schema.attribute.match(modelReg)[1] : mergeField.schema.attribute;
          const relativePath = mergeField.schema.attributeNamespace && (mergeField.schema.simpleAttributeName || mergeField.schema.simplePropertyName) ? (mergeField.schema.attributeNamespace + ":" + (mergeField.schema.simpleAttributeName || mergeField.schema.simplePropertyName)) : attribute;
          if (mergeField.schema.reverse) {
            jsonMergeFields.push({
              "@id": relativePath,
              "reverse": true
            });
          } else {
            jsonMergeFields.push(relativePath);
          }
          mergeField = mergeField.fields && mergeField.fields.length && mergeField.fields[0];
        }
      }
      if (jsonMergeFields.length > 1) {
        jsonMerge.push({
          "relative_path": jsonMergeFields
        });
      } else if (jsonMergeFields.length === 1) {
        jsonMerge.push({
          "relative_path": jsonMergeFields[0]
        });
      }
    });
    if (jsonMerge.length > 1) {
      json.merge = jsonMerge;
    } else if (jsonMerge.length === 1) {
      json.merge = jsonMerge[0];
    }
  }

  _processFields(json, field) {
    const jsonFields = [];
    field.fields && !!field.fields.length && field.fields.forEach(field => {
      let jsonField = {};
      jsonField.fieldname = (field.namespace ? field.namespace : "query") + ":" + ((field.alias && field.alias.trim()) || field.schema.simpleAttributeName || field.schema.simplePropertyName || field.schema.label || uniqueId("field"));
      if (field.schema.attribute) {
        const attribute = (!attributeReg.test(field.schema.attribute) && modelReg.test(field.schema.attribute)) ? field.schema.attribute.match(modelReg)[1] : field.schema.attribute;
        const relativePath = field.schema.attributeNamespace && (field.schema.simpleAttributeName || field.schema.simplePropertyName) ? (field.schema.attributeNamespace + ":" + (field.schema.simpleAttributeName || field.schema.simplePropertyName)) : attribute;
        if (field.schema.reverse) {
          jsonField.relative_path = {
            "@id": relativePath,
            "reverse": true
          };
        } else {
          jsonField.relative_path = relativePath;
        }
      }
      field.options.forEach(({ name, value }) => jsonField[name] = toJS(value));
      if (field.merge) {
        this._processMergeFields(jsonField, field.merge);
      }
      if (field.isFlattened) {
        const topField = field;
        jsonField.relative_path = [jsonField.relative_path];
        while (field.isFlattened && field.fields[0]) {
          field = field.fields[0];
          const relativePath = field.schema.attributeNamespace && (field.schema.simpleAttributeName || field.schema.simplePropertyName) ? (field.schema.attributeNamespace + ":" + (field.schema.simpleAttributeName || field.schema.simplePropertyName)) : field.schema.attribute;
          if (field.schema.reverse) {
            jsonField.relative_path.push(
              {
                "@id": relativePath,
                "reverse": true
              }
            );
          } else {
            jsonField.relative_path.push(relativePath);
          }
          if (field.fields && field.fields.length) {
            jsonField.fieldname = (topField.namespace ? topField.namespace : "query") + ":" + (topField.alias || field.schema.simpleAttributeName || field.schema.simplePropertyName || field.schema.label);
          }
          if (field.optionsMap.get("sort")) {
            jsonField["sort"] = true;
          }
        }
      }
      if (field.fields && field.fields.length) {
        this._processFields(jsonField, field);
      }
      jsonFields.push(jsonField);
    });
    if (jsonFields.length > 1) {
      json.fields = jsonFields;
    } else if (jsonFields.length === 1) {
      json.fields = jsonFields[0];
    }
  }

  _processJsonSpecificationFields(parentField, jsonFields) {
    if (!jsonFields) {
      return;
    }
    if (!jsonFields.length) {
      jsonFields = [jsonFields];
    }
    if (parentField && jsonFields && jsonFields.length) {
      jsonFields.forEach(jsonField => {
        let field = null;
        if (jsonField.relative_path) {
          const jsonRP = jsonField.relative_path;
          let isUnknown = false;
          const isFlattened = !!jsonRP && typeof jsonRP !== "string" && jsonRP.length !== undefined && jsonRP.length > 1;
          const relativePath = jsonRP && (typeof jsonRP === "string" ? jsonRP : (isFlattened ? (jsonRP[0] && (typeof jsonRP[0] === "string" ? jsonRP[0] : jsonRP[0]["@id"])) : (typeof jsonRP === "string" ? jsonRP : jsonRP["@id"])));
          const reverse = jsonRP && (typeof jsonRP === "string" ? false : (isFlattened ? (jsonRP[0] && (typeof jsonRP[0] === "string" ? false : jsonRP[0].reverse)) : (typeof jsonRP === "string" ? false : jsonRP.reverse)));
          let attribute = null;
          let attributeNamespace = null;
          let simpleAttributeName = null;
          if (attributeReg.test(relativePath)) {
            attribute = relativePath;
            [, simpleAttributeName] = relativePath.match(attributeReg);

          } else if (namespaceReg.test(relativePath)) {
            [, attributeNamespace, simpleAttributeName] = relativePath.match(namespaceReg);
            attribute = this.context && this.context[attributeNamespace] ? this.context[attributeNamespace] + simpleAttributeName : null;
          } else if (modelReg.test(relativePath)) {
            attribute = relativePath.match(modelReg)[1];
          } else if (relativePath === "@id") {
            attribute = relativePath;
          }
          let property = null;
          if (attribute) {
            parentField.lookups.some(schemaId => {
              const schema = structureStore.findSchemaById(schemaId);
              if (schema && schema.properties && schema.properties.length) {
                property = schema.properties.find(property => property.attribute === attribute && (!jsonField.fields || (jsonField.fields && property.canBe)));
                if (property) {
                  property = toJS(property);
                }
                return !!property;
              }
              return false;
            });
          }
          if (!property) {
            isUnknown = true;
            property = {
              attribute: attribute,
              attributeNamespace: attributeNamespace,
              simpleAttributeName: simpleAttributeName,
              reverse: reverse
            };
          } else if (attributeNamespace) {
            property.attributeNamespace = attributeNamespace;
          }
          field = new Field(property, parentField);
          field.isUnknown = isUnknown;
          field.isFlattened = isFlattened;
        }

        if (jsonField.merge) {
          if (!field) {
            field = new Field({}, parentField);
          }
          field.isMerge = true;
          this._processJsonSpecificationMergeFields(field, jsonField.merge instanceof Array ? jsonField.merge : [jsonField.merge]);
        }
        if (!field) {
          window.console.log("Unknown field: ", jsonField, "possible schemas: ", toJS(parentField.schema.canBe));
          field = new Field({}, parentField);
          field.isInvalid = true;
          field.isUnknown = true;
        }
        if ((jsonField.merge && jsonField.relative_path) || (!jsonField.merge && !jsonField.relative_path)) {
          field.isInvalid = true;
        }
        const [, namespace, fieldname] = namespaceReg.test(jsonField.fieldname) ? jsonField.fieldname.match(namespaceReg) : [null, null, null];
        if (namespace) {
          field.namespace = namespace;
        }
        if (fieldname && fieldname !== field.schema.simpleAttributeName && fieldname !== field.schema.simplePropertyName && fieldname !== field.schema.label) {
          field.alias = fieldname;
        }
        Object.entries(jsonField).forEach(([name, value]) => {
          if (!fieldReservedProperties.includes(name) && !(field.isFlattened && name === "sort")) {
            field.setOption(name, value);
          }
        });
        if (!parentField.fields || parentField.fields.length === undefined) {
          parentField.fields = [];
        }
        parentField.fields.push(field);
        if (field.isFlattened) {
          const flattenRelativePath = jsonField.relative_path.length > 2 ? jsonField.relative_path.slice(1) : jsonField.relative_path[1];
          const childrenJsonFields = [
            {
              relative_path: flattenRelativePath,
              fields: jsonField.fields
            }
          ];
          if (jsonField.sort) {
            childrenJsonFields[0].sort = true;
          }
          this._processJsonSpecificationFields(field, childrenJsonFields);
          if (flattenRelativePath.length || field.fields && field.fields.length === 1) {
            field.isflattened = true;
          }
        } else if (jsonField.fields) {
          this._processJsonSpecificationFields(field, jsonField.fields instanceof Array ? jsonField.fields : [jsonField.fields]);
        }
      });
    }
  }

  _processJsonSpecificationMergeFields(parentField, jsonFields) {
    if (!jsonFields) {
      return;
    }
    if (!jsonFields.length) {
      jsonFields = [jsonFields];
    }
    if (parentField && jsonFields && jsonFields.length) {
      jsonFields.forEach(jsonField => {
        let field = null;
        if (jsonField.relative_path) {
          const jsonRP = jsonField.relative_path;
          let isUnknown = false;
          const isFlattened = !!jsonRP && typeof jsonRP !== "string" && jsonRP.length !== undefined && jsonRP.length > 1;
          const relativePath = jsonRP && (typeof jsonRP === "string" ? jsonRP : (isFlattened ? (jsonRP[0] && (typeof jsonRP[0] === "string" ? jsonRP[0] : jsonRP[0]["@id"])) : (typeof jsonRP === "string" ? jsonRP : jsonRP["@id"])));
          const reverse = jsonRP && (typeof jsonRP === "string" ? false : (isFlattened ? (jsonRP[0] && (typeof jsonRP[0] === "string" ? false : jsonRP[0].reverse)) : (typeof jsonRP === "string" ? false : jsonRP.reverse)));
          let attribute = null;
          let attributeNamespace = null;
          let simpleAttributeName = null;
          if (attributeReg.test(relativePath)) {
            attribute = relativePath;
            [, simpleAttributeName] = relativePath.match(attributeReg);

          } else if (namespaceReg.test(relativePath)) {
            [, attributeNamespace, simpleAttributeName] = relativePath.match(namespaceReg);
            attribute = this.context && this.context[attributeNamespace] ? this.context[attributeNamespace] + simpleAttributeName : null;
          } else if (modelReg.test(relativePath)) {
            attribute = relativePath.match(modelReg)[1];
          } else if (relativePath === "@id") {
            attribute = relativePath;
          }
          let property = null;
          const parentFieldLookup = (parentField.isRootMerge && parentField.parent) ? parentField.parent : parentField;
          if (attribute && parentFieldLookup.schema && parentFieldLookup.schema.canBe && parentFieldLookup.schema.canBe.length) {
            parentFieldLookup.schema.canBe.some(schemaId => {
              const schema = structureStore.findSchemaById(schemaId);
              if (schema && schema.properties && schema.properties.length) {
                property = schema.properties.find(property => property.attribute === attribute && (!jsonField.fields || (jsonField.fields && property.canBe)));
                if (property) {
                  property = toJS(property);
                }
                return !!property;
              }
              return false;
            });
          }
          if (!property) {
            isUnknown = true;
            property = {
              attribute: attribute,
              attributeNamespace: attributeNamespace,
              simpleAttributeName: simpleAttributeName,
              reverse: reverse
            };
          } else if (attributeNamespace) {
            property.attributeNamespace = attributeNamespace;
          }
          field = new Field(property, parentField);
          field.isMerge = true;
          field.isUnknown = isUnknown;
          field.isFlattened = isFlattened;
        }

        if (!field) {
          window.console.log("Unknown field: ", jsonField, "possible schemas: ", toJS(parentField.schema.canBe));
          field = new Field({}, parentField);
          field.isInvalid = true;
          field.isUnknown = true;
        }
        if (parentField.isRootMerge) {
          if (!parentField.merge || parentField.merge.length === undefined) {
            parentField.merge = [];
          }
          parentField.merge.push(field);
        } else {
          if (!parentField.fields || parentField.fields.length === undefined) {
            parentField.fields = [];
          }
          parentField.fields.push(field);
        }
        if (field.isFlattened) {
          const flattenRelativePath = jsonField.relative_path.length > 2 ? jsonField.relative_path.slice(1) : jsonField.relative_path[1];
          const childrenJsonFields = [
            {
              relative_path: flattenRelativePath
            }
          ];
          this._processJsonSpecificationMergeFields(field, childrenJsonFields);
          if (flattenRelativePath.length || field.mergeFields && field.mergeFields.length === 1) {
            field.isflattened = true;
          }
        }
      });
    }
  }

  _processJsonSpecification(schema, merge, fields, properties) {
    if (!schema) {
      return null;
    }
    const rootField = new Field({
      id: schema.id,
      label: schema.label,
      canBe: [schema.id]
    });
    if (merge) {
      rootField.isMerge = true;
      rootField.isInvalid = true;
      this._processJsonSpecificationMergeFields(rootField, merge instanceof Array ? merge : [merge]);
    }
    this._processJsonSpecificationFields(rootField, fields);
    properties && Object.entries(properties).forEach(([name, value]) => rootField.setOption(name, value));
    return rootField;
  }

  checkMergeFields(parent) {
    if (parent.isRootMerge) {
      parent.fields.forEach(field => {
        let isUnknown = true;
        parent.lookups.some(schemaId => {
          const schema = structureStore.findSchemaById(schemaId);
          if (schema && schema.properties && schema.properties.length) {
            if (schema.properties.find(property => property.attribute === field.schema.attribute && ((!field.schema.canBe && !property.canBe) || (isEqual(toJS(field.schema.canBe), toJS(property.canBe)))))) {
              isUnknown = false;
              return true;
            }
          }
          return false;
        });
        field.isUnknown = isUnknown;
      });
    }
  }

  @action
  selectRootSchema(schema) {
    if (!this.isSaving) {
      this.queryId = "";
      this.label = "";
      this.description = "";
      this.context = toJS(defaultContext);
      this.sourceQuery = null;
      this.savedQueryHasInconsistencies = false;
      this.rootField = new Field({
        id: schema.id,
        label: schema.label,
        canBe: [schema.id]
      });
      this.isSaving = false;
      this.saveError = null;
      this.isRunning = false;
      this.runError = null;
      this.saveAsMode = false;
      this.showHeader = true;
      this.showQueries = false;
      this.showMyQueries = true;
      this.showOthersQueries = true;
      this.result = null;
      this.selectField(this.rootField);
      this.fetchQueries();
    }
  }

  @action
  resetRootSchema() {
    if (!this.isSaving) {
      this.queryId = "";
      this.label = "";
      this.description = "";
      this.context = toJS(defaultContext);
      this.sourceQuery = null;
      this.savedQueryHasInconsistencies = false;
      this.rootField = new Field(this.rootField.schema);
      this.isSaving = false;
      this.saveError = null;
      this.isRunning = false;
      this.runError = null;
      this.saveAsMode = false;
      this.showHeader = true;
      this.showQueries = false;
      this.showMyQueries = true;
      this.showOthersQueries = true;
      this.result = null;
      this.selectField(this.rootField);
    }
  }

  @action
  setAsNewQuery() {
    if (!this.isSaving) {
      this.queryId = "";
      this.label = "";
      this.description = "";
      this.sourceQuery = null;
      this.savedQueryHasInconsistencies = false;
      this.isSaving = false;
      this.saveError = null;
      this.isRunning = false;
      this.runError = null;
      this.showHeader = true;
      this.saveAsMode = false;
      this.showQueries = false;
      this.showMyQueries = true;
      this.showOthersQueries = true;
    }
  }

  @action
  addField(schema, parent, gotoField = true) {
    if (parent === undefined) {
      parent = this.showModalFieldChoice || this.rootField;
      this.showModalFieldChoice = null;
    }
    if (!parent.isFlattened || parent.fields.length < 1) {
      const newField = new Field(schema, parent);
      if (parent.isMerge && !parent.isRootMerge) {
        newField.isMerge = true;
        newField.isFlattened = !!newField.lookups.length;
      }
      if (!parent.fields || parent.fields.length === undefined) {
        parent.fields = [];
      }
      parent.fields.push(newField);
      const rootMerge = newField.rootMerge;
      if (rootMerge) {
        this.checkMergeFields(rootMerge);
      }
      if (gotoField) {
        this.selectField(newField);
      }
    }
  }

  @action
  addMergeField(parent, gotoField = true) {
    if (parent === undefined) {
      parent = this.showModalFieldChoice || this.rootField;
      this.showModalFieldChoice = null;
    }
    if (!parent.isRootMerge && parent !== this.rootFields) {
      if (!this.context.merge) {
        this.context.merge = toJS(defaultContext.merge);
      }
      const newField = new Field({}, parent);
      newField.isMerge = true;
      newField.isInvalid = true;
      newField.alias = uniqueId("field");
      if (!parent.fields || parent.fields.length === undefined) {
        parent.fields = [];
      }
      parent.fields.push(newField);
      if (gotoField) {
        this.selectField(newField);
      }
    }
  }

  @action
  addMergeChildField(schema, parent, gotoField = true) {
    if (parent === undefined) {
      parent = this.showModalFieldChoice || this.rootField;
      this.showModalFieldChoice = null;
    }
    if (parent.isRootMerge) {
      const newField = new Field(schema, parent);
      newField.isMerge = true;
      newField.isFlattened = !!newField.lookups.length;
      if (!parent.merge || parent.merge.length === undefined) {
        parent.merge = [];
      }
      parent.merge.push(newField);
      parent.isInvalid = (parent.merge.length < 2);
      this.checkMergeFields(parent);
      if (gotoField) {
        this.selectField(newField);
      }
    }
  }

  @action
  removeField(field) {
    if (field === this.rootField) {
      this.rootField = null;
      this.queryId = "";
      this.label = "";
      this.description = "";
      this.sourceQuery = null;
      this.context = null;
      this.specifications = [];
      this.saveError = null;
      this.runError = null;
      this.saveAsMode = false;
      this.sourceQuery = null;
      this.savedQueryHasInconsistencies = false;
      this.closeFieldOptions();
    } else {
      if (field === this.currentField) {
        this.closeFieldOptions();
      }
      if (field.isMerge && field.parentIsRootMerge) {
        remove(field.parent.merge, parentField => field === parentField);
        field.parent.isInvalid = (field.parent.merge.length < 2);
        this.checkMergeFields(field.parent);
      } else {
        remove(field.parent.fields, parentField => field === parentField);
        const rootMerge = field.rootMerge;
        if (rootMerge) {
          this.checkMergeFields(rootMerge);
        }
      }
    }
  }

  @action
  toggleRunStripVocab(state) {
    this.runStripVocab = state !== undefined ? !!state : !this.runStripVocab;
  }

  @action
  selectTab(tab) {
    this.currentTab = tab;
  }

  @action
  selectField(field) {
    this.currentField = field;
    this.currentTab = "fieldOptions";
  }

  @action
  closeFieldOptions() {
    this.currentField = null;
    this.currentTab = "query";
  }

  @action
  selectQuery(query) {
    if (!this.isSaving
      && this.rootField && this.rootField.schema && this.rootField.schema.id
      && query && !query.isDeleting) {
      this.queryId = query.id + "-Copy";
      this.label = query.label;
      this.description = query.description;
      if (this.sourceQuery !== query) { // reset
        this.showHeader = true;
      }
      this.sourceQuery = query;
      this.context = toJS(query.context);
      this.rootField = this._processJsonSpecification(toJS(this.rootField.schema), toJS(query.merge), toJS(query.fields), toJS(query.properties));
      this.isSaving = false;
      this.saveError = null;
      this.isRunning = false;
      this.runError = null;
      this.saveAsMode = false;
      this.showQueries = false;
      this.result = null;
      this.selectField(this.rootField);
      this.savedQueryHasInconsistencies = this.hasQueryChanged;
    }
  }

  @action
  async executeQuery() {
    if (!this.isQueryEmpty && !this.isRunning) {
      this.isRunning = true;
      this.runError = false;
      this.result = null;
      try {
        const payload = this.JSONQuery;
        const response = await API.axios.post(API.endpoints.performQuery(this.rootField.schema.id, this.runStripVocab ? "https://schema.hbp.eu/myQuery/" : undefined, this.resultSize, this.resultStart, this.databaseScope), payload);
        runInAction(() => {
          this.tableViewRoot = ["results"];
          this.result = response.data;
          this.isRunning = false;
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        this.result = null;
        this.runError = `Error while executing query (${message})`;
        this.isRunning = false;
      }
    }
  }

  @action
  setResultSize(size) {
    this.resultSize = size;
  }

  @action
  setResultStart(start) {
    this.resultStart = start;
  }

  @action
  setDatabaseScope(scope) {
    this.databaseScope = scope;
  }

  @action
  returnToTableViewRoot(index) {
    this.tableViewRoot = this.tableViewRoot.slice(0, index + 1);
  }

  @action
  appendTableViewRoot(index, key) {
    this.tableViewRoot.push(index);
    this.tableViewRoot.push(key);
  }

  @action
  cancelChanges() {
    if (this.sourceQuery) {
      this.selectQuery(this.sourceQuery);
    } else if (!this.isSaving) {
      this.rootField.fields = [];
    }
  }

  @action
  async saveQuery() {
    if (!this.isQueryEmpty && this.isQueryIdValid && !this.queryIdAlreadyInUse && !this.isSaving && !this.saveError && !(this.sourceQuery && this.sourceQuery.isDeleting)) {
      this.isSaving = true;
      if (this.sourceQuery && this.sourceQuery.deleteError) {
        this.sourceQuery.deleteError = null;
      }
      const queryId = this.saveAsMode ? this.queryId : this.sourceQuery.id;
      const payload = this.JSONQuery;
      try {
        await API.axios.put(API.endpoints.query(this.rootField.schema.id, queryId), payload);
        runInAction(() => {
          if (!this.saveAsMode && this.sourceQuery && this.sourceQuery.user === authStore.user.id) {
            this.sourceQuery.label = payload.label;
            this.sourceQuery.description = payload.description;
            this.sourceQuery.context = payload["@context"];
            this.sourceQuery.merge = payload.merge,
            this.sourceQuery.fields = payload.fields;
            this.sourceQuery.properties = getProperties(payload);
          } else if (!this.saveAsMode && this.queryIdAlreadyExists) {
            this.sourceQuery = this.specifications.find(spec => spec.id === queryId);
            this.sourceQuery.label = payload.label;
            this.sourceQuery.description = payload.description;
            this.sourceQuery.specification = payload;
          } else {
            this.sourceQuery = {
              id: queryId,
              user: authStore.user.id,
              context: payload["@context"],
              merge: payload.merge,
              fields: payload.fields,
              properties: getProperties(payload),
              label: payload.label,
              description: payload.description,
              isDeleting: false,
              deleteError: null
            };
            this.specifications.push(this.sourceQuery);
          }
          this.saveAsMode = false;
          this.isSaving = false;
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        this.saveError = `Error while saving query "${queryId}" (${message})`;
        this.isSaving = false;
      }
    }
  }

  @action
  cancelSaveQuery() {
    if (!this.isSaving) {
      this.saveError = null;
    }
  }

  @action
  async deleteQuery(query) {
    if (query && !query.isDeleting && !query.deleteError && !(query === this.sourceQuery && this.isSaving)) {
      query.isDeleting = true;
      try {
        await API.axios.delete(API.endpoints.query(this.rootField.schema.id, query.id));
        runInAction(() => {
          query.isDeleting = false;
          if (query === this.sourceQuery) {
            this.sourceQuery = null;
          }
          const index = this.specifications.findIndex(spec => spec.id === query.id);
          if (index !== -1) {
            this.specifications.splice(index, 1);
          }
        });
      } catch (e) {
        const message = e.message ? e.message : e;
        query.deleteError = `Error while deleting query "${query.id}" (${message})`;
        query.isDeleting = false;
      }
    }
  }

  @action
  cancelDeleteQuery(query) {
    if (query && !query.isDeleting) {
      query.deleteError = null;
    }
  }

  @action
  async fetchQueries() {
    if (!this.isFetchingQueries) {
      this.specifications = [];
      this.fetchQueriesError = null;
      if (this.rootField && this.rootField.schema && this.rootField.schema.id) {
        this.isFetchingQueries = true;
        try {
          const response = await API.axios.get(API.endpoints.listQueries(this.rootField.schema.id));
          runInAction(() => {
            this.specifications = [];
            this.showMyQueries = true;
            this.showOthersQueries = true;
            const jsonSpecifications = response && response.data && response.data.length ? response.data : [];
            //const reg = /^(.+)\/(.+)\/(.+)\/v(\d+)\.(\d+)\.(\d+)\/(.+)$/;
            const reg = /^specification_queries\/(.+)-(.+)-(.+)-v(\d+)_(\d+)_(\d+)-(.+)$/;
            jsonSpecifications.forEach(jsonSpec => {
              if (jsonSpec && jsonSpec["@context"] && reg.test(jsonSpec._id)) { //jsonSpec["http://schema.org/identifier"]
                const [, org, domain, schemaName, vMn, vmn, vpn, queryId] = jsonSpec._id.match(reg);
                const schemaId = `${org}/${domain}/${schemaName}/v${vMn}.${vmn}.${vpn}`;
                if (schemaId === this.rootField.schema.id) { //isQueryIdValid(queryId) &&
                  jsonld.expand(jsonSpec, (expandErr, expanded) => {
                    if (!expandErr) {
                      jsonld.compact(expanded, jsonSpec["@context"], (compactErr, compacted) => {
                        if (!compactErr) {
                          //window.console.log(compacted);
                          this.specifications.push({
                            id: queryId,
                            org: org,
                            user: jsonSpec._createdByUser,
                            context: compacted["@context"],
                            merge: compacted.merge,
                            fields: compacted.fields,
                            properties: getProperties(compacted),
                            label: jsonSpec.label ? jsonSpec.label : "",
                            description: jsonSpec.description ? jsonSpec.description : "",
                            isDeleting: false,
                            deleteError: null
                          });
                        }
                        else {
                          window.console.log("error: was not able to compact JSON-LD", compactErr);
                        }
                      });
                    }
                    else {
                      window.console.log("error: was not able to expand JSON-LD", expandErr);
                    }
                  });
                }
              }
            });
            if (this.sourceQuery) {
              const query = this.specifications.find(spec => spec.id === this.sourceQuery.id);
              if (query) {
                this.sourceQuery = query;
              } else {
                this.sourceQuery = null;
              }
            }
            this.isFetchingQueries = false;
          });
        } catch (e) {
          this.specifications = [];
          const message = e.message ? e.message : e;
          this.fetchQueriesError = `Error while fetching saved queries for "${this.rootField.id}" (${message})`;
          this.isFetchingQueries = false;
        }
      }
    }
  }
}

export default new QueryBuilderStore();