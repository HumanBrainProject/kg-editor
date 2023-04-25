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

import { observable, action, runInAction, computed, makeObservable } from "mobx";
import debounce from "lodash/debounce";

export class UserStore {
  isFetchingSearch = false;
  isSearchFetched = false;
  searchFetchError = null;
  searchResult = [];
  searchFilter = {
    queryString: "",
    excludedUsers: []
  };
  totalSearchCount = 0;

  api = null;

  constructor(api) {
    makeObservable(this, {
      isFetchingSearch: observable,
      isSearchFetched: observable,
      searchFetchError: observable,
      searchResult: observable,
      searchFilter: observable,
      totalSearchCount: observable,
      hasSearchFilter: computed,
      setSearchFilter: action,
      clearSearch: action,
      searchUsers: action
    });

    this.api = api;
  }

  get hasSearchFilter() {
    return this.searchFilter.queryString !== "";
  }

  applySearchFilter = debounce(() => {
    this.searchUsers();
  }, 750);

  setSearchFilter(queryString, excludedUsers = []) {
    if (!queryString) {
      queryString = "";
    }
    if (queryString === "") {
      this.clearSearch();
    } else if (queryString !== this.searchFilter.queryString) {
      this.searchFilter.queryString = queryString;
      this.searchFilter.excludedUsers = excludedUsers;
      this.isFetchingSearch = true;
      this.applySearchFilter();
    }
  }

  clearSearch() {
    this.searchFilter.queryString = "";
    this.searchFilter.excludedUsers = [];
    this.searchResult = [];
    this.isSearchFetched = false;
    this.isFetchingSearch = false;
    this.totalSearchCount = 0;
  }

  async searchUsers() {
    if (!this.hasSearchFilter) {
      this.clearSearch();
    } else {
      try {
        this.searchResult = [];
        this.isFetchingSearch = true;
        this.searchFetchError = null;
        const data = await this.api.getUsersForReview(this.searchFilter.queryString);
        runInAction(() => {
          if (!this.hasSearchFilter) {
            this.clearSearch();
          } else {
            this.isSearchFetched = true;
            this.isFetchingSearch = false;
            if (this.searchFilter.excludedUsers && this.searchFilter.excludedUsers.length) {
              this.searchResult = data.filter(user => !this.searchFilter.excludedUsers.includes(user.id));
            } else {
              this.searchResult = data;
            }
            this.totalSearchCount = this.searchResult.length;
          }
        });
      } catch (e) {
        runInAction(() => {
          if (!this.hasSearchFilter) {
            this.clearSearch();
          } else {
            const message = e.message ? e.message : e;
            this.searchFetchError = `Error while searching users (${message})`;
            this.isSearchFetched = true;
            this.isFetchingSearch = false;
          }
        });
      }
    }
  }
}

export default UserStore;