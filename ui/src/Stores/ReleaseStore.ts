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

import {
  observable,
  action,
  runInAction,
  computed,
  makeObservable
} from "mobx";
import API from "../Services/API";
import RootStore from "./RootStore";

const setNodeTypesAndSortChildren = node => {
  node.typesName = node.types.reduce(
    (acc, current) => `${acc}${acc.length ? ", " : ""}${current.label}`,
    ""
  );
  if (Array.isArray(node.children) && node.children.length) {
    node.children.forEach((child) => setNodeTypesAndSortChildren(child)); // Change child permissions here in case you want to test permissions.
    node.children = node.children.sort((a, b) => {
      const ta = a.typesName.toUpperCase();
      const tb = b.typesName.toUpperCase();
      if (ta === tb) {
        if (!a.label && !b.label) {
            return 0;
        }
        if (!a.label) {
          return 1;
        }
        if (!b.label) {
          return -1;
        }
        return a.label.toUpperCase().localeCompare(b.label.toUpperCase());
      }
      return ta.localeCompare(tb);
    });
  }
};

const removeDuplicates = (node, ids) => {
  if (typeof node === "object" && Array.isArray(node.children)) {
    if (!(ids instanceof Set)) {
      ids = new Set();
      ids.add(node.id);
    }
    node.children = node.children.filter((n) => {
      if (ids.has(n.id)) {
        return false;
      }
      ids.add(n.id);
      return true;
    });
    node.children.forEach((c) => removeDuplicates(c, ids));
    if (!node.children.length) {
      delete node.children;
    }
  }
};

const populateStatuses = (node, prefix = "") => {
  if (node.permissions.canRelease) {
    node[prefix + "childrenStatus"] = null;
    if (node.children && node.children.length > 0) {
      let childrenStatuses = node.children.map((child) =>
        populateStatuses(child, prefix)
      );
      if (childrenStatuses.some((status) => status === "UNRELEASED")) {
        node[prefix + "childrenStatus"] = "UNRELEASED";
        node[prefix + "globalStatus"] = "UNRELEASED";
      } else if (childrenStatuses.some((status) => status === "HAS_CHANGED")) {
        node[prefix + "childrenStatus"] = "HAS_CHANGED";
        node[prefix + "globalStatus"] =
          node[prefix + "status"] === "UNRELEASED"
            ? "UNRELEASED"
            : "HAS_CHANGED";
      } else {
        node[prefix + "childrenStatus"] = "RELEASED";
        node[prefix + "globalStatus"] = node[prefix + "status"];
      }
    } else {
      node[prefix + "childrenStatus"] = null;
      node[prefix + "globalStatus"] = node[prefix + "status"];
    }
    return node[prefix + "globalStatus"];
  }
};

const processChildrenInstanceList = (node, list, level, hideReleasedInstances) => {
  if (
    !hideReleasedInstances ||
    node.status === "UNRELEASED" ||
    node.status === "HAS_CHANGED" ||
    node.childrenStatus === "UNRELEASED" ||
    node.childrenStatus === "HAS_CHANGED" ||
    node.pending_status !== node.status ||
    node.pending_childrenStatus !== node.childrenStatus
  ) {
    const obj = { node: node, level: level };
    list.push(obj);
    node.children && node.children.forEach((child) => processChildrenInstanceList(child, list, level + 1, hideReleasedInstances));
  }
};
export class ReleaseStore {
  topInstanceId?: string;
  instancesTree = null;
  isFetching = false;
  isFetched = false;
  isSaving = false;
  savingTotal = 0;
  savingProgress = 0;
  savingErrors = [];
  savingLastEndedNode = null;
  savingLastEndedRequest = "";
  fetchError = null;
  saveError = null;
  isStopped = false;
  hideReleasedInstances = false;
  comparedInstance = null;

  historyStore = null;
  statusStore = null;

  api: API;
  rootStore: RootStore;

  constructor(api: API, rootStore: RootStore) {
    makeObservable(this, {
      topInstanceId: observable,
      instancesTree: observable,
      isFetching: observable,
      isFetched: observable,
      isSaving: observable,
      savingTotal: observable,
      savingProgress: observable,
      savingErrors: observable,
      savingLastEndedNode: observable,
      savingLastEndedRequest: observable,
      fetchError: observable,
      saveError: observable,
      isStopped: observable,
      hideReleasedInstances: observable,
      comparedInstance: observable,
      setComparedInstance: action,
      treeStats: computed,
      instanceList: computed,
      toggleHideReleasedInstances: action,
      stopRelease: action,
      setTopInstanceId: action,
      fetchReleaseData: action,
      commitStatusChanges: action,
      releaseNode: action,
      unreleaseNode: action,
      afterSave: action,
      dismissSaveError: action,
      markNodeForChange: action,
      markAllNodeForChange: action,
      recursiveMarkNodeForChange: action,
    });

    this.api = api;
    this.rootStore = rootStore;
  }

  setComparedInstance(instance) {
    this.comparedInstance = instance;
  }

  get treeStats() {
    if (!this.isFetched) {
      return null;
    }

    const count = {
      total: 0,
      released: 0,
      not_released: 0,
      has_changed: 0,
      pending_released: 0,
      pending_not_released: 0,
      pending_has_changed: 0,
      proceed_release: 0,
      proceed_unrelease: 0,
      proceed_do_nothing: 0
    };

    const getStatsFromNode = node => {
      count.total++;
      if (node.status === "RELEASED") {
        count.released++;
      }
      if (node.status === "UNRELEASED") {
        count.not_released++;
      }
      if (node.status === "HAS_CHANGED") {
        count.has_changed++;
      }

      if (node.pending_status === "RELEASED") {
        count.pending_released++;
      }
      if (node.pending_status === "UNRELEASED") {
        count.pending_not_released++;
      }
      if (node.pending_status === "HAS_CHANGED") {
        count.pending_has_changed++;
      }

      if (node.status === node.pending_status) {
        count.proceed_do_nothing++;
      } else {
        if (node.pending_status === "RELEASED") {
          count.proceed_release++;
        } else {
          count.proceed_unrelease++;
        }
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => getStatsFromNode(child));
      }
    };

