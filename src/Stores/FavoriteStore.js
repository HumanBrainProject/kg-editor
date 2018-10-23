import { observable, action, runInAction } from "mobx";
import { uniqueId } from "lodash";
import API from "../Services/API";

class FavoriteStore{
  @observable favorites = [];
  @observable isFetched = false;
  @observable fetchError = null;
  @observable isFetching = false;
  @observable isCreatingNewFavorite = false;
  @observable favoriteCreationError = null;

  getFavorite(id){
    return this.favorites.get(id);
  }

  @action
  async fetchLists() {
    if (!this.isFetched && !this.isFetching) {
      try {
        this.isFetched = false;
        this.isFetching = true;
        /*
        const { data } = await API.axios.get(API.endpoints.listFavorites());
        runInAction(() => {
          favorites = (data && data.data)?data.data:[];
          this.isFetched = true;
          this.isFetching = false;
        });
        */
        const data = {
          data: [
            {
              label: "favorite list 01",
              value: "favoriteList01"
            },
            {
              label: "favorite list 02",
              value: "favoriteList02"
            },
            {
              label: "favorite list 03",
              value: "favoriteList03"
            }
          ]
        };
        setTimeout(() => {
          runInAction(() =>{
            this.favorites = (data && data.data)?data.data:[];
            this.isFetched = true;
            this.isFetching = false;
          });
        }, 500);
      } catch (e) {
        const message = e.message? e.message: e;
        this.fetchError = `Error while retrieving favorites (${message})`;
        this.isFetching = false;
      }
    }
  }
  @action
  async createNewFavorite(name) {
    const id = this.favorites.reduce((result, favorite) => (favorite.label === name)?favorite.value:result, "");
    if (id) {
      return id;
    }
    try{
      /*
      const { data } = await API.axios.post(API.endpoints.addFavorite(), {"name": name});
      */
      const data = { id: uniqueId(`id${new Date().getTime()}`) };
      this.favorites.push({
        label: name,
        value: data.id
      });
      this.isCreatingNewFavorite = true;
      return data.id;
    } catch(e){
      this.isCreatingNewFavorite = false;
      this.favoriteCreationError = e.message;
    }
  }
}

export default new FavoriteStore();