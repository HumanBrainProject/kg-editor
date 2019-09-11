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

  @observable newBookmarkName = null;
  @observable isCreatingBookmark = false;
  @observable bookmarkCreationError = null;

  @observable currentlyEditedBookmark = null;

  @computed
  get hasFetchError() {
    return this.fetchError !== null;
  }

  filteredList(term) {
    if(term.trim()) {
      return this.list.filter(bookmark => bookmark.name.toLowerCase().includes(term.trim().toLowerCase()));
    }
    return this.list;
  }

  @action
  cancelBookmarkDeletion(bookmark) {
    if (!bookmark) { return; }
    bookmark.deleteError = null;
  }

  @action
  setCurrentlyEditedBookmark(bookmark) {
    if (bookmark && !bookmark.isUpdating && !bookmark.isDeleting) {
      if (!bookmark.updateError) {
        bookmark.editName = bookmark.name;
      }
      bookmark.updateError = null;
      this.currentlyEditedBookmark = bookmark;
    }
  }

  @action
  cancelCurrentlyEditedBookmark(bookmark) {
    if (!bookmark || this.currentlyEditedBookmark === bookmark) {
      this.currentlyEditedBookmark = null;
    }
  }

  @action
  dismissBookmarkCreationError() {
    this.bookmarkCreationError = null;
    this.newBookmarkName = null;
  }


  @action
  revertBookmarkChanges(bookmark) {
    if (!bookmark) { return; }
    bookmark.editName = null;
    bookmark.updateError = null;
    this.cancelCurrentlyEditedBookmark(bookmark);
  }

  @action
  async deleteBookmark(bookmark) {
    if (!bookmark) { return false; }
    bookmark.deleteError = null;
    bookmark.isDeleting = true;
    try {
      await API.axios.delete(API.endpoints.bookmarkList(bookmark.id));
      runInAction(() => {
        bookmark.isDeleting = false;
        const index = this.list.findIndex(item => item.id === bookmark.id);
        if (index !== -1) {
          this.list.splice(index, 1);
        }
      });
    } catch (e) {
      runInAction(() => {
        bookmark.deleteError = e.message?e.message:e;
        bookmark.isDeleting = false;
      });
    }
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
  async createBookmark(name, instanceIds) {
    this.newBookmarkName = name;
    this.bookmarkCreationError = null;
    this.isCreatingBookmark = true;
    try {
      const { data } = await API.axios.post(API.endpoints.bookmarkList(), { name: name, list: instanceIds || [] });
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
        this.isCreatingBookmark = false;
        this.newBookmarkName = null;
      });
    } catch (e) {
      runInAction(() => {
        this.isCreatingBookmark = false;
        this.bookmarkCreationError = e.message ? e.message : e;
      });
    }
  }

  @action
  async updateBookmark(bookmark, newProps) {
    if (!bookmark) { return false; }
    bookmark.editName = newProps.name;
    bookmark.updateError = null;
    bookmark.isUpdating = true;
    try {
      const { data } = await API.axios.put(API.endpoints.bookmarkList(bookmark.id), { name: newProps.name });
      runInAction(() => {
        bookmark.name = data && data.data ? data.data.name : null;
        bookmark.isUpdating = false;
      });
    } catch (e) {
      runInAction(() => {
        bookmark.updateError = e.message ? e.message : e;
        bookmark.isUpdating = false;
        return false;
      });
    }
  }
}
export default new BookmarkStore();