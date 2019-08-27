import axios from "axios";
import authStore from "../Stores/AuthStore";

const redirectUri = `${window.location.protocol}//${window.location.host}${window.rootPath || ""}/loginSuccess`;

const endpoints = {
  "login": () => `/editor/api/auth/login?redirect_uri=${escape(redirectUri)}`,
  "user": () => "/editor/api/user",
  "userInfo": user => `/editor/api/review/user/${user}`,
  "reviewUsers": (from, size, search) => `/editor/api/review/users?from=${from}&size=${size}&search=${search}`,
  "instanceReviews": instance => `/editor/api/scopes/${instance}`,
  "instanceReviewsByUser": (instance, user) => `/editor/api/scopes/${instance}/${user}`,
  "features": () => `${window.rootPath}/data/features.json`,
  "structureStatistics": () => "/statistics/structure.json",
  "perWeekDatasetsStatistics": () => `${window.rootPath}/data/mockups/perWeekDatasetsStatistics.json`,
  "globalDatasetsStatistics": () => `${window.rootPath}/data/mockups/globalDatasetsStatistics.json`,
  "bookmarkListFolders": mockup => mockup?`${window.rootPath}/data/mockups/lists.json`:"/editor/api/bookmarkListFolders",
  "listedInstances": (allFields=false, databaseScope=null) => `/editor/api/instances?allFields=${allFields}${databaseScope?("&databaseScope=" + databaseScope):""}`,
  "listInstances": (entity, from, size, search) => `/editor/api/bookmarkListInstances/${entity}?from=${from}&size=${size}&search=${search}`,
  "suggestions": (entity, field, type, start, size, search) => `/editor/api/suggestions/${entity}/fields?field=${encodeURIComponent(field)}&fieldType=${encodeURIComponent(type)}&start=${start}&size=${size}&search=${search}`,
  "instanceData": (instance, databaseScope=null) => `/editor/api/instances/${instance}${databaseScope?("?databaseScope=" + databaseScope):""}`,
  "release": instance => `/editor/api/instances/${instance}/release`,
  "messages": () => "/editor/api/directives/messages",
  "releaseStatusTopInstance": () => "/editor/api/instances/releases?releaseTreeScope=TOP_INSTANCE_ONLY",
  "releaseStatusChildren": () => "/editor/api/instances/releases?releaseTreeScope=CHILDREN_ONLY",
  "bookmarkList": id => `/editor/api/bookmarkList${id?("/" + id):""}`,
  "listInstancesBookmarkLists": () => "/editor/api/bookmarks",
  "setInstanceBookmarkLists": instance => `/editor/api/instance/${instance}/bookmarks`,
  "graph": instance => `/editor/api/instances/${instance}/graph`,
  "structure": () => "/editor/api/structure?withLinks=true",
  "performQuery": function(instancePath, vocab, size, start, databaseScope){
    return `/editor/api/query/${instancePath}/instances${arguments.length > 1?"?":""}${
      ""}${vocab!==undefined && vocab!==null?`vocab=${encodeURIComponent(vocab)}&`:""}${
      ""}${size!==undefined && size!==null?`size=${encodeURIComponent(size)}&`:""}${
      ""}${start!==undefined && start!==null?`start=${encodeURIComponent(start)}&`:""}${
      ""}${databaseScope?`databaseScope=${databaseScope}`:"" }`;},
  "query": (instancePath, queryId) => `/editor/api/query/${instancePath}/${encodeURIComponent(queryId)}`,
  "listQueries": () => "/editor/api/query"
};

class API {
  constructor() {
    this._axios = axios.create({});
    this._axios.interceptors.response.use(null, (error) => {
      if (error.response && error.response.status === 401 && !error.config._isRetry) {
        return authStore.logout(true).then(()=>{
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
    this.reloadToken();
    return this._axios;
  }

  reloadToken() {
    Object.assign(this._axios.defaults, {
      headers: { Authorization: "Bearer " + authStore.accessToken },
      withCredentials: true
    });
  }

  get endpoints() {
    return endpoints;
  }
}

export default new API();