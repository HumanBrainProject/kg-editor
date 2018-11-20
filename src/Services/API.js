import axios from "axios";
import authStore from "../Stores/AuthStore";

const endpoints = {
  "user": () => "/editor/api/user",
  "features": () => `${window.rootPath}/data/features.json`,
  "statistics": () => `${window.rootPath}/statistics/structure.json`,
  "nodeTypes": () => "/editor/api/nodetypes",
  "bookmarkListFolders": (mockup) => mockup?`${window.rootPath}/data/mockups/lists.json`:"/editor/api/bookmarkListFolders",
  "instances": (entity) => `/editor/api/instances/${entity}`,
  "listInstances": (entity, from, size, search) => `/editor/api/bookmarkListInstances/${entity}?from=${from}&size=${size}&search=${search}`,
  "instanceData": (instance) => `/editor/api/instance/${instance}`,
  "releaseData": (instance) => `/api/releases/${instance}/graph`,
  "doRelease": (instance) => `/api/releases/${instance}`,
  "releaseStatus": () => "/api/releases",
  "createBookmarkList": () => "/editor/api/bookmarkList",
  "updateBookmarkList": (id) => `/editor/api/bookmarkList/${id}`,
  "deleteBookmarkList": (id) => `/editor/api/bookmarkList/${id}`,
  "listInstancesBookmarkLists": () => "/editor/api/bookmarks",
  "setInstanceBookmarkLists": (instance) => `/editor/api/instance/${instance}/bookmarks`,
  "graph": (instance, step) => `/editor/api/graph/${instance}?step=${step}`
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