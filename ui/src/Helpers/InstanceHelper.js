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

import {toJS} from "mobx";

export const normalizeInstanceData = (data, transformField=null) => {

  // TODO: Remove the mockup, this is just a test for embedded
  // data.fields["http://schema.org/address"] = {
  //   type: "Nested",
  //   fullyQualifiedName: "http://schema.org/address",
  //   name: "address",
  //   label: "Address",
  //   min:0,
  //   max: Number.POSITIVE_INFINITY,
  //   value: [
  //     {
  //       "http://schema.org/addressLocality": "Springfield",
  //       "http://schema.org/streetAddress": "742 Evergreen Terrace",
  //       "http://schema.org/country" : [
  //         {id: "e583e6a5-d621-4724-90aa-8706326ede44"},
  //         {id: "933048fa-f314-4a70-8839-0ce346ac0c36"},
  //         {id: "ced19d52-78e7-4e3f-a68b-6e42ba77d83b"}
  //       ],
  //       "http://schema.org/zipCode": [
  //         { "http://schema.org/test": "Testing...",
  //           "http://schema.org/region":  [
  //             {id: "f9590f64-b8f9-4d70-a966-7af3b60ea2ae"},
  //             {id: "3b10cce0-c452-4217-94b4-631fff56d854"},
  //             {id: "8f3a518b-8224-447c-bf41-0da18797d969"}
  //           ]
  //         }
  //       ]
  //     }
  //   ],
  //   fields: {
  //     "http://schema.org/addressLocality": {
  //       fullyQualifiedName: "http://schema.org/addressLocality",
  //       name: "addressLocality",
  //       label: "Address Locality",
  //       type: "InputText"
  //     },
  //     "http://schema.org/streetAddress": {
  //       fullyQualifiedName: "http://schema.org/streetAddress",
  //       name: "streetAddress",
  //       label: "Street Address",
  //       type: "InputText"
  //     },
  //     "http://schema.org/country" : {
  //       fullyQualifiedName: "http://schema.org/country",
  //       name: "country",
  //       label: "Country",
  //       type: "DropdownSelect",
  //       isLink: true,
  //       allowCustomValues: true
  //     },
  //     "http://schema.org/zipCode": {
  //       type: "Nested",
  //       fullyQualifiedName: "http://schema.org/zipCode",
  //       name: "zipCode",
  //       label: "Zip Code",
  //       min:0,
  //       max: Number.POSITIVE_INFINITY,
  //       fields: {
  //         "http://schema.org/test": {
  //           fullyQualifiedName: "http://schema.org/test",
  //           name: "test",
  //           label: "Test",
  //           type: "InputText"
  //         },
  //         "http://schema.org/region" :{
  //           fullyQualifiedName: "http://schema.org/region",
  //           name: "region",
  //           label: "Region",
  //           type: "DropdownSelect",
  //           isLink: true,
  //           allowCustomValues: true
  //         }
  //       }
  //     }
  //   }
  // };
  // data.fields["http://schema.org/origin"] = {
  //   fullyQualifiedName: "http://schema.org/origin",
  //   name: "origin",
  //   label: "Origin",
  //   type: "DropdownSelect",
  //   isLink: true,
  //   allowCustomValues: true,
  //   value: [{id: "5fc91798-7bde-43c3-98b4-931b30c8c410"},
  //     {id: "5fc91798-7bde-43c3-98b4-931b30c8c410"},
  //     {id: "cfc1656c-67d1-4d2c-a17e-efd7ce0df88c"}
  //   ]
  // };
  // END of TODO

  const normalizeFields = fields => {
    for(let fieldKey in fields) {
      const field = fields[fieldKey];
      // TODO: temporary, please remove. This is just a test for proof of concept.
      // if (!field.type) {
      //   if (["http://schema.org/children", "http://schema.org/colleague", "http://schema.org/spouse", "http://schema.org/affiliation"].includes(fieldKey)) {
      //     field.type = "DropdownSelect";
      //   } else {
      //     field.type = "InputText";
      //   }
      // }
      // END of temporary
      typeof transformField === "function"  && transformField(field);
      if(field.type === "Nested"){
        field.topAddButton = false;
        if(!field.min) {
          field.min = 0;
        }
        if(!field.max) {
          field.max = Number.POSITIVE_INFINITY;
        }
        if (typeof field.fields === "object") {
          normalizeFields(field.fields);
        }
      } else if(field.type === "InputText"){
        field.type = "KgInputText";
      } else if(field.type === "TextArea"){
        field.type = "KgTextArea";
      }
      else if(field.type === "DropdownSelect" || field.type === "DynamicDropdown"  || field.type === "KgTable"){
        if(field.type === "DropdownSelect") {
          field.type = "DynamicDropdown";
        }
        field.instanceId = instance.id;
        field.isLink = true;
        field.mappingLabel = "name";
        field.mappingValue = "id";
        field.mappingReturn = "id";
        field.mappingIsIdentifier = true;
        field.closeDropdownAfterInteraction = true;
      }
    }
  };

  const instance = {id: null, types: [], primaryType: {name: "", color: "", label: ""}, workspace: "", name: "", fields: {}, labelField: null, promotedFields: [], alternatives: {}, metadata: {}, permissions: {}, error: null};
  if (!data) {
    return instance;
  }
  if (data.id) {
    instance.id = data.id;
  }
  if (data.types instanceof Array) {
    instance.types = data.types;
    if (instance.types.length) {
      instance.primaryType = instance.types[0];
    }
  }
  if (data.workspace) {
    instance.workspace = data.workspace;
  }
  if (data.name) {
    instance.name = data.name;
  }
  if (data.labelField) {
    instance.labelField = data.labelField;
  }
  if (data.promotedFields instanceof Array) {
    instance.promotedFields = data.promotedFields;
  }
  if (typeof data.fields === "object") {
    normalizeFields(data.fields);
    instance.fields = data.fields;
  }
  if (typeof data.alternatives === "object") {
    instance.alternatives = data.alternatives;
  }
  if (typeof data.metadata === "object") {
    const metadata = data.metadata;
    instance.metadata = Object.keys(metadata).map(key => {
      if(key == "lastUpdateAt" || key == "createdAt") {
        const d = new Date(metadata[key].value);
        metadata[key].value = d.toLocaleString();
      }
      return metadata[key];
    });
  }
  if (typeof data.permissions === "object") {
    instance.permissions = data.permissions;
  }
  if (typeof data.error === "object") {
    instance.error = data.error;
  }
  return instance;
};

