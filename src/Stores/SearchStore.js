import { observable, action, runInAction, computed } from "mobx";
import { debounce, uniqueId } from "lodash";

import API from "../Services/API";

class SearchStore{

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

  @observable currentlyEditedBookmarkList = null;
  @observable isCreatingNewBookmarkList = false;
  @observable bookmarkListCreationError = null;

  pageStart = 0;
  pageSize = 20;

  isUpdatingBookmarkList(id) {
    return this.updatingBookmarkList === id;
  }

  isDeletingBookmarkList(id) {
    return this.deletingBookmarkList === id;
  }

  @action setListsFilter(filter){
    this.listsFilter = filter;
  }

  @computed get filteredLists(){
    const term = this.listsFilter.trim().toLowerCase();
    return this.allLists.filter(list => list.name.toLowerCase().includes(term));
  }

  @computed get allLists(){
    return this.lists.reduce((list, folder) => {
      list.push(...folder.lists);
      return list;
    }, []);
  }

  @computed get bookmarkListFolder(){
    return this.lists.reduce((list, folder) => {
      if (folder.folderType !== "BOOKMARK") { return list; }
      list.push(...folder.lists);
      return list;
    }, []);
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
        const lists = Array.isArray(data)?data:[]; //(data && data.data)?data.data:[];
        lists.forEach(folder => {
          folder.expand = true;
          folder.lists.forEach(list => {
            list.type = folder.folderType;
            if (folder.folderType === "BOOKMARK") {
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
      const message = e.message? e.message: e;
      this.fetchError.lists = `Error while retrieving lists (${message})`;
      this.isFetching.lists = false;
    }
  }

  @action toggleFolder(folder, state){
    folder.expand = state !== undefined? !!state: !folder.expand;
  }

  @action selectList(list){
    this.instancesFilter = "";
    this.selectedList = list;
    this.fetchInstances();
  }

  @action selectInstance(selectedInstance){
    this.selectedInstance = selectedInstance;
  }

  @action setInstancesFilter(filter){
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
      });
    } catch (e) {
      const message = e.message?e.message:e;
      this.fetchError.instances = `Error while retrieving instances "${this.nodeTypeId}" (${message})`;
      this.isFetching.instances = false;
    }
  }

  @action
  async createNewBookmarkList(name) {
    this.bookmarkListCreationError = null;
    this.isCreatingNewBookmarkList = true;
    try{
      /*
      const { data } = await API.axios.post(API.endpoints.addBookmark(), {"name": name});
      */
      const data = { id: uniqueId(`id${new Date().getTime()}`) };
      this.lists.some((folder) => {
        if (folder.folderType === "BOOKMARK") {
          folder.lists.push({
            id: data.id,
            name: name,
            type: folder.folderType,
            isUpdating: false,
            updateError: null,
            isDeleting: false,
            deleteError: null
          });
          return true;
        }
        return false;
      });
      this.isCreatingNewBookmarkList = false;
      return data.id;
    } catch(e){
      this.isCreatingNewBookmarkList = false;
      this.bookmarkListCreationError = e.message?e.message:e;
    }
  }

  @action
  async updateBookmarkList(list, newProps) {
    if (!list) { return false; }
    list.editName = newProps.name;
    list.updateError = null;
    list.isUpdating = true;
    /* TODO: check non empty and no dupplicate name
    this.lists.some(folder => {
      if (folder.folderType === "BOOKMARK") {
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
      /*
      const { data } = await API.axios.post(API.endpoints.addBookmark(id), {"name": name});
      */
      runInAction(() => {
        if ((Math.floor(Math.random() * 10) % 2) === 0) {
          throw "Error 501";
        }
        const data = { id: list.id, name: name };
        list.name = data.name;
        list.isUpdating = false;
      });
    } catch (e) {
      list.updateError = e.message?e.message:e;
      list.isUpdating = false;
      return false;
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
      /*
      await API.axios.post(API.endpoints.deleteBookmark(id));
      */
      runInAction(() => {
        if ((Math.floor(Math.random() * 10) % 2) === 0) {
          throw "Error 501";
        }
        list.isDeleting = false;
        this.lists.some(folder => {
          if (folder.folderType === "BOOKMARK") {
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
      list.deleteError = e.message?e.message:e;
      list.isDeleting = false;
      return false;
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

export default new SearchStore();