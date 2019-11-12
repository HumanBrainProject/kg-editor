import { observable, action, runInAction } from "mobx";
import { FormStore } from "hbp-quickfire";

import API from "../Services/API";
import appStore from "./AppStore";
import { normalizeInstanceData } from "../Helpers/InstanceHelper";

const maxItems = 100;

const transformField = field  =>  {
  if(field.type === "TextArea") {
    field.value = field.value.substr(0, 197) + "...";
    delete field.label;
  }
};

class HistoryStore {
  @observable instancesHistory = [];

  @observable instances = [];
  @observable isFetching = false;
  @observable fetchError = null;

  constructor(){
    if (localStorage.getItem("instancesHistory")) {
      try {
        this.instancesHistory = JSON.parse(localStorage.getItem("instancesHistory"));
        if (!(this.instancesHistory instanceof Array)) {
          this.instancesHistory  = [];
        }
      } catch (e) {
        this.instancesHistory = [];
      }
    }
  }

  @action
  updateInstanceHistory(id, type, mode, remove) {
    if (!appStore.currentWorkspace) {
      return;
    }
    let index = -1;
    this.instancesHistory.some((instance, idx) => {
      if (instance.id === id && instance.workspace === appStore.currentWorkspace && instance.mode === mode) {
        index = idx;
        return true;
      }
      return false;
    });
    if (index !== -1) {
      this.instancesHistory.splice(index, 1);
    } else if (this.instancesHistory.length >= maxItems) {
      this.instancesHistory.pop();
    }
    if (!remove) {
      this.instancesHistory.unshift({id: id, type: type, workspace: appStore.currentWorkspace, mode: mode});
    }
    localStorage.setItem("instancesHistory", JSON.stringify(this.instancesHistory));
    return this.instancesHistory;
  }

  @action
  getFileredInstancesHistory(type, modes, max=10) {
    if (!appStore.currentWorkspace) {
      return [];
    }
    if (typeof type === "string") {
      type = type.toLowerCase().trim();
      if (type === "") {
        type = null;
      }
    }
    if (!modes) {
      modes = [];
    } else if (!Array.isArray(modes)) {
      modes = [modes];
    }
    max = Number(max);
    return this.instancesHistory
      .filter(instance => {
        if (instance.workspace !== appStore.currentWorkspace) {
          return false;
        }
        if (typeof type === "string" && instance.type.includes(type)) {
          return false;
        }
        if (!modes.length) {
          return true;
        }
        return modes.includes(instance.mode);
      })
      .reduce((result, instance) => {
        if (!result.map[instance.id]) {
          result.map[instance.id] = true;
          result.history.push(instance.id);
        }
        return result;
      }, {map: {}, history: []}).history
      .slice(0, isNaN(max) || max < 0?0:max);
  }

  @action
  async fetchInstances(list) {
    if (!list.length) {
      this.instances = [];
      this.isFetching = false;
      this.fetchError = null;
    } else {
      try {
        this.instances = [];
        this.isFetching = true;
        this.fetchError = null;
        const { data } = await API.axios.post(API.endpoints.instancesSummary(), list);
        runInAction(() => {
          this.isFetching = false;
          this.instances = (data && data.data instanceof Array)?data.data.map(item => {
            const instance = normalizeInstanceData(item, transformField);
            instance.formStore = new FormStore(instance);
            instance.formStore.toggleReadMode(true);
            return instance;
          }):[];
        });
      } catch (e) {
        runInAction(() => {
          const message = e.message?e.message:e;
          this.fetchError = `Error while retrieving history instances (${message})`;
          this.isFetching = false;
        });
      }
    }
  }

}

export default new HistoryStore();