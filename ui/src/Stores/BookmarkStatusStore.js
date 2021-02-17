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

import { observable, action, runInAction, makeObservable } from "mobx";
import { toJS } from "mobx";
import debounce from "lodash/debounce";

export class BookmarkStatusStore{
  statuses = new Map();
  isFetching = false;

  processSize = 20;
  fetchQueue = [];
  fetchErrorQueue = [];

  transportLayer = null;
  rootStore = null;

  constructor(transportLayer, rootStore) {
    makeObservable(this, {
      statuses: observable,
      isFetching: observable,
      fetchStatus: action,
      updateStatus: action,
      saveStatus: action,
      revertSaveStatus: action,
      retryFetchStatus: action,
      smartProcessQueue: action,
      processQueue: action
    });

    this.transportLayer = transportLayer;
    this.rootStore = rootStore;
  }

  getInstance(id){
    return this.statuses.get(id);
  }

  fetchStatus(instanceIds) {
    if(!Array.isArray(instanceIds)){
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

  updateStatus(instanceIds, bookmarkLists, appendMode) {
    if(!Array.isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if(this.statuses.has(id)){
        const status = this.statuses.get(id);
        if(!status.isFetching && !status.hasFetchError) {
          if (!status.data) {
            status.data = {id: id, bookmarkLists: []};
          }
          if(!Array.isArray(bookmarkLists)){
            bookmarkLists = bookmarkLists?[bookmarkLists]:[];
          }
          if (appendMode) {
            if (bookmarkLists.length) {
              let hasChanged = false;
              const previousBookmarkLists = (status.previousBookmarkLists && status.previousBookmarkLists.length)?status.previousBookmarkLists:toJS(status.data.bookmarkLists);
              bookmarkLists.forEach(bookmarkId => {
                if (status.data.bookmarkLists.indexOf(bookmarkId) === -1) {
                  hasChanged = true;
                  status.data.bookmarkLists.push(bookmarkId);
                }
              });
              if (hasChanged) {
                status.hasChanged = true;
                status.previousBookmarkLists = previousBookmarkLists;
              }
            }
          } else {
            status.hasChanged = true;
            if (!status.previousBookmarkLists || !status.previousBookmarkLists.length) {
              status.previousBookmarkLists = toJS(status.data.bookmarkLists);
            }
            status.data.bookmarkLists = bookmarkLists||[];
          }
        }
      }
    });
    this.smartProcessQueue();
  }

  saveStatus(instanceIds) {
    if(!Array.isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(async id => {
      if(this.statuses.has(id)){
        const status = this.statuses.get(id);
        if(status.hasChanged && !status.isSaving && !status.isFetching && !status.hasFetchError) {
          this.rootStore.historyStore.updateInstanceHistory(id, "bookmarked", !status.data || !status.data.bookmarkLists || !status.data.bookmarkLists.length); // TODO: get instance types
          try {
            status.hasSaveError = false;
            status.isSaving = true;
            const bookmarks = (status.data && status.data.bookmarkLists)?toJS(status.data.bookmarkLists):[];
            await this.transportLayer.updateInstanceBookmarks(id, bookmarks);
            runInAction(() => {
              status.hasChanged = false;
              status.saveError = null;
              status.hasSaveError = false;
              status.isSaving = false;
              status.previousBookmarkLists = [];
            });
          } catch (e) {
            runInAction(() => {
              const message = e.message?e.message:e;
              status.saveError = `Error while saving bookmark of "${id}" (${message})`;
              status.hasSaveError = true;
              status.isSaving = false;
            });
          }
        }
      }
    });
  }

  revertSaveStatus(instanceIds) {
    if(!Array.isArray(instanceIds)){
      instanceIds = [instanceIds];
    }
    instanceIds.forEach(id => {
      if(this.statuses.has(id)){
        const status = this.statuses.get(id);
        if (status.hasChanged && !status.isSaving && !status.isFetching) {
          if (!status.data) {
            status.data = {id: id, bookmarkLists: []};
          }
          status.data.bookmarkLists = Array.isArray(status.previousBookmarkLists)?status.previousBookmarkLists:[];
          status.hasChanged = false;
          status.saveError = null;
          status.hasSaveError = false;
          status.isSaving = false;
        }
      }
    });
  }

  retryFetchStatus() {
    const toFetch = this.fetchErrorQueue;
    this.fetchErrorQueue = [];
    this.fetchStatus(toFetch);
  }

  smartProcessQueue() {
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

  async processQueue() {
    if(this.isFetching){
      return;
    }
    this.isFetching = true;
    let toProcess = this.fetchQueue.splice(0, this.processSize);
    toProcess.forEach(id => {
      this.statuses.get(id).isFetching = true;
    });
    try{
      const { data } = await this.transportLayer.getBookmarksByInstances(toProcess);
      runInAction(() =>{
        const statuses = Array.isArray(data.data)?data.data:[];
        statuses.forEach(responseStatus => {
          const status = this.statuses.get(responseStatus.id);
          if (responseStatus.bookmarkLists.error) {
            status.hasFetchError = true;
            const error = (responseStatus.bookmarkLists.error.message?responseStatus.bookmarkLists.error.message:"") + (responseStatus.bookmarkLists.error.code?`(code ${responseStatus.bookmarkLists.error.code})`:"");
            status.fetchError = `Error while fetching bookmark of "${responseStatus.id}" (${error})`;
            status.data = { bookmarkLists: []};
          } else {
            status.data = responseStatus;
            status.hasFetchError = false;
            status.fetchError = null;
          }
          status.isFetching = false;
          status.isFetched = true;
          this.isFetching = false;
          this.smartProcessQueue();
        });
      });
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

export default BookmarkStatusStore;