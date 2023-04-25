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

import { observable, action, computed, runInAction, makeObservable } from "mobx";

export class TypeStore {
  space = null;
  types = [];
  typesMap = new Map();
  fetchError = null;
  isFetching = false;
  isFetched = false;

  api = null;
  rootStore = null;

  constructor(api, rootStore) {
    makeObservable(this, {
      space: observable,
      types: observable,
      typesMap: observable,
      fetchError: observable,
      isFetching: observable,
      isFetched: observable,
      filteredTypes: computed,
      fetch: action
    });

    this.api = api;
    this.rootStore = rootStore;
  }

  filteredList(term) {
    term = term && term.trim().toLowerCase();
    if(term) {
      return this.filteredTypes.filter(type => type.label.toLowerCase().includes(term));
    }
    return this.filteredTypes;
  }

  get filteredTypes() {
    return this.types.filter(t => !t.embeddedOnly);
  }

  isTypesSupported(typeNames) {
    return typeNames.some(name => {
      const type = this.typesMap.get(name);
      return type && type.isSupported;
    });
  }

  async fetch(space) {
    if (!this.isFetching && (this.fetchError || space !== this.space)) {
      if (space) {
        this.space = space;
        this.types = [];
        this.isFetching = true;
        this.fetchError = null;
        this.isFetched = false;
        try {
          const data = await this.api.getSpaceTypes(space);
          runInAction(() => {
            this.types = data.length ?
              data.map(type => ({
                ...type,
                isSupported:  type.fields instanceof Object && !!Object.keys(type.fields).length
              }))
              :[];
            if(!this.types.length) {
              this.fetchError = "This space is currently empty, please add some instances or type specifications.";
              this.isFetching = false;
              this.isFetched = false;
            } else {
              this.typesMap = this.types.reduce((acc, current) => acc.set(current.name, current), new Map());
              this.isFetching = false;
              this.isFetched = true;
            }
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            this.fetchError = `There was a problem retrieving the types (${message}). If the problem persists, please contact the support.`;
            this.isFetching = false;
            this.types = [];
            this.isFetched = false;
          });
        }
      } else {
        this.types = [];
        this.fetchError = null;
        this.isFetched = false;
      }
    }
  }
}

export default TypeStore;
