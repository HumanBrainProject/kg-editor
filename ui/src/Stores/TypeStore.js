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

import { observable, action, computed, runInAction, makeObservable } from "mobx";

export class TypeStore {
  types = [];
  typesMap = new Map();
  fetchError = null;
  isFetching = false;

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore) {
    makeObservable(this, {
      types: observable,
      typesMap: observable,
      fetchError: observable,
      isFetching: observable,
      isFetched: computed,
      fetch: action
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  filteredList(term) {
    term = typeof term === "string" && term.trim().toLowerCase();
    if(term) {
      return this.types.filter(type => type && typeof type.label === "string" && type.label.toLowerCase().includes(term));
    }
    return this.types;
  }

  get isFetched() {
    return !this.fetchError && this.types.length;
  }

  async fetch(forceFetch=false) {
    if (!this.isFetching && (!this.types.length || !!forceFetch)) {
      this.isFetching = true;
      this.fetchError = null;
      try {
        const response = await this.transportLayer.getWorkspaceTypes(this.rootStore.appStore.currentWorkspace.id);
        runInAction(() => {
          this.types = (response.data && response.data.data && response.data.data.length)?response.data.data:[];
          this.typesMap = this.types.reduce((acc, current) => acc.set(current.name, current), new Map());
          this.isFetching = false;
        });
      } catch (e) {
        runInAction(() => {
          const message = e.message ? e.message : e;
          this.fetchError = `Error while fetching types (${message})`;
          this.isFetching = false;
        });
      }
    }
  }
}

export default TypeStore;
