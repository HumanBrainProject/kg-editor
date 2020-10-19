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

import { observable, action, runInAction, computed } from "mobx";
import { debounce } from "lodash";

import API from "../Services/API";
import appStore from "./AppStore";

class UsersStore {
  @observable users = new Map();
  @observable isFetchingSearch = false;
  @observable isSearchFetched = false;
  @observable searchFetchError = null;
  @observable searchResult = [];
  @observable searchFilter = {
    queryString: "",
    excludedUsers: []
  };
  @observable totalSearchCount = 0;

  searchPageStart = 0;
  searchPageSize = 20;

  @computed
  get hasSearchFilter() {
    return this.searchFilter.queryString !== "";
  }

  @computed
  get canLoadMoreResults() {
    if (!this.hasSearchFilter || this.isFetchingSearch || this.searchFetchError || !this.searchResult.length) {
      return false;
    }

    return this.searchResult.length < this.totalSearchCount;
  }

  applySearchFilter = debounce(() => {
    this.searchUsers();
  }, 750);

  @action
  getUser(userId) {
    return this.users.get(userId);
  }

  @action
  addUser(user, clearSearch = false) {
    if (user && user.id && !this.users.has(user.id)) {
      this.users.set(user.id, Object.assign({}, user, {
        isFetching: false,
        isFetched: true,
        hasFetchError: false,
        fetchError: null
      }));
      if (clearSearch) {
        this.clearSearch();
      }
    }
  }

  @action
  async fetchUser(userId) {
    let user = this.users.get(userId);
    if (!user) {
      this.users.set(userId, {
        id: userId,
        username: null,
        name: null,
        givenName: null,
        familyName: null,
        emails: [],
        picture: null,
        profileUrl: null,
        isCurator: false,
        isFetching: false,
        isFetched: false,
        hasFetchError: false,
        fetchError: null
      });
      user = this.users.get(userId);
    }
    if (!user.isFetching && (!user.isFetched || user.hasFetchError)) {
      try {
        user.isFetching = true;
        user.hasFetchError = false;
        user.fetchError = null;
        const { data } = await API.axios.get(API.endpoints.userInfo(userId));
        runInAction(() => {
          const userData = data && data.data;
          user.username = userData && userData.username;
          user.name = userData && userData.name;
          user.givenName = userData && userData.givenName;
          user.familyName = userData && userData.familyName;
          user.emails = userData && userData.emails instanceof Array ? userData.emails : [];
          user.picture = userData && userData.picture;
          user.isCurator = !!userData && !!userData.isCurator;
          user.isFetching = false;
          user.isFetched = true;
        });
      } catch (e) {
        runInAction(() => {
          user.username = null;
          user.name = null;
          user.givenName = null;
          user.familyName = null;
          user.emails = [];
          user.picture = null;
          user.isCurator = false;
          const error = e.message ? e.message : e;
          user.fetchError = `Error while retrieving user "${userId}" (${error})`;
          user.hasFetchError = true;
          user.isFetched = true;
          user.isFetching = false;
        });
        appStore.captureSentryException(e);
      }
    }
    return user;
  }

  @action
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

  @action
  clearSearch() {
    this.searchFilter.queryString = "";
    this.searchFilter.excludedUsers = [];
    this.searchResult = [];
    this.isSearchFetched = false;
    this.isFetchingSearch = false;
    this.totalSearchCount = 0;
  }

  @action
  async searchUsers(loadMore = false) {
    if (!this.hasSearchFilter) {
      this.clearSearch();
    } else {
      try {
        if (loadMore) {
          if (!this.searchFetchError) {
            this.searchPageStart++;
          }
        } else {
          this.searchPageStart = 0;
          this.searchResult = [];
        }
        this.isFetchingSearch = true;
        this.searchFetchError = null;

        const { data } = await API.axios.get(API.endpoints.reviewUsers(this.searchPageStart * this.searchPageSize, this.searchPageSize, this.searchFilter.queryString));
        runInAction(() => {
          if (!this.hasSearchFilter) {
            this.clearSearch();
          } else {
            this.isSearchFetched = true;
            this.isFetchingSearch = false;
            let result = [];
            if (loadMore) {
              result = [...this.searchResult, ...((data && data.data && data.data.users) ? data.data.users : [])];
            } else {
              result = (data && data.data && data.data.users) ? data.data.users : [];
            }
            if (this.searchFilter.excludedUsers && this.searchFilter.excludedUsers.length) {

              this.searchResult = result.filter(user => !this.searchFilter.excludedUsers.includes(user.id));
            } else {
              this.searchResult = result;
            }
            this.totalSearchCount = data.total !== undefined ? (data.total - (result.length - this.searchResult.length)) : 0;
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
        appStore.captureSentryException(e);
      }
    }
  }
}

export default new UsersStore();