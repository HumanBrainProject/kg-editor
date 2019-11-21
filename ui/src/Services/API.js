import axios from "axios";
import authStore from "../Stores/AuthStore";
import appStore from "../Stores/AppStore";

const endpoints = {
  "auth": () => "/editor/api/auth/endpoint",
  "user": () => "/editor/api/user",
  "userInfo": user => `/editor/api/review/user/${user}`,
  "reviewUsers": (from, size, search) => `/editor/api/review/users?from=${from}&size=${size}&search=${search}`,
  "instanceReviews": id => `/editor/api/scopes/${id}`,
  "instanceReviewsByUser": (id, user) => `/editor/api/scopes/${id}/${user}`,
  "features": () => `${window.rootPath}/data/features.json`,
  "structureStatistics": () => "/statistics/structure.json",
  "perWeekDatasetsStatistics": () => `${window.rootPath}/data/mockups/perWeekDatasetsStatistics.json`,
  "globalDatasetsStatistics": () => `${window.rootPath}/data/mockups/globalDatasetsStatistics.json`,
  "instancesList": (stage=null) => `/editor/api/instances/list${stage?`?stage=${stage}`:"" }`,
  "instancesSummary": (stage=null) => `/editor/api/instances/summary${stage?`?stage=${stage}`:"" }`,
  "instancesLabel": (stage=null) => `/editor/api/instances/label${stage?`?stage=${stage}`:"" }`,
  "filterBookmarkInstances": (id, from, size, search) => `/editor/api/instances/filter?bookmarkId=${id}&from=${from}&size=${size}&search=${search}`,
  "searchInstances": (type, from, size, searchByLabel) => `/editor/api/summary?type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${searchByLabel}`,
  "suggestions": (id, field, type=null, start, size, search) => `/editor/api/instances/${id}/suggestions?field=${encodeURIComponent(field)}${type?"&type=" + encodeURIComponent(type):""}&start=${start}&size=${size}&search=${search}`,
  "instance": id => `/editor/api/instances/${id}`,
  "createInstance": (id=null) => `/editor/api/instances${id?("/" + id):""}?workspace=${appStore.currentWorkspace}`,
  "getInstance": id => `/editor/api/instances/${id}?returnPermissions=true&metadata=true`,
  "release": id => `/editor/api/instances/${id}/release`,
  "messages": () => "/editor/api/directives/messages",
  "releaseStatusTopInstance": () => "/editor/api/instances/releases?releaseTreeScope=TOP_INSTANCE_ONLY",
  "releaseStatusChildren": () => "/editor/api/instances/releases?releaseTreeScope=CHILDREN_ONLY",
  "bookmarkList": id => `/editor/api/bookmarkList${id?("/" + id):""}`,
  "bookmarks": () => `/editor/api/workspaces/${appStore.currentWorkspace}/bookmarks`,
  "setInstanceBookmarkLists": instance => `/editor/api/instance/${instance}/bookmarks`,
  "graph": id => `/editor/api/instances/${id}/graph`,
  "workspaceTypes": () => `/editor/api/workspaces/${appStore.currentWorkspace}/types`
};

class API {
  constructor() {
    this._axios = axios.create({});
    this._axios.interceptors.request.use(config => {
      if(authStore.keycloak) {
        config.headers.Authorization = "Bearer " + authStore.accessToken;
      }
      return Promise.resolve(config);
    });
    this._axios.interceptors.response.use(null, (error) => {
      if (error.response && error.response.status === 401 && !error.config._isRetry) {
        return authStore.logout().then(()=>{
          error.config.headers.Authorization = "Bearer " + authStore.accessToken;
          error.config._isRetry = true;
          return this.axios.request(error.config);
        });
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