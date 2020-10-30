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

import axios from "axios";
import authStore from "../Stores/AuthStore";
import appStore from "../Stores/AppStore";

const endpoints = {
  "auth": () => "/editor/api/auth/endpoint",
  "user": () => "/editor/api/user",
  "userPicture": () => "/editor/api/user/picture",
  "userInfo": user => `/editor/api/review/user/${user}`,
  "reviewUsers": (from, size, search) => `/editor/api/review/users?from=${from}&size=${size}&search=${search}`,
  "instanceReviews": id => `/editor/api/scopes/${id}`,
  "instanceReviewsByUser": (id, user) => `/editor/api/scopes/${id}/${user}`,
  "features": () => `${window.rootPath}/data/features.json`,
  "instancesList": (stage=null) => `/editor/api/instances/list${stage?`?stage=${stage}`:"" }`,
  "instancesSummary": (stage=null) => `/editor/api/instances/summary${stage?`?stage=${stage}`:"" }`,
  "instancesLabel": (stage=null) => `/editor/api/instances/label${stage?`?stage=${stage}`:"" }`,
  "filterBookmarkInstances": (id, from, size, search) => `/editor/api/instances/filter?bookmarkId=${id}&from=${from}&size=${size}&search=${search}`,
  "searchInstances": (space, type, from, size, searchByLabel) => `/editor/api/summary?space=${space}&type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${searchByLabel}`,
  "suggestions": (id, field, type=null, start, size, search) => `/editor/api/instances/${id}/suggestions?field=${encodeURIComponent(field)}${type?"&type=" + encodeURIComponent(type):""}&start=${start}&size=${size}&search=${search}`,
  "instance": id => `/editor/api/instances/${id}`,
  "instanceScope": id => `/editor/api/instances/${id}/scope`,
  "createInstance": (id=null) => `/editor/api/instances${id?("/" + id):""}?workspace=${appStore.currentWorkspace.id}`,
  "release": id => `/editor/api/releases/${id}/release`,
  "messages": () => "/editor/api/directives/messages",
  "releaseStatusTopInstance": () => "/editor/api/releases/status?releaseTreeScope=TOP_INSTANCE_ONLY",
  "releaseStatusChildren": () => "/editor/api/releases/status?releaseTreeScope=CHILDREN_ONLY",
  "bookmarkList": id => `/editor/api/bookmarkList${id?("/" + id):""}`,
  "bookmarks": () => `/editor/api/workspaces/${appStore.currentWorkspace.id}/bookmarks`,
  "setInstanceBookmarkLists": instance => `/editor/api/instance/${instance}/bookmarks`,
  "neighbors": id => `/editor/api/instances/${id}/neighbors`,
  "workspaceTypes": () => `/editor/api/workspaces/${appStore.currentWorkspace.id}/types`
};

class API {
  constructor() {
    this._axios = axios.create({});
    this._axios.interceptors.request.use(config => {
      if(authStore.keycloak) {
        config.headers.Authorization = "Bearer " + authStore.keycloak.token;
      }
      return Promise.resolve(config);
    });
    this._axios.interceptors.response.use(null, (error) => {
      if (error.response && error.response.status === 401 && !error.config._isRetry) {
        authStore.logout();
        return this.axios.request(error.config);
      } else {
        return Promise.reject(error);
      }
    });
  }

  get axios() {
    return this._axios;
  }

  get endpoints() {
    return endpoints;
  }
}

export default new API();