export const getChildrenIdsGroupedByField = fields => {
  function getPagination(field) {
    if (field.type === "KgTable") {
      const total = field.instances.length;
      if (total) {
        return {
          count: field.visibleInstancesCount?field.visibleInstancesCount:0,
          total: total
        };
      }
    }
    return null;
  }

  function showId(field, id) {
    if (id) {
      if (field.type === "KgTable") {
        if (field.defaultVisibleInstances) {
          return true;
        }
        const instance = field.instancesMap.get(id);
        return !!instance && !!instance.show;
      }
      return true;
    }
    return false;
  }

  function getIds(field, values, mappingValue) {
    return  Array.isArray(values)?values.map(obj => obj[mappingValue]).filter(id => showId(field, id)):[];
  }

  function getGroup(field, values) {
    const ids = getIds(field, values, field.mappingValue);
    if (ids.length) {
      const group = {
        //name: field.name,
        label: field.label,
        ids: ids
      };
      const pagination = getPagination(field);
      if (pagination) {
        group.pagination = pagination;
      }
      return group;
    }
    return null;
  }

  function getGroups(field, values) {
    const groups = [];
    if (field.type === "Nested") {
      groups.push(...getNestedFields(field.fields, values));
    } else if(field.isLink) {
      const group = getGroup(field, values);
      if (group) {
        groups.push(group);
      }
    }
    return groups;
  }

  function getNestedFields(fields, vals) {
    return Object.entries(fields).reduce((acc, [fieldKey, field]) => {
      const values = vals.flatMap(v => v[fieldKey].value);
      const groups = getGroups(field, values);
      acc.push(...groups);
      return acc;
    }, []);
  }

  return fields.reduce((acc, field) => {
    const values = toJS(field.value);
    const groups = getGroups(field, values);
    acc.push(...groups);
    return acc;
  }, []);
};