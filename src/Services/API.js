import axios from "axios";
import authStore from "../Stores/AuthStore";

const endpoints = {
  "user": () => "/editor/api/user",
  "userInfo": user => `/editor/api/review/user/${user}`,
  "features": () => `${window.rootPath}/data/features.json`,
  "structure": () => "/statistics/structure.json",
  "perWeekDatasetsStatistics": () => `${window.rootPath}/data/mockups/perWeekDatasetsStatistics.json`,
  "globalDatasetsStatistics": () => `${window.rootPath}/data/mockups/globalDatasetsStatistics.json`,
  "nodeTypes": () => "/editor/api/nodetypes",
  "bookmarkListFolders": mockup => mockup?`${window.rootPath}/data/mockups/lists.json`:"/editor/api/bookmarkListFolders",
  "instances": entity => `/editor/api/instances/${entity}`,
  "listedInstances": () => "/editor/api/instances",
  "listInstances": (entity, from, size, search) => `/editor/api/bookmarkListInstances/${entity}?from=${from}&size=${size}&search=${search}`,
  "instanceData": instance => `/editor/api/instance/${instance}`,
  "releaseData": instance => `/api/releases/${instance}/graph`,
  "doRelease": instance => `/api/releases/${instance}`,
  "releaseStatus": () => "/api/releases",
  "createBookmarkList": () => "/editor/api/bookmarkList",
  "updateBookmarkList": id => `/editor/api/bookmarkList/${id}`,
  "deleteBookmarkList": id => `/editor/api/bookmarkList/${id}`,
  "listInstancesBookmarkLists": () => "/editor/api/bookmarks",
  "setInstanceBookmarkLists": instance => `/editor/api/instance/${instance}/bookmarks`,
  "graph": instance => `/api/instances/${instance}/graph`,
  "performQuery": function(instancePath, vocab, size, start){
    return `/query/${instancePath}/instances${arguments.length > 1?"?":""}${
      ""}${vocab!==undefined && vocab!==null?`vocab=${encodeURIComponent(vocab)}&`:""}${
      ""}${size!==undefined && size!==null?`size=${encodeURIComponent(size)}&`:""}${
      ""}${start!==undefined && start!==null?`start=${encodeURIComponent(start)}&`:""}`;},
  "query": (instancePath, queryId) => `/query/${instancePath}/${encodeURIComponent(queryId)}`,
  "listQueries": instancePath => `/query/${instancePath?"":""}`,
};

class API {
  constructor() {
    this._axios = axios.create({});
    this._axios.interceptors.response.use(null, (error) => {
      if (error.response.status === 401 && !error.config._isRetry) {
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