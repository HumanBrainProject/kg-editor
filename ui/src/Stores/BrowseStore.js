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

import { observable, action, runInAction, computed } from "mobx";
import { debounce } from "lodash";

import API from "../Services/API";
import bookmarkStatusStore from "./BookmarkStatusStore";
import appStore from "./AppStore";

const LIST_TYPE_BOOKMARK = "BOOKMARK";
const LIST_TYPE_DATATYPE = "NODETYPE";

class BrowseStore {
  @observable lists = [];
  @observable listsFilter = "";
  @observable isFetching = {
    lists: false,
    instances: false
  };
  @observable isFetched = {
    lists: false
  };
  @observable fetchError = {
    lists: null,
    instances: null
  };
  @observable selectedList = null;
  @observable selectedInstance = null;

  @observable instances = [];
  @observable instancesFilter = "";

  @observable canLoadMoreInstances = false;
  @observable totalInstances = 0;

  @observable currentlyEditedBookmarkList = null;

  @observable newBookmarkListName = null;
  @observable isCreatingBookmarkList = false;
  @observable bookmarkListCreationError = null;

  pageStart = 0;
  pageSize = 20;

  get bookmarkListType() {
    return LIST_TYPE_BOOKMARK;
  }

  get nodetypeType() {
    return LIST_TYPE_DATATYPE;
  }

  getListById = id => {
    return this.allLists.find(list => list.id === id);
  }

  @computed
  get filteredLists(){
    const term = this.listsFilter.trim().toLowerCase();
    return this.allLists.filter(list => list.name.toLowerCase().includes(term));
  }

  @computed
  get allLists(){
    return this.lists.reduce((list, folder) => {
      list.push(...folder.lists);
      return list;
    }, []);
  }

  @computed
  get nodetypeLists(){
    return this.lists.reduce((list, folder) => {
      if (folder.folderType !== LIST_TYPE_DATATYPE) { return list; }
      list.push(...folder.lists);
      return list;
    }, []);
  }

  @computed
  get bookmarkLists(){
    return this.lists.reduce((list, folder) => {
      if (folder.folderType !== LIST_TYPE_BOOKMARK) { return list; }
      list.push(...folder.lists);
      return list;
    }, []);
  }

  @action
  setListsFilter(filter){
    this.listsFilter = filter;
  }

