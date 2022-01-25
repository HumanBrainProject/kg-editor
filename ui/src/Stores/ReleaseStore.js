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

import { observable, action, runInAction, computed, makeObservable } from "mobx";

const setNodeTypes = node => {
  node.typesName = node.types.reduce((acc, current)  => `${acc}${acc.length ? ", " : ""}${current.label}`, "");
  if (Array.isArray(node.children) && node.children.length) {
    node.children.forEach(child => setNodeTypes(child)); // Change child permissions here in case you want to test permissions.
    node.children = node.children.sort((a, b) =>  a.typesName.toUpperCase().localeCompare(b.typesName.toUpperCase()));
  }
};

const populateStatuses = (node, prefix = "") => {
  if(node.permissions.canRelease) {
    node[prefix+"childrenStatus"] = null;
    if(node.children && node.children.length > 0){
      let childrenStatuses = node.children.map(child => populateStatuses(child, prefix));
      if(childrenStatuses.some(status => status === "UNRELEASED")){
        node[prefix+"childrenStatus"] = "UNRELEASED";
        node[prefix+"globalStatus"] = "UNRELEASED";
      } else if(childrenStatuses.some(status => status === "HAS_CHANGED")){
        node[prefix+"childrenStatus"] = "HAS_CHANGED";
        node[prefix+"globalStatus"] = node[prefix+"status"] === "UNRELEASED"? "UNRELEASED": "HAS_CHANGED";
      } else {
        node[prefix+"childrenStatus"] = "RELEASED";
        node[prefix+"globalStatus"] = node[prefix+"status"];
      }
    } else {
      node[prefix+"childrenStatus"] = null;
      node[prefix+"globalStatus"] = node[prefix+"status"];
    }
    return node[prefix+"globalStatus"];
  }
};


export class ReleaseStore {
  topInstanceId = null;
  instancesTree = null;
  isFetching = false;
  isFetched = false;
  isSaving = false;
  savingTotal = 0;
  savingProgress = 0;
  savingErrors = [];
  savingLastEndedNode = null;
  savingLastEndedRequest = "";
  hasWarning = false;
  fetchError = null;
  saveError = null;
  validationWarnings = new Map();
  fetchWarningMessagesError = null;
  isWarningMessagesFetched = false;
  isFetchingWarningMessages = false;
  isStopped = false;
  hideReleasedInstances = false;
  comparedInstance = null;

