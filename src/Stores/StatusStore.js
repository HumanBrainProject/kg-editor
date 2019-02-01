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
          fetchError: null,
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
      const status = this.statuses.get(id);
      status.isFetching = true;
      status.hasFetchError = false;
      status.fetchError = null;
    });
    try{
      let response = await API.axios.post(API.endpoints.releaseStatus(), toProcess);
      runInAction(() =>{
        response.data.forEach(responseStatus => {
          const status = this.statuses.get(responseStatus.id);
          status.data = responseStatus;
          status.isFetching = false;
          status.isFetched = true;
          this.isFetching = false;
          this.smartProcessQueue();
        });
      });
    } catch(e){
      runInAction(() =>{
        const message = e.message? e.message: e;
        toProcess.forEach(id => {
          const status = this.statuses.get(id);
          status.isFetching = false;
          status.hasFetchError = true;
          status.fetchError = `Error while fetching instance status (${message})`;
        });
        this.isFetching = false;
        this.smartProcessQueue();
      });
    }
  }
}

export default new StatusStore();