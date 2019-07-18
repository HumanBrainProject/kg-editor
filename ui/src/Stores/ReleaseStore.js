import { observable, action, runInAction, computed } from "mobx";
import API from "../Services/API";
import statusStore from "./StatusStore";
import historyStore from "./HistoryStore";
import {uniq} from "lodash";

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

  @action
  stopRelease() {
    this.isStopped = true;
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
      if(node.status === "NOT_RELEASED"){count.not_released++;}
      if(node.status === "HAS_CHANGED"){count.has_changed++;}

      if(node.pending_status === "RELEASED"){count.pending_released++;}
      if(node.pending_status === "NOT_RELEASED"){count.pending_not_released++;}
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
    const result = [];
    this.instancesTree && this.processChildrenInstanceList(this.instancesTree, result, 0);
    return result;
  }

  processChildrenInstanceList(node, result, level) {
    const obj = { node: node, level:level };
    result.push(obj);
    node.children && node.children.forEach(child => this.processChildrenInstanceList(child, result, level+1));
    return result;
  }

  getNodesToProceed(){
    const nodesByStatus = {
      "RELEASED": [],
      "NOT_RELEASED": []
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
    nodesByStatus.NOT_RELEASED = uniq(nodesByStatus.NOT_RELEASED);
    return nodesByStatus;
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
      const { data } = await API.axios.get(API.endpoints.releaseData(this.topInstanceId));
      runInAction(()=>{
        const setNodeTypes = node => {
          const typePath = node.relativeUrl.substr(
            0,
            node.relativeUrl.lastIndexOf("/")
          );
          node.typePath = typePath;
          node.children && node.children.forEach(child => setNodeTypes(child));
        };
        this.populateStatuses(data);
        // Default release state
        this.recursiveMarkNodeForChange(data, null); // "RELEASED"
        this.populateStatuses(data, "pending_");
        setNodeTypes(data);
        this.instancesTree = data;
        this.isFetched = true;
        this.isFetching = false;
      });
    } catch(e){
      const message = e.message?e.message:e;
      this.fetchError = message;
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
      const message = e.message?e.message:e;
      this.fetchWarningMessagesError = message;
      this.isWarningMessagesFetched = false;
      this.isFetchingWarningMessages = false;
    }
  }

  @action
  async commitStatusChanges(){
    let nodesToProceed = this.getNodesToProceed();
    this.savingProgress = 0;
    this.savingTotal = nodesToProceed["NOT_RELEASED"].length + nodesToProceed["RELEASED"].length;
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

    for(let i=0; i<nodesToProceed["NOT_RELEASED"].length && !this.isStopped; i++) {
      const node = nodesToProceed["NOT_RELEASED"][i];
      await this.unreleaseNode(node);
    }

    this.afterSave();
  }

  @action
  async releaseNode(node) {
    try {
      await API.axios.put(API.endpoints.doRelease(node["relativeUrl"], {}));
      runInAction(()=>{
        this.savingLastEndedRequest = `(${node.type}) released successfully`;
        this.savingLastEndedNode = node;
        historyStore.updateInstanceHistory(node["relativeUrl"], "released");
      });
    } catch(e){
      runInAction(()=>{
        this.savingErrors.push({node: node, message: e.message});
        this.savingLastEndedRequest = `(${node.type}) : an error occured while trying to release this instance`;
        this.savingLastEndedNode = node;
      });
    } finally {
      runInAction(()=>{
        this.savingProgress++;
      });
    }
  }

  @action
  async unreleaseNode(node) {
    try {
      await API.axios.delete(API.endpoints.doRelease(node["relativeUrl"], {}));
      runInAction(()=>{
        this.savingLastEndedRequest = `(${node.type}) unreleased successfully`;
        this.savingLastEndedNode = node;
        historyStore.updateInstanceHistory(node["relativeUrl"], "released", true);
      });
    } catch(e){
      runInAction(()=>{
        this.savingErrors.push({node: node, message: e.message});
        this.savingLastEndedRequest = `(${node.type}) : an error occured while trying to unrelease this instance`;
        this.savingLastEndedNode = node;
      });
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
  populateStatuses(node, prefix = ""){
    node[prefix+"childrenStatus"] = null;
    if(node.children && node.children.length > 0){
      let childrenStatuses = node.children.map(child => this.populateStatuses(child, prefix));
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

  @action
  markNodeForChange(node, newStatus){
    node.pending_status = newStatus;
    this.populateStatuses(this.instancesTree, "pending_");
  }

  @action
  markAllNodeForChange(node, newStatus){
    this.recursiveMarkNodeForChange(node || this.instancesTree, newStatus);
    this.populateStatuses(this.instancesTree, "pending_");
  }

  @action
  recursiveMarkNodeForChange(node, newStatus){
    node.pending_status = newStatus? newStatus: node.status;
    this.handleWarning(node, node.pending_status);
    if(node.children && node.children.length > 0){
      node.children.forEach(child => this.recursiveMarkNodeForChange(child, newStatus));
    }
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

  @action
  clearWarningMessages() {
    this.warningMessages.forEach(message => message.releaseFlags.clear());
  }

  @action
  handleWarning(node, newStatus) {
    if(this.warningMessages.has(node.typePath)) {
      const messages = this.warningMessages.get(node.typePath);
      if(newStatus === "RELEASED" && ((node.status === "HAS_CHANGED" || node.status === "NOT_RELEASED")))  {
        messages.releaseFlags.set(node.relativeUrl, true);
      } else if(newStatus === "NOT_RELEASED" && ((node.status === "HAS_CHANGED" || node.status === "RELEASED"))) {
        messages.releaseFlags.set(node.relativeUrl, false);
      } else {
        messages.releaseFlags.delete(node.relativeUrl);
      }
    }
  }
}
export default new ReleaseStore();