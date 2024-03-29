/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import { observable, action, computed, makeObservable } from 'mobx';
import type { StructureOfType } from '../types';

export class TypeStore {
  space?: string;
  types: StructureOfType[] = [];
  isAvailableTypesEnabled = false;
  availableTypes: StructureOfType[] = [];

  constructor() {
    makeObservable(this, {
      space: observable,
      types: observable,
      nonEmbeddedTypes: computed,
      canCreateTypes: computed,
      hasCanCreateTypes: computed,
      typesMap: computed,
      isAvailableTypesEnabled: observable,
      availableTypes: observable,
      setTypes: action,
      addTypes: action,
      removeType: action,
      setAvailableTypes: action,
      clear: action
    });
  }

  filterTypes(term: string) {
    term = term?.trim().toLowerCase();
    if (term) {
      return this.nonEmbeddedTypes.filter(type =>
        type.label.toLowerCase().includes(term)
      );
    }
    return this.nonEmbeddedTypes;
  }

  get nonEmbeddedTypes() {
    return this.types.filter(t => !t.embeddedOnly);
  }

  get canCreateTypes() {
    return this.nonEmbeddedTypes.filter(
      t => t.canCreate !== false && t.isSupported
    );
  }

  get hasCanCreateTypes() {
    return !!this.canCreateTypes.length;
  }

  isTypesSupported(typeNames: string[]) {
    return typeNames.some(name => this.typesMap.get(name)?.isSupported);
  }

  get typesMap() {
    const map = new Map<string, StructureOfType>();
    if (this.types.length) {
      return this.types.reduce(
        (acc, current) => acc.set(current.name, current),
        map
      );
    }
    return map;
  }

  setTypes(space: string, types: StructureOfType[]) {
    this.space = space;
    this.types = types;
  }

  addTypes(space: string, types: string[], relatedTypes: StructureOfType[]) {
    if (this.space === space) {
      const typesMap = this.typesMap;
      relatedTypes.forEach(type => {
        if (!typesMap.has(type.name)) {
          this.types.push(type);
        }
      });
      this.types.sort((a, b) => a.label.localeCompare(b.label));
      this.availableTypes = this.availableTypes.filter(type => !types.includes(type.name));
    }
  }

  removeType(space: string, type: StructureOfType) {
    if (this.space === space) {
      this.types = this.types.filter(t => t.name !== type.name);
      this.types.sort((a, b) => a.label.localeCompare(b.label));
      this.availableTypes.push(type);
      this.availableTypes.sort((a, b) => a.label.localeCompare(b.label));
    }
  }

  setAvailableTypes(space: string, types: StructureOfType[]) {
    if (this.space === space) {
      this.isAvailableTypesEnabled = true;
      this.availableTypes = types;
    } else {
      this.availableTypes = [];
    }
  }

  clear() {
    this.space = undefined;
    this.types = [];
    this.isAvailableTypesEnabled = false;
    this.availableTypes = [];
  }
}

export default TypeStore;
