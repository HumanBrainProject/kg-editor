import axios from "axios";
import authStore from "../Stores/AuthStore";

const endpoints = {
  "nodeTypes": () => `${window.rootPath}/api/nodetypes`,
  "instances": (entity) => `${window.rootPath}/api/instances/${entity}`,
  "listInstances": (entity, from, size, search) => `${window.rootPath}/api/instances/${entity}?from=${from}&size=${size}&search=${search}`,
  "instanceData": (instance) => `${window.rootPath}/api/instance/${instance}`,
  "releaseData": (instance) => `${window.rootPath}/api/release/${instance}`,
  "doRelease": () => `${window.rootPath}/release`,
  "releaseStatus": () => `${window.rootPath}/api/releasestatus`,
  "listFavorites": () => `${window.rootPath}/api/favorites`,
  "addFavorite": () => `${window.rootPath}/api/favorite`,
  "listInstancesFavorites": () => `${window.rootPath}/api/instancesFavorites`,
  "setInstanceFavorites": (instance) => `${window.rootPath}/api/instanceFavorites/${instance}`,
  "graph": (instance, step) => `${window.rootPath}/api/graph/${instance}?step=${step}`
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