    getStatsFromNode(this.instancesTree);

    return count;
  }

  get instanceList() {
    const result = [];
    if (this.instancesTree) {
      processChildrenInstanceList(this.instancesTree, result, 0, this.hideReleasedInstances);
    }
    return result;
  }

  getNodesToProceed() {
    const nodesByStatus = {
      RELEASED: [],
      UNRELEASED: []
    };

    const rseek = node => {
      if (node.permissions && node.permissions.canRelease) {
        if (node.status !== node.pending_status) {
          nodesByStatus[node.pending_status].push(node);
        }
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => rseek(child));
        }
      }
    };
    rseek(this.instancesTree);
    nodesByStatus.RELEASED = Array.from(new Set(nodesByStatus.RELEASED));
    nodesByStatus.UNRELEASED = Array.from(new Set(nodesByStatus.UNRELEASED));
    return nodesByStatus;
  }

  toggleHideReleasedInstances(hideReleasedInstances?: boolean) {
    this.hideReleasedInstances =
      hideReleasedInstances === undefined
        ? !this.hideReleasedInstances
        : !!hideReleasedInstances;
  }

  stopRelease() {
    this.isStopped = true;
  }

  setTopInstanceId(instanceId: string) {
    this.topInstanceId = instanceId;
  }

  async fetchReleaseData() {
    if (this.isFetching) {
      return;
    }
    this.isFetched = false;
    this.isFetching = true;
    this.fetchError = null;
    try {
      const { data } = await this.api.getInstanceScope(this.topInstanceId);
      runInAction(() => {
        this.hideReleasedInstances = false;
        populateStatuses(data);
        // Default release state
        this.recursiveMarkNodeForChange(data, null); // "RELEASED"
        populateStatuses(data, "pending_");
        setNodeTypesAndSortChildren(data);
        removeDuplicates(data); // after sorting!
        this.instancesTree = data;
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.fetchError = message;
        this.isFetching = false;
      });
    }
  }

  async commitStatusChanges() {
    let nodesToProceed = this.getNodesToProceed();
    this.savingProgress = 0;
    this.savingTotal =
      nodesToProceed["UNRELEASED"].length + nodesToProceed["RELEASED"].length;
    this.savingErrors = [];
    this.isStopped = false;
    if (!this.savingTotal) {
      return;
    }
    this.savingLastEndedRequest = "Initializing actions...";
    this.isSaving = true;

    for (
      let i = 0;
      i < nodesToProceed["RELEASED"].length && !this.isStopped;
      i++
    ) {
      const node = nodesToProceed["RELEASED"][i];
      await this.releaseNode(node);
    }

    for (
      let i = 0;
      i < nodesToProceed["UNRELEASED"].length && !this.isStopped;
      i++
    ) {
      const node = nodesToProceed["UNRELEASED"][i];
      await this.unreleaseNode(node);
    }

    this.afterSave();
  }

  async releaseNode(node) {
    try {
      await this.api.releaseInstance(node.id);
      runInAction(() => {
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} released successfully`;
        this.savingLastEndedNode = node;
        this.rootStore.historyStore.updateInstanceHistory(
          node.id,
          "released",
          false
        );
      });
    } catch (e) {
      runInAction(() => {
        this.savingErrors.push({ node: node, message: e.message });
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to release this instance`;
        this.savingLastEndedNode = node;
      });
    } finally {
      runInAction(() => {
        this.savingProgress++;
      });
    }
  }

  async unreleaseNode(node) {
    try {
      await this.api.unreleaseInstance(node.id);
      runInAction(() => {
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} unreleased successfully`;
        this.savingLastEndedNode = node;
        this.rootStore.historyStore.updateInstanceHistory(
          node.id,
          "released",
          true
        );
      });
    } catch (e) {
      runInAction(() => {
        this.savingErrors.push({ node: node, message: e.message });
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to unrelease this instance`;
        this.savingLastEndedNode = node;
      });
    } finally {
      runInAction(() => {
        this.savingProgress++;
      });
    }
  }

  afterSave() {
    if (
      (this.savingErrors.length === 0 &&
        this.savingProgress === this.savingTotal) ||
      this.isStopped
    ) {
      setTimeout(() => {
        runInAction(() => {
          this.isSaving = false;
          this.rootStore.statusStore.flush();
          this.savingErrors = [];
          this.savingTotal = 0;
          this.savingProgress = 0;
          this.fetchReleaseData();
        });
      }, 2000);
    }
  }

  dismissSaveError() {
    this.isSaving = false;
    this.rootStore.statusStore.flush();
    this.savingErrors = [];
    this.savingTotal = 0;
    this.savingProgress = 0;
    this.fetchReleaseData();
  }

  markNodeForChange(node, newStatus) {
    node.pending_status = newStatus;
    populateStatuses(this.instancesTree, "pending_");
  }

  markAllNodeForChange(node, newStatus) {
    this.recursiveMarkNodeForChange(node || this.instancesTree, newStatus);
    populateStatuses(this.instancesTree, "pending_");
  }

  recursiveMarkNodeForChange(node, newStatus) {
    if (node.permissions.canRelease) {
      node.pending_status = newStatus ? newStatus : node.status;
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) =>
          this.recursiveMarkNodeForChange(child, newStatus)
        );
      }
    }
  }


}
export default ReleaseStore;