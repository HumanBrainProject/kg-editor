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

  @observable isSavingBookmark = false;

  pageStart = 0;
  pageSize = 20;

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

  @computed get bookmarksList(){
    return this.lists.reduce((list, folder) => {
      if (folder.type !== "bookmark") { return list; }
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
      const { data } = await API.axios.get(API.endpoints.lists());
      runInAction(() => {
        this.isFetching.lists = false;
        this.isFetched.lists = true;
        this.lists = (data && data.data)?data.data:[];
        this.lists.forEach(folder => {
          folder.expand = true;
          folder.lists.forEach(list => {
            list.type = folder.type;
          });
        });
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
  async createNewBookmark(name) {
    try{
      /*
      const { data } = await API.axios.post(API.endpoints.addFavorite(), {"name": name});
      */
      const data = { id: uniqueId(`id${new Date().getTime()}`) };
      this.lists.some((folder) => {
        if (folder.type === "bookmark") {
          folder.lists.push({
            id: data.id,
            name: name,
            type: folder.type
          });
          return true;
        }
        return false;
      });
      this.isCreatingNewFavorite = true;
      return data.id;
    } catch(e){
      this.isCreatingNewFavorite = false;
      this.favoriteCreationError = e.message;
    }
  }

  @action
  async renameBookmark(id, name) {
    try {
      /*
      const { data } = await API.axios.post(API.endpoints.addBookmark(id), {"name": name});
      */
      const data = { id: id, name: name };
      this.lists.some(folder => {
        if (folder.type === "bookmark") {
          folder.lists.some(bookmark => {
            if (bookmark.id === id) {
              bookmark.name = name;
              return true;
            }
            return false;
          });
          return true;
        }
        return false;
      });
      this.isCreatingNewFavorite = true;
      return data.name;
    } catch (e) {
      this.isCreatingNewFavorite = false;
      this.favoriteCreationError = e.message;
    }
  }

  @action
  async deleteBookmark(id) {
    try {
      /*
      await API.axios.post(API.endpoints.deleteBookmark(id));
      */
      this.lists.some(folder => {
        if (folder.type === "bookmark") {
          const index = folder.lists.findIndex(bookmark => bookmark.id === id);
          if (index !== -1) {
            folder.lists.splice(index, 1);
          }
          return true;
        }
        return false;
      });
      this.isCreatingNewFavorite = true;
      return true;
    } catch (e) {
      this.isCreatingNewFavorite = false;
      this.favoriteCreationError = e.message;
    }
  }
}

export default new SearchStore();