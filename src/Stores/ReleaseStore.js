import { observable, action, runInAction } from "mobx";
import API from "../Services/API";

export default class ReleaseStore{
  @observable topInstanceId = null;
  @observable instancesTree = null;
  @observable selectedForRelease = [];
  @observable selectedForUnrelease = [];
  @observable isFetching = false;
  @observable isFetched = false;

  constructor(instanceId){
    this.topInstanceId = instanceId;
    this.fetchReleaseData();
  }

  @action
  async fetchReleaseData(){
    this.isFetched = false;
    this.isFetching = true;
    const { data } = await API.axios.get(API.endpoints.releaseData(this.topInstanceId));
    runInAction(()=>{
      this.instancesTree = data;
      this.isFetched = true;
      this.isFetching = false;
    });
  }
}