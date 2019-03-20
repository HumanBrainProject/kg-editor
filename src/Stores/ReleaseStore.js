import { observable, action, runInAction, computed } from "mobx";
import API from "../Services/API";
import statusStore from "./StatusStore";
import historyStore from "./HistoryStore";
import {uniq} from "lodash";

export default class ReleaseStore{
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

  @observable fetchError = null;
  @observable saveError = null;

  @observable hlNode = null;

  @observable nodesMap = null;
  @observable counter = 0;

  constructor(instanceId){
    this.topInstanceId = instanceId;
    this.fetchReleaseData();
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
    window.console.log("count", count);

    return count;
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
  async fetchReleaseData(){
    this.isFetched = false;
    this.isFetching = true;
    this.fetchError = null;
    try{
      const { data } = await API.axios.get(API.endpoints.releaseData(this.topInstanceId));
      runInAction(()=>{
        this.deduplicateNodes(data);
        this.populateStatuses(data);
        // Default release state
        this.recursiveMarkNodeForChange(data, null); // "RELEASED"
        this.populateStatuses(data, "pending_");
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
  deduplicateNodes(rootNode){
    this.nodesMap = new Map();
    let rseek = (node) => {
      if(node.children){
        node.children = node.children.map(child => {
          rseek(child);
          if(!this.nodesMap.has(child["@id"])){
            this.nodesMap.set(child["@id"], child);
          }
          return this.nodesMap.get(child["@id"]);
        });
      }
    };
    rseek(rootNode);
  }

  async commitStatusChanges(){
    let nodesToProceed = this.getNodesToProceed();
    this.savingProgress = 0;
    this.savingTotal = nodesToProceed["NOT_RELEASED"].length + nodesToProceed["RELEASED"].length;
    this.savingErrors = [];
    if(!this.savingTotal){
      return;
    }
    this.isSaving = true;

    nodesToProceed["RELEASED"].forEach(async (node) => {
      try{
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
          this.afterSave();
        });
      }
    });

    nodesToProceed["NOT_RELEASED"].forEach(async (node) => {
      try{
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
          this.afterSave();
        });
      }
    });
  }

  @action afterSave(){
    if(this.savingErrors.length === 0 && this.savingProgress === this.savingTotal){
      setTimeout(()=>{
        runInAction(()=>{
          this.isSaving = false;
          statusStore.flush();
          this.savingErrors = [];
          this.savingTotal = 0;
          this.savingProgress = 0;
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

  @action markNodeForChange(node, newStatus){
    node.pending_status = newStatus;
    this.populateStatuses(this.instancesTree, "pending_");
    this.counter++;
  }

  @action markAllNodeForChange(node, newStatus){
    this.recursiveMarkNodeForChange(node || this.instancesTree, newStatus);
    this.populateStatuses(this.instancesTree, "pending_");
    this.counter++;
  }
  @action recursiveMarkNodeForChange(node, newStatus){
    node.pending_status = newStatus? newStatus: node.status;
    if(node.children && node.children.length > 0){
      node.children.forEach(child => this.recursiveMarkNodeForChange(child, newStatus));
    }
  }

  @action toggleHLNode(node){
    this.hlNode = this.hlNode === node? null: node;
  }
}