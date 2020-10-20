/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { observable, action, runInAction, computed } from "mobx";
import {uniq} from "lodash";

import API from "../Services/API";
import statusStore from "./StatusStore";
import historyStore from "./HistoryStore";
import appStore from "./AppStore";

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
      if(childrenStatuses.some(status => status === "NOT_RELEASED")){
        node[prefix+"childrenStatus"] = "NOT_RELEASED";
        node[prefix+"globalStatus"] = "NOT_RELEASED";
      } else if(childrenStatuses.some(status => status === "HAS_CHANGED")){
        node[prefix+"childrenStatus"] = "HAS_CHANGED";
        node[prefix+"globalStatus"] = node[prefix+"status"] === "NOT_RELEASED"? "NOT_RELEASED": "HAS_CHANGED";
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


class ReleaseStore{
  @observable topInstanceId = null;
  @observable instancesTree = null;
  @observable isFetching = false;
  @observable isFetched = false;
  @observable isSaving = false;
  @observable savingTotal = 0;
  @observable savingProgress = 0;
  @observable savingErrors = [];
  @observable savingLastEndedNode = null;
  @observable savingLastEndedRequest = "";
  @observable hasWarning = false;
  @observable fetchError = null;
  @observable saveError = null;
  @observable warningMessages = new Map();
  @observable fetchWarningMessagesError = null;
  @observable isWarningMessagesFetched = false;
  @observable isFetchingWarningMessages = false;
  @observable isStopped = false;
  @observable hideReleasedInstances = false;
  @observable comparededInstance = null;

  @action
  setComparedInstance(instance){
    this.comparededInstance = instance;
  }

  @computed
  get visibleWarningMessages() {
    let results = [];
    this.warningMessages.forEach(message =>{
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

  @computed
  get treeStats(){
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

  @computed
  get instanceList() {

    const processChildrenInstanceList = (node, result, level, hideReleasedInstances)  => {
      if (!hideReleasedInstances
          || node.status === "NOT_RELEASED" || node.status === "HAS_CHANGED"
          || node.childrenStatus === "NOT_RELEASED" || node.childrenStatus === "HAS_CHANGED"
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
      if(node.status !== node.pending_status){
        nodesByStatus[node.pending_status].push(node);
      }
      if(node.children && node.children.length > 0){
        node.children.forEach(child => rseek(child));
      }
    };

    rseek(this.instancesTree);
    nodesByStatus.RELEASED = uniq(nodesByStatus.RELEASED);
    nodesByStatus.UNRELEASED = uniq(nodesByStatus.UNRELEASED);
    return nodesByStatus;
  }

  @action
  toggleHideReleasedInstances(hideReleasedInstances) {
    this.hideReleasedInstances = hideReleasedInstances === undefined?!this.hideReleasedInstances:!!hideReleasedInstances;
  }

  @action
  stopRelease() {
    this.isStopped = true;
  }

  @action
  setTopInstanceId(instanceId) {
    this.topInstanceId = instanceId;
  }

  @action
  async fetchReleaseData(){
    this.isFetched = false;
    this.isFetching = true;
    this.fetchError = null;
    try{
      const { data } = await API.axios.get(API.endpoints.instanceScope(this.topInstanceId));
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
      appStore.captureSentryException(e);
    }
  }


  @action
  async fetchWarningMessages() {
    if(this.isFetchingWarningMessages || this.isWarningMessagesFetched) {
      return;
    }
    this.isFetchingWarningMessages = true;
    this.fetchWarningMessagesError = null;
    this.warningMessages.clear();
    try {
      const { data } = await API.axios.get(API.endpoints.messages());
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
          this.warningMessages.set(typePath, {releaseFlags:new Map(), messages: messages});
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
      appStore.captureSentryException(e);
    }
  }

  @action
  async commitStatusChanges(){
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

  @action
  async releaseNode(node) {
    try {
      await API.axios.put(API.endpoints.release(node.id, {}));
      runInAction(()=>{
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} released successfully`;
        this.savingLastEndedNode = node;
        historyStore.updateInstanceHistory(node.id, "released", false);
      });
    } catch(e){
      runInAction(()=>{
        this.savingErrors.push({node: node, message: e.message});
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to release this instance`;
        this.savingLastEndedNode = node;
      });
      appStore.captureSentryException(e);
    } finally {
      runInAction(()=>{
        this.savingProgress++;
      });
    }
  }

  @action
  async unreleaseNode(node) {
    try {
      await API.axios.delete(API.endpoints.release(node.id, {}));
      runInAction(()=>{
        this.savingLastEndedRequest = `(${node.typesName}) ${node.label} unreleased successfully`;
        this.savingLastEndedNode = node;
        historyStore.updateInstanceHistory(node.id, "released", true);
      });
    } catch(e){
      runInAction(()=>{
        this.savingErrors.push({node: node, message: e.message});
        this.savingLastEndedRequest = `(${node.typesName}) : an error occured while trying to unrelease this instance`;
        this.savingLastEndedNode = node;
      });
      appStore.captureSentryException(e);
    } finally {
      runInAction(()=>{
        this.savingProgress++;
      });
    }
  }

  @action
  afterSave(){
    if((this.savingErrors.length === 0 && this.savingProgress === this.savingTotal) || this.isStopped){
      setTimeout(()=>{
        runInAction(()=>{
          this.isSaving = false;
          statusStore.flush();
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

  @action
  dismissSaveError(){
    this.isSaving = false;
    statusStore.flush();
    this.savingErrors = [];
    this.savingTotal = 0;
    this.savingProgress = 0;
    this.fetchReleaseData();
  }

  @action
  markNodeForChange(node, newStatus){
    node.pending_status = newStatus;
    populateStatuses(this.instancesTree, "pending_");
  }

  @action
  markAllNodeForChange(node, newStatus){
    this.recursiveMarkNodeForChange(node || this.instancesTree, newStatus);
    populateStatuses(this.instancesTree, "pending_");
  }

  @action
  recursiveMarkNodeForChange(node, newStatus){
    if(node.permissions.canRelease) {
      node.pending_status = newStatus? newStatus: node.status;
      this.handleWarning(node, node.pending_status);
      if(node.children && node.children.length > 0){
        node.children.forEach(child => this.recursiveMarkNodeForChange(child, newStatus));
      }
    }
  }

  @action
  clearWarningMessages() {
    this.warningMessages.forEach(message => message.releaseFlags.clear());
  }

  //TODO: Check if this logic is still valid
  @action
  handleWarning(node, newStatus) {
    if(this.warningMessages.has(node.typePath)) {
      const messages = this.warningMessages.get(node.typePath);
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
export default new ReleaseStore();