import { observable, action, runInAction } from "mobx";
import { toJS } from "mobx";
import { isArray, debounce } from "lodash";
import console from "../Services/Logger";
//import API from "../Services/API";

class BookmarkStatusStore{
  @observable statuses = new Map();
  @observable isFetching = false;

  processSize = 20;
  fetchQueue = [];
  fetchErrorQueue = [];

  getInstance(id){
    return this.statuses.get(id);
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
          hasChanged: false,
          saveError: null,
          hasSaveError: false,
          isSaving: false,
          data: null
        });
        this.fetchQueue.push(id);
      }
    });
    this.smartProcessQueue();
  }

  @action
  updateStatus(instanceIds, bookmarks){
    if (!Array.isArray(bookmarks)) {
      bookmarks = [];
    }
    if(!isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if(this.statuses.has(id)){
        const status = this.statuses.get(id);
        if(!status.isFetching && !status.hasFetchError) {
          if (!status.data) {
            status.data = {id: id, bookmarks: []};
          }
          status.hasChanged = true;
          status.previousBookmarks = toJS(status.data.bookmarks);
          status.data.bookmarks = bookmarks;
        }
      }
    });
    this.smartProcessQueue();
  }

  @action
  saveStatus(instanceIds){
    if(!isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if(this.statuses.has(id)){
        const status = this.statuses.get(id);
        if(status.hasChanged && !status.isSaving && !status.isFetching && !status.hasFetchError) {
          try {
            status.hasSaveError = false;
            status.isSaving = true;
            const payload = (status.data && status.data.bookmarks)?toJS(status.data.bookmarks):[];
            /*
            const { data } = await API.axios.put(API.endpoints.setInstanceBookmarks(id), payload);
            runInAction(() => {
              status.hasChanged = false;
              status.saveError = null;
              status.hasSaveError = false;
              status.isSaving = false;
              status.previousBookmarks = [];
              console.debug(`bookmark of "${id}" successfully saved`, data);
            });
            */
            if ((Math.floor(Math.random() * 10) % 2) === 0) {
              throw "Failed to save bookmark (Error 501).";
            }
            const data = {
              id: id,
              bookmarks: payload
            };
            setTimeout(() => {
              runInAction(() =>{
                status.hasChanged = false;
                status.saveError = null;
                status.hasSaveError = false;
                status.isSaving = false;
                status.previousBookmarks = [];
                console.debug(`bookmark of "${id}" successfully saved`, data);
              });
            }, 500);
          } catch (e) {
            const message = e.message?e.message:e;
            status.saveError = `Error while saving bookmark of "${id}" (${message})`;
            status.hasSaveError = true;
            status.isSaving = false;
          }
        }
      }
    });
  }

  @action
  revertSaveStatus(instanceIds) {
    if(!isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if(this.statuses.has(id)){
        const status = this.statuses.get(id);
        if (status.hasChanged && !status.isSaving && !status.isFetching) {
          if (!status.data) {
            status.data = {id: id, bookmarks: []};
          }
          status.data.bookmarks = Array.isArray(status.previousBookmarks)?status.previousBookmarks:[];
          status.hasChanged = false;
          status.saveError = null;
          status.hasSaveError = false;
          status.isSaving = false;
        }
      }
    });
  }

  @action
  retryFetchStatus(){
    const toFetch = this.fetchErrorQueue;
    this.fetchErrorQueue = [];
    this.fetchStatus(toFetch);
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
      /*
      //let response = await API.axios.post(API.endpoints.listInstancesBookmarksStatus(), toProcess);
      runInAction(() =>{
        response.data.forEach(status => {
          this.statuses.get(status.id).data = status;
          this.statuses.get(status.id).isFetching = false;
          this.statuses.get(status.id).isFetched = true;
          this.isFetching = false;
          this.smartProcessQueue();
        });
      });
      */
      if ((Math.floor(Math.random() * 10) % 2) === 0) {
        throw "Failed to request bookmark status (Error 501).";
      }
      const response = {
        data: toProcess.map(id => (
          {
            id: id,
            bookmarks: (Math.floor(Math.random() * 10) % 2) === 0?[]:["bookmarkList02"]
          }
        ))
      };
      setTimeout(() => {
        runInAction(() =>{
          response.data.forEach(status => {
            this.statuses.get(status.id).data = status;
            this.statuses.get(status.id).isFetching = false;
            this.statuses.get(status.id).isFetched = true;
            this.isFetching = false;
            this.smartProcessQueue();
          });
        });
      }, 500);
    } catch(e){
      runInAction(() =>{
        const message = e.message?e.message:e;
        toProcess.forEach(id => {
          this.statuses.get(id).isFetching = false;
          this.statuses.get(id).hasFetchError = true;
          this.statuses.get(id).fetchError = `Error while fetching bookmark of "${id}" (${message})`;
        });
        this.fetchErrorQueue.push(...toProcess);
        this.isFetching = false;
        this.smartProcessQueue();
      });
    }
  }
}

export default new BookmarkStatusStore();