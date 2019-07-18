import { observable, action, runInAction, computed } from "mobx";
import API from "../Services/API";

class FeaturesStore{

  @observable releases = [];
  @observable isFetched = false;
  @observable isFetching = false;
  @observable fetchError = null;

  @action
  async fetchFeatures() {
    try {
      this.isFetching = true;
      this.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.features());
      runInAction(() => {
        this.isFetched = true;
        this.isFetching = false;
        this.releases = (data && data.data)?data.data:[];
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message? e.message: e;
        this.fetchError = `Error while retrieving list of features (${message})`;
        this.isFetching = false;
      });
    }
  }

  @computed get latestReleases() {
    return this.releases.slice(0, 3);
  }

  @computed get olderReleases() {
    return this.releases.slice(3);
  }

}

export default new FeaturesStore();