  @action
  async fetchLists() {
    try {
      this.fetchError.lists = null;
      this.isFetching.lists = true;
      this.isFetched.lists = false;
      const { data } = await API.axios.get(API.endpoints.bookmarkListFolders());
      runInAction(() => {
        this.isFetching.lists = false;
        this.isFetched.lists = true;
        const lists = (data && data.data)?data.data:[];
        lists.forEach(folder => {
          folder.expand = true;
          folder.lists.forEach(list => {
            list.type = folder.folderType;
            list.isBookmarkList = folder.folderType === LIST_TYPE_BOOKMARK;
            list.isDataTypeList = folder.folderType === LIST_TYPE_DATATYPE;
            if (list.isBookmarkList) {
              list.isUpdating = false;
              list.updateError = null;
              list.isDeleting = false;
              list.deleteError = null;
              list.editName = null;
            }
          });
        });
        this.lists=lists;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message? e.message: e;
        this.fetchError.lists = `Error while retrieving lists (${message})`;
        this.isFetching.lists = false;
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  toggleFolder(folder, state){
    folder.expand = state !== undefined? !!state: !folder.expand;
  }

  @action
  selectList(list){
    this.instancesFilter = "";
    this.selectedList = list;
    this.fetchInstances();
  }

  @action
  selectInstance(selectedInstance){
    this.selectedInstance = selectedInstance;
  }

  @action
  clearSelectedInstance() {
    this.selectedInstance = null;
  }

  @action
  setInstancesFilter(filter){
    this.instancesFilter = filter;
    this.isFetching.instances = true;
    this.applyInstancesFilter();
  }

  applyInstancesFilter = debounce(() => {
    this.fetchInstances();
  }, 750);

  @action
  async fetchInstances(loadMore = false) {
    try {
      if(loadMore){
        this.pageStart++;
      } else {
        this.pageStart = 0;
        this.isFetching.instances = true;
        this.selectedInstance = null;
      }
      this.fetchError.instances = null;
      const { data } = await API.axios.get(API.endpoints.listInstances(this.selectedList.id, this.pageStart*this.pageSize, this.pageSize, this.instancesFilter));
      runInAction(() => {
        this.isFetching.instances = false;
        if(loadMore){
          this.instances = [...this.instances, ...((data && data.data)?data.data:[])];
        } else {
          this.instances = (data && data.data)?data.data:[];
        }
        this.canLoadMoreInstances = this.instances.length < data.total;
        this.totalInstances = data.total;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message?e.message:e;
        this.fetchError.instances = `Error while retrieving instances "${this.nodeTypeId}" (${message})`;
        this.isFetching.instances = false;
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  refreshFilter() {
    this.applyInstancesFilter();
  }

  @action
  async createBookmarkList(name, instanceIds) {
    this.newBookmarkListName = name;
    this.bookmarkListCreationError = null;
    this.isCreatingBookmarkList = true;
    let bookmarkListfolder = null;
    this.lists.some((folder) => {
      if (folder.folderType === LIST_TYPE_BOOKMARK) {
        bookmarkListfolder = folder;
        return true;
      }
      return false;
    });
    if (bookmarkListfolder) {
      try{
        const { data } = await API.axios.post(API.endpoints.createBookmarkList(), {"name": name, "folderId": bookmarkListfolder.id});
        runInAction(() => {
          const bookmarkData = data && data.data;
          /* Mockup Data
          const bookmarkData = { id: uniqueId(`id${new Date().getTime()}`, name: name) };
          */
          bookmarkListfolder.lists.push({
            id: bookmarkData.id,
            name: bookmarkData.name?bookmarkData.name:name,
            type: bookmarkListfolder.folderType,
            isBookmarkList: true,
            isDataTypeList: false,
            isUpdating: false,
            updateError: null,
            isDeleting: false,
            deleteError: null
          });
          this.isCreatingBookmarkList = false;
          this.newBookmarkListName = null;
          if (instanceIds) {
            bookmarkStatusStore.updateStatus(instanceIds, bookmarkData.id, true);
          }
        });
      } catch(e){
        runInAction(() => {
          this.isCreatingBookmarkList = false;
          this.bookmarkListCreationError = e.message?e.message:e;
        });
        appStore.captureSentryException(e);
      }
    } else {
      this.isCreatingBookmarkList = false;
      this.bookmarkListCreationError = `Failed to create new bookmarkList ${name}. No folder of type ${LIST_TYPE_BOOKMARK} found.`;
    }
  }

  @action
  dismissBookmarkListCreationError() {
    this.bookmarkListCreationError = null;
    this.newBookmarkListName = null;
  }

  @action
  async updateBookmarkList(list, newProps) {
    if (!list) { return false; }
    list.editName = newProps.name;
    list.updateError = null;
    list.isUpdating = true;
    /* TODO: check non empty and no dupplicate name
    this.lists.some(folder => {
      if (folder.folderType === LIST_TYPE_BOOKMARK) {
        folder.lists.some(bookmark => {
          if (bookmark.id === list.id) {
            bookmark.editName = null;
            bookmark.updateError = null;
            return true;
          }
          return false;
        });
        return true;
      }
      return false;
    });
    */
    try {
      const { data } = await API.axios.put(API.endpoints.updateBookmarkList(list.id), {"name": newProps.name});
      runInAction(() => {
        list.name = data && data.data ? data.data.name:null;
        list.isUpdating = false;
      });
    } catch (e) {
      runInAction(() => {
        list.updateError = e.message?e.message:e;
        list.isUpdating = false;
        return false;
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  revertBookmarkListChanges(list) {
    if (!list) { return; }
    list.editName = null;
    list.updateError = null;
    this.cancelCurrentlyEditedBookmarkList(list);
  }

  @action
  async deleteBookmarkList(list) {
    if (!list) { return false; }
    list.deleteError = null;
    list.isDeleting = true;
    try {
      await API.axios.delete(API.endpoints.deleteBookmarkList(list.id));
      /*
      if ((Math.floor(Math.random() * 10) % 2) === 0) {
        throw "Error 501";
      }
      */
      runInAction(() => {
        list.isDeleting = false;
        this.lists.some(folder => {
          if (folder.folderType === LIST_TYPE_BOOKMARK) {
            const index = folder.lists.findIndex(bookmark => bookmark.id === list.id);
            if (index !== -1) {
              folder.lists.splice(index, 1);
            }
            return true;
          }
          return false;
        });
      });
    } catch (e) {
      runInAction(() => {
        list.deleteError = e.message?e.message:e;
        list.isDeleting = false;
        return false;
      });
      appStore.captureSentryException(e);
    }
  }

  @action
  cancelBookmarkListDeletion(list) {
    if (!list) { return; }
    list.deleteError = null;
  }

  @action
  setCurrentlyEditedBookmarkList(list) {
    if (list && !list.isUpdating && !list.isDeleting) {
      if (!list.updateError) {
        list.editName = list.name;
      }
      list.updateError = null;
      this.currentlyEditedBookmarkList = list;
    }
  }

  @action
  cancelCurrentlyEditedBookmarkList(list) {
    if (!list || this.currentlyEditedBookmarkList === list) {
      this.currentlyEditedBookmarkList = null;
    }
  }
}

export default new BrowseStore();