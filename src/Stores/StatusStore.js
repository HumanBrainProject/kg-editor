import { observable, action, runInAction } from "mobx";
import { isArray, debounce } from "lodash";
import API from "../Services/API";

class StatusStore{
  @observable statuses = new Map();
  @observable isFetching = false;

  processSize = 20;
  fetchQueue = [];

  getInstance(id){
    return this.statuses.get(id);
  }

  @action flush(){
    this.statuses = new Map();
  }

  @action
  fetchStatus(instanceIds){
    if(!isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if(!this.statuses.has(id) || this.statuses.get(id).hasFetchError){
        this.statuses.set(id, {
          isFetching: false,
          isFetched: false,
          hasFetchError: false,
          data: null
        });
        this.fetchQueue.push(id);
      }
    });
    this.smartProcessQueue();
  }

  @action
  smartProcessQueue(){
    if(this.fetchQueue.length <= 0){
      this._debouncedProcessQueue.cancel();
    } else if(this.fetchQueue.length < this.processSize){
      this._debouncedProcessQueue();
    } else {
      this._debouncedProcessQueue.cancel();
      this.processQueue();
    }
  }

  _debouncedProcessQueue = debounce(()=>{this.processQueue();}, 250);

  @action
  async processQueue(){
    if(this.isFetching){
      return;
    }
    this.isFetching = true;
    let toProcess = this.fetchQueue.splice(0, this.processSize);
    toProcess.forEach(id => {
      this.statuses.get(id).isFetching = true;
    });
    try{
      let response = await API.axios.post(API.endpoints.releaseStatus(), toProcess);
      runInAction(() =>{
        response.data.forEach(status => {
          this.statuses.get(status.id).data = status;
          this.statuses.get(status.id).isFetching = false;
          this.statuses.get(status.id).isFetched = true;
          this.isFetching = false;
          this.smartProcessQueue();
        });
      });
    } catch(e){
      runInAction(() =>{
        toProcess.forEach(id => {
          this.statuses.get(id).isFetching = false;
          this.statuses.get(id).hasFetchError = true;
        });
        this.isFetching = false;
        this.smartProcessQueue();
      });
    }
  }
}

export default new StatusStore();