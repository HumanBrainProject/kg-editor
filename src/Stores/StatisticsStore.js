import { observable, action, runInAction } from "mobx";
import API from "../Services/API";

class StatisticsStore{

  @observable statistics = {};
  @observable isFetched = false;
  @observable isFetching = false;
  @observable fetchError = null;

  @action
  async fetchStatistics() {
    try {
      this.isFetching = true;
      this.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.statistics());
      runInAction(() => {
        this.isFetched = true;
        this.isFetching = false;
        this.statistics = data;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message? e.message: e;
        this.fetchError = `Error while retrieving list of features (${message})`;
        this.isFetching = false;
      });
    }
  }
}

export default new StatisticsStore();