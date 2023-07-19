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
} from 'mobx';
import { ReleaseStatus, ViewMode } from '../types';
import type RootStore from './RootStore';
import type API from '../Services/API';
import type { APIError } from '../Services/API';
import type { ReleaseScope, UUID} from '../types';

interface  ReleaseResult {
  node: ReleaseScope;
  level: number;
}

interface SavingErrors {
  node: ReleaseScope;
  message?: string;
}

interface NodesByStatus {
  RELEASED: ReleaseScope[];
  UNRELEASED: ReleaseScope[];
}

const setNodeTypesAndSortChildren = (node: ReleaseScope) => {
  node.typesName = node.types.reduce(
    (acc, current) => `${acc}${acc.length ? ', ' : ''}${current.label}`,
    ''
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

const removeDuplicates = (node: ReleaseScope, ids?: Set<UUID>) => {
  if (typeof node === 'object' && Array.isArray(node.children)) {
    const _ids = ids ?? new Set<UUID>(node.id);
    node.children = node.children.filter((n) => {
      if (_ids.has(n.id)) {
        return false;
      }
      _ids.add(n.id);
      return true;
    });
    node.children.forEach((c) => removeDuplicates(c, _ids));
    if (!node.children.length) {
      delete node.children;
    }
  }
};

const setReleaseScopeChildrenStatus = (node: ReleaseScope, pending: boolean, status?: ReleaseStatus) => {
  if (pending) {
    node.pending_childrenStatus = status??undefined;
  } else {
    node.childrenStatus = status??undefined;
  }
};

const setReleaseScopeGlobalStatus = (node: ReleaseScope, pending: boolean, status?: ReleaseStatus) => {
  if (pending) {
    node.pending_globalStatus = status??undefined;
  } else {
    node.globalStatus = status??undefined;
  }
};

const getReleaseScopeStatus = (node: ReleaseScope, pending: boolean) : ReleaseStatus|undefined => {
  if (pending) {
    return node.pending_status;
  }
  return node.status;
};

const getReleaseScopeGlobalStatus = (node: ReleaseScope, pending: boolean) : ReleaseStatus|undefined => {
  if (pending) {
    return node.pending_globalStatus;
  }
  return node.globalStatus;
};

const populateStatuses = (node: ReleaseScope, pending: boolean) => {
  if (node.permissions.canRelease) {
    setReleaseScopeChildrenStatus(node, pending);
    if (node.children && node.children.length > 0) {
      const childrenStatuses = node.children.map((child) =>
        populateStatuses(child, pending)
      );
      if (childrenStatuses.some((status) => status === ReleaseStatus.UNRELEASED)) {
        setReleaseScopeChildrenStatus(node, pending, ReleaseStatus.UNRELEASED);
        setReleaseScopeGlobalStatus(node, pending, ReleaseStatus.UNRELEASED);
      } else if (childrenStatuses.some((status) => status === ReleaseStatus.HAS_CHANGED)) {
        setReleaseScopeChildrenStatus(node, pending, ReleaseStatus.HAS_CHANGED);
        setReleaseScopeGlobalStatus(node, pending, getReleaseScopeStatus(node, pending) === ReleaseStatus.UNRELEASED? ReleaseStatus.UNRELEASED: ReleaseStatus.HAS_CHANGED);
      } else {
        setReleaseScopeChildrenStatus(node, pending, ReleaseStatus.RELEASED);
        setReleaseScopeGlobalStatus(node, pending, getReleaseScopeStatus(node, pending));
      }
    } else {
      setReleaseScopeChildrenStatus(node, pending);
      setReleaseScopeGlobalStatus(node, pending, getReleaseScopeStatus(node, pending));
    }
    return getReleaseScopeGlobalStatus(node, pending);
  }
};

const processChildrenInstanceList = (node: ReleaseScope, list: ReleaseResult[], level: number, hideReleasedInstances: boolean) => {
  if (
    !hideReleasedInstances ||
    node.status === ReleaseStatus.UNRELEASED ||
    node.status === ReleaseStatus.HAS_CHANGED ||
    node.childrenStatus === ReleaseStatus.UNRELEASED ||
    node.childrenStatus === ReleaseStatus.HAS_CHANGED ||
    node.pending_status !== node.status ||
    node.pending_childrenStatus !== node.childrenStatus
  ) {
    const obj: ReleaseResult = { node: node, level: level };
    list.push(obj);
    node.children && node.children.forEach((child) => processChildrenInstanceList(child, list, level + 1, hideReleasedInstances));
  }
};
export class ReleaseStore {
  topInstanceId?: string;
  instancesTree?: ReleaseScope;
  isFetching = false;
  isFetched = false;
  isSaving = false;
  savingTotal = 0;
  savingProgress = 0;
  savingErrors: SavingErrors[] = [];
  savingLastEndedNode?: ReleaseScope;
  savingLastEndedRequest = '';
  fetchError?: string;
  saveError = null;
  isStopped = false;
  hideReleasedInstances = false;
  comparedInstance?: ReleaseScope;

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

  setComparedInstance(instance: ReleaseScope | undefined) {
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

    const getStatsFromNode = (node: ReleaseScope) => {
      count.total++;
      if (node.status === ReleaseStatus.RELEASED) {
        count.released++;
      }
      if (node.status === ReleaseStatus.UNRELEASED) {
        count.not_released++;
      }
      if (node.status === ReleaseStatus.HAS_CHANGED) {
        count.has_changed++;
      }

      if (node.pending_status === ReleaseStatus.RELEASED) {
        count.pending_released++;
      }
      if (node.pending_status === ReleaseStatus.UNRELEASED) {
        count.pending_not_released++;
      }
      if (node.pending_status === ReleaseStatus.HAS_CHANGED) {
        count.pending_has_changed++;
      }

      if (node.status === node.pending_status) {
        count.proceed_do_nothing++;
      } else {
        if (node.pending_status === ReleaseStatus.RELEASED) {
          count.proceed_release++;
        } else {
          count.proceed_unrelease++;
        }
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child: ReleaseScope) => getStatsFromNode(child));
      }
    };

    if(this.instancesTree) {
      getStatsFromNode(this.instancesTree);
    }

    return count;
  }

  get instanceList() {
    const result: ReleaseResult[] = [];
    if (this.instancesTree) {
      processChildrenInstanceList(this.instancesTree, result, 0, this.hideReleasedInstances);
    }
    return result;
  }

  getNodesToProceed() {
    const nodesByStatus: NodesByStatus = {
      RELEASED: [],
      UNRELEASED: []
    };

    const rseek = (node: ReleaseScope) => {
      if (node.permissions && node.permissions.canRelease) {
        if (node.pending_status && node.status !== node.pending_status) {
          if (node.pending_status === ReleaseStatus.RELEASED) {
            nodesByStatus.RELEASED.push(node);
          } else if (node.pending_status === ReleaseStatus.UNRELEASED) {
            nodesByStatus.UNRELEASED.push(node);
          }
        }
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => rseek(child));
        }
      }
    };
    if(this.instancesTree) {
      rseek(this.instancesTree);
    }
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
    if (this.isFetching || !this.topInstanceId) {
      return;
    }
    this.isFetched = false;
    this.isFetching = true;
    this.fetchError = undefined;
    try {
      const { data } = await this.api.getInstanceScope(this.topInstanceId);
      const releaseScope = data as ReleaseScope;
      runInAction(() => {
        this.hideReleasedInstances = false;
        populateStatuses(releaseScope, false);
        // Default release state
        this.recursiveMarkNodeForChange(releaseScope); // "RELEASED"
        populateStatuses(releaseScope, true);
        setNodeTypesAndSortChildren(releaseScope);
        removeDuplicates(releaseScope); // after sorting!
        this.instancesTree = releaseScope;
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch (e) {
      const err = e as APIError;
      runInAction(() => {
        this.fetchError = err?.message;
        this.isFetching = false;
      });
    }
  }

  async commitStatusChanges() {
    const nodesToProceed = this.getNodesToProceed();
    this.savingProgress = 0;
    this.savingTotal =
      nodesToProceed.UNRELEASED.length + nodesToProceed.RELEASED.length;
    this.savingErrors = [];
    this.isStopped = false;
    if (!this.savingTotal) {
      return;
    }
    this.savingLastEndedRequest = 'Initializing actions...';
    this.isSaving = true;

    for (
      let i = 0;
      i < nodesToProceed.RELEASED.length && !this.isStopped;
      i++
    ) {
      const node = nodesToProceed.RELEASED[i];
      await this.releaseNode(node);
    }

    for (
      let i = 0;
      i < nodesToProceed.UNRELEASED.length && !this.isStopped;
      i++
    ) {
      const node = nodesToProceed.UNRELEASED[i];
      await this.unreleaseNode(node);
    }

    this.afterSave();
  }

  async releaseNode(node: ReleaseScope) {
    try {
      await this.api.releaseInstance(node.id);
      runInAction(() => {
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} released successfully`;
        this.savingLastEndedNode = node;
        this.rootStore.historyStore.updateInstanceHistory(
          node.id,
          ViewMode.RELEASE,
          false
        );
      });
    } catch (e) {
      const err = e as APIError;
      runInAction(() => {
        this.savingErrors.push({ node: node, message: err?.message });
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to release this instance`;
        this.savingLastEndedNode = node;
      });
    } finally {
      runInAction(() => {
        this.savingProgress++;
      });
    }
  }

  async unreleaseNode(node: ReleaseScope) {
    try {
      await this.api.unreleaseInstance(node.id);
      runInAction(() => {
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} unreleased successfully`;
        this.savingLastEndedNode = node;
        this.rootStore.historyStore.updateInstanceHistory(
          node.id,
          ViewMode.RELEASE,
          true
        );
      });
    } catch (e) {
      const err = e as APIError;
      runInAction(() => {
        this.savingErrors.push({ node: node, message: err?.message });
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

  markNodeForChange(node: ReleaseScope, newStatus: ReleaseStatus) {
    node.pending_status = newStatus;
    if(this.instancesTree) {
      populateStatuses(this.instancesTree, true);
    }
  }

  markAllNodeForChange(node: ReleaseScope, newStatus?: ReleaseStatus) {
    this.recursiveMarkNodeForChange(node || this.instancesTree, newStatus);
    if(this.instancesTree) {
      populateStatuses(this.instancesTree, true);
    }
  }

  recursiveMarkNodeForChange(node: ReleaseScope, newStatus?: ReleaseStatus) {
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
