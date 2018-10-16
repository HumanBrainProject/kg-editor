import { observable, action, runInAction, computed, toJS } from "mobx";
import API from "../Services/API";
import statusStore from "./StatusStore";

export default class ReleaseStore{
  @observable topInstanceId = null;
  @observable instancesTree = null;

  @observable isFetching = false;
  @observable isFetched = false;
  @observable isSaving = false;

  @observable fetchError = null;
  @observable saveError = null;

  @observable hlNode = null;

  constructor(instanceId){
    this.topInstanceId = instanceId;
    this.fetchReleaseData();
  }

  @computed
  get treeStats(){
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
        node.children.map(child => getStatsFromNode(child));
      }
    };

    getStatsFromNode(this.instancesTree);

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
        node.children.map(child => rseek(child));
      }
    };

    rseek(this.instancesTree);
    return nodesByStatus;
  }

  @action
  async fetchReleaseData(){
    this.isFetched = false;
    this.isFetching = true;
    try{
      const { data } = await API.axios.get(API.endpoints.releaseData(this.topInstanceId));
      runInAction(()=>{
        this.populateStatuses(data);
        this.createPendingStatuses(data);
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
  async commitStatusChanges(){
    this.isSaving = true;
    try{
      const payload = toJS(this.getNodesToProceed()["RELEASED"]).map(node => {return {id:node["@id"], rev:node.rev};});
      await API.axios.post(API.endpoints.doRelease(), payload);
      runInAction(() => {
        this.isSaving = false;
        this.fetchReleaseData();
        statusStore.flush();
      });
    } catch(e){
      runInAction(()=>{
        const message = e.message?e.message:e;
        this.saveError = message;
        this.isSaving = false;
        this.fetchReleaseData();
        statusStore.flush();
      });
    }
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
  createPendingStatuses(node){
    node.pending_status = "RELEASED";
    if(node.children && node.children.length > 0){
      node.children.map(child => this.createPendingStatuses(child));
    }
  }

  @action markNodeForChange(node, newStatus){
    node.pending_status = newStatus;
    this.populateStatuses(this.instancesTree, "pending_");
  }

  @action markAllNodeForChange(node, newStatus){
    this.recursiveMarkNodeForChange(node || this.instancesTree, newStatus);
    this.populateStatuses(this.instancesTree, "pending_");
  }
  @action recursiveMarkNodeForChange(node, newStatus){
    node.pending_status = newStatus? newStatus: node.status;
    if(node.children && node.children.length > 0){
      node.children.map(child => this.recursiveMarkNodeForChange(child, newStatus));
    }
  }

  @action toggleHLNode(node){
    this.hlNode = this.hlNode === node? null: node;
  }

  @action dismissSaveError(){
    this.saveError = null;
  }
}