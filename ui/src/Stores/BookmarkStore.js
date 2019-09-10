import { observable, computed, action, runInAction } from "mobx";
import API from "../Services/API";

class BookmarkStore {
  @observable list = [];
  @observable isFetching = false;
  @observable listFilter = "";
  @observable fetchError = null;
  @observable updateError = null;
  @observable saveError = null;
  @observable deleteError = null;

  @observable newBookmarkListName = null;
  @observable isCreatingBookmarkList = false;
  @observable bookmarkListCreationError = null;


  @computed
  get hasFetchError() {
    return this.fetchError !== null;
  }

  filteredList(term) {
    return this.list.filter(bookmark => bookmark.name.toLowerCase().includes(term.trim().toLowerCase()));
  }

  @action
  async fetch() {
    if (this.isFetching) {
      return null;
    }
    try {
      this.isFetching = true;
      this.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.bookmarks());
      runInAction(() => {
        this.list = data.data;
        this.isFetching = false;
      });
    } catch (e) {
      runInAction(() => {
        this.fetchError = e.message ? e.message : e;
        this.isFetching = false;
      });
    }
  }

  @action
  async createBookmarkList(name, instanceIds) {
    this.newBookmarkListName = name;
    this.bookmarkListCreationError = null;
    this.isCreatingBookmarkList = true;
    try {
      const { data } = await API.axios.post(API.endpoints.bookmarkList(), { name: name, list:instanceIds || []});
      runInAction(() => {
        const bookmarkData = data && data.data;
        this.list.push({
          id: bookmarkData.id,
          name: bookmarkData.name ? bookmarkData.name : name,
          isUpdating: false,
          updateError: null,
          isDeleting: false,
          deleteError: null
        });
        this.isCreatingBookmarkList = false;
        this.newBookmarkListName = null;
      });
    } catch (e) {
      runInAction(() => {
        this.isCreatingBookmarkList = false;
        this.bookmarkListCreationError = e.message ? e.message : e;
      });
    }

  }
}
export default new BookmarkStore();