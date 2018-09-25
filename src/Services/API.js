import axios from "axios";
import authStore from "../Stores/AuthStore";

const endpoints = {
  "nodeTypes": () => `${window.rootPath}/api/nodetypes`,
  "instances": (entity) => `${window.rootPath}/api/instances/${entity}`,
  "listInstances": (entity, from, size, search) => `${window.rootPath}/api/instances/${entity}?from=${from}&size=${size}&search=${search}`,
  "instanceData": (instance) => `${window.rootPath}/api/instance/${instance}`,
  "releaseData": (instance) => `${window.rootPath}/api/release/${instance}`,
  "graph": (instance, step) => `${window.rootPath}/api/graph/${instance}?step=${step}`
};

class API {
  constructor() {
    this._axios = axios.create({
      headers: {
        Authorization: "Bearer " + authStore.accessToken
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