  historyStore = null;
  statusStore = null;

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore) {
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
      hasWarning: observable,
      fetchError: observable,
      saveError: observable,
      validationWarnings: observable,
      fetchWarningMessagesError: observable,
      isWarningMessagesFetched: observable,
      isFetchingWarningMessages: observable,
      isStopped: observable,
      hideReleasedInstances: observable,
      comparedInstance: observable,
      setComparedInstance: action,
      visibleWarningMessages: computed,
      treeStats: computed,
      instanceList: computed,
      toggleHideReleasedInstances: action,
      stopRelease: action,
      setTopInstanceId: action,
      fetchReleaseData: action,
      fetchWarningMessages: action,
      commitStatusChanges: action,
      releaseNode: action,
      unreleaseNode: action,
      afterSave: action,
      dismissSaveError: action,
      markNodeForChange: action,
      markAllNodeForChange: action,
      recursiveMarkNodeForChange: action,
      clearWarningMessages: action,
      handleWarning: action
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  setComparedInstance(instance) {
    this.comparedInstance = instance;
  }

  get visibleWarningMessages() {
    let results = [];
    this.validationWarnings.forEach(message =>{
      let release = 0;
      let unrelease = 0;
      message.releaseFlags.forEach(flag => {
        flag ? release++ : unrelease++;
      });
      if(release && message.messages.release) {
        results.push(message.messages.release);
      }
      if(unrelease && message.messages.unrelease) {
        results.push(message.messages.unrelease);
      }
    });
    return results;
  }

  get treeStats() {
    if (!this.isFetched) {
      return null;
    }

    const count = {
      total:0,
      released:0,
      not_released:0,
      has_changed:0,
      pending_released:0,
      pending_not_released:0,
      pending_has_changed:0,
      proceed_release:0,
      proceed_unrelease:0,
      proceed_do_nothing:0
    };

    const getStatsFromNode = node => {
      count.total++;
      if(node.status === "RELEASED"){count.released++;}
      if(node.status === "UNRELEASED"){count.not_released++;}
      if(node.status === "HAS_CHANGED"){count.has_changed++;}

      if(node.pending_status === "RELEASED"){count.pending_released++;}
      if(node.pending_status === "UNRELEASED"){count.pending_not_released++;}
      if(node.pending_status === "HAS_CHANGED"){count.pending_has_changed++;}

      if(node.status === node.pending_status){
        count.proceed_do_nothing++;
      } else {
        if(node.pending_status === "RELEASED"){
          count.proceed_release++;
        } else {
          count.proceed_unrelease++;
        }
      }

      if(node.children && node.children.length > 0){
        node.children.forEach(child => getStatsFromNode(child));
      }
    };

    getStatsFromNode(this.instancesTree);

    return count;
  }

  get instanceList() {

    const processChildrenInstanceList = (node, result, level, hideReleasedInstances)  => {
      if (!hideReleasedInstances
          || node.status === "UNRELEASED" || node.status === "HAS_CHANGED"
          || node.childrenStatus === "UNRELEASED" || node.childrenStatus === "HAS_CHANGED"
          || node.pending_status !== node.status
          || node.pending_childrenStatus !== node.childrenStatus) {
        const obj = { node: node, level:level };
        result.push(obj);
        node.children && node.children.forEach(child => processChildrenInstanceList(child, result, level+1, hideReleasedInstances));
      }
      return result;
    };

    const result = [];
    this.instancesTree && processChildrenInstanceList(this.instancesTree, result, 0, this.hideReleasedInstances);
    return result;
  }

  getNodesToProceed(){
    const nodesByStatus = {
      "RELEASED": [],
      "UNRELEASED": []
    };

    const rseek = node => {
      if(node.permissions && node.permissions.canRelease) {
        if(node.status !== node.pending_status){
          nodesByStatus[node.pending_status].push(node);
        }
        if(node.children && node.children.length > 0){
          node.children.forEach(child => rseek(child));
        }
      }
    };
    rseek(this.instancesTree);
    nodesByStatus.RELEASED = Array.from(new Set(nodesByStatus.RELEASED));
    nodesByStatus.UNRELEASED = Array.from(new Set(nodesByStatus.UNRELEASED));
    return nodesByStatus;
  }

  toggleHideReleasedInstances(hideReleasedInstances) {
    this.hideReleasedInstances = hideReleasedInstances === undefined?!this.hideReleasedInstances:!!hideReleasedInstances;
  }

  stopRelease() {
    this.isStopped = true;
  }

  setTopInstanceId(instanceId) {
    this.topInstanceId = instanceId;
  }

  async fetchReleaseData() {
    this.isFetched = false;
    this.isFetching = true;
    this.fetchError = null;
    try{
      const { data } = await this.transportLayer.getInstanceScope(this.topInstanceId);
      runInAction(()=>{
        this.hideReleasedInstances = false;
        populateStatuses(data.data);
        // Default release state
        this.recursiveMarkNodeForChange(data.data, null); // "RELEASED"
        populateStatuses(data.data, "pending_");
        setNodeTypes(data.data);
        this.instancesTree = data.data;
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch(e){
      runInAction(() => {
        const message = e.message?e.message:e;
        this.fetchError = message;
      });
    }
  }


  async fetchWarningMessages() {
    if(this.isFetchingWarningMessages || this.isWarningMessagesFetched) {
      return;
    }
    this.isFetchingWarningMessages = true;
    this.fetchWarningMessagesError = null;
    this.validationWarnings.clear();
    try {
      const { data } = await this.transportLayer.getMessages();
      // const data = {
      //   data: {
      //       "datacite/core/doi/v1.0.0": {
      //         release: "By releasing a DOI, you trigger the official registration of a DOI in an external system including specific meta-data",
      //         unrelease: "Attention! Unreleasing a DOI does not remove it from the external registry - your DOI is still findable by external systems!"
      //       },
      //       "minds/core/activity/v1.0.0": {
      //         release: "Test",
      //         unrelease: "Test unrelease"
      //       }
      //     }
      // };
      runInAction(() => {
        Object.entries(data.data).forEach(([typePath, messages]) => {
          this.validationWarnings.set(typePath, {releaseFlags:new Map(), messages: messages});
        });
        this.isWarningMessagesFetched = true;
        this.isFetchingWarningMessages = false;
      });
    } catch(e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        this.fetchWarningMessagesError = message;
        this.isWarningMessagesFetched = false;
        this.isFetchingWarningMessages = false;
      });
    }
  }

  async commitStatusChanges() {
    let nodesToProceed = this.getNodesToProceed();
    this.savingProgress = 0;
    this.savingTotal = nodesToProceed["UNRELEASED"].length + nodesToProceed["RELEASED"].length;
    this.savingErrors = [];
    this.isStopped = false;
    if(!this.savingTotal){
      return;
    }
    this.savingLastEndedRequest = "Initializing actions...";
    this.isSaving = true;

    for(let i=0; i<nodesToProceed["RELEASED"].length && !this.isStopped; i++) {
      const node = nodesToProceed["RELEASED"][i];
      await this.releaseNode(node);
    }

    for(let i=0; i<nodesToProceed["UNRELEASED"].length && !this.isStopped; i++) {
      const node = nodesToProceed["UNRELEASED"][i];
      await this.unreleaseNode(node);
    }

    this.afterSave();
  }

  async releaseNode(node) {
    try {
      await this.transportLayer.releaseInstance(node.id);
      runInAction(()=>{
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} released successfully`;
        this.savingLastEndedNode = node;
        this.rootStore.historyStore.updateInstanceHistory(node.id, "released", false);
      });
    } catch(e){
      runInAction(()=>{
        this.savingErrors.push({node: node, message: e.message});
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to release this instance`;
        this.savingLastEndedNode = node;
      });
    } finally {
      runInAction(()=>{
        this.savingProgress++;
      });
    }
  }

  async unreleaseNode(node) {
    try {
      await this.transportLayer.unreleaseInstance(node.id);
      runInAction(()=>{
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} unreleased successfully`;
        this.savingLastEndedNode = node;
        this.rootStore.historyStore.updateInstanceHistory(node.id, "released", true);
      });
    } catch(e){
      runInAction(()=>{
        this.savingErrors.push({node: node, message: e.message});
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to unrelease this instance`;
        this.savingLastEndedNode = node;
      });
    } finally {
      runInAction(()=>{
        this.savingProgress++;
      });
    }
  }

  afterSave() {
    if((this.savingErrors.length === 0 && this.savingProgress === this.savingTotal) || this.isStopped){
      setTimeout(()=>{
        runInAction(()=>{
          this.isSaving = false;
          this.rootStore.statusStore.flush();
          this.savingErrors = [];
          this.savingTotal = 0;
          this.savingProgress = 0;
          this.hasWarning = false;
          this.clearWarningMessages();
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
    if(node.permissions.canRelease) {
      node.pending_status = newStatus? newStatus: node.status;
      this.handleWarning(node, node.pending_status);
      if(node.children && node.children.length > 0){
        node.children.forEach(child => this.recursiveMarkNodeForChange(child, newStatus));
      }
    }
  }

  clearWarningMessages() {
    this.validationWarnings.forEach(message => message.releaseFlags.clear());
  }

  //TODO: Check if this logic is still valid
  handleWarning(node, newStatus) {
    if(this.validationWarnings.has(node.typePath)) {
      const messages = this.validationWarnings.get(node.typePath);
      if(newStatus === "RELEASED" && ((node.status === "HAS_CHANGED" || node.status === "UNRELEASED")))  {
        messages.releaseFlags.set(node.relativeUrl, true);
      } else if(newStatus === "UNRELEASED" && ((node.status === "HAS_CHANGED" || node.status === "RELEASED"))) {
        messages.releaseFlags.set(node.relativeUrl, false);
      } else {
        messages.releaseFlags.delete(node.relativeUrl);
      }
    }
  }
}
export default ReleaseStore;