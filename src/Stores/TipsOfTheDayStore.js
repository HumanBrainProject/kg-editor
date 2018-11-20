import { observable, action, runInAction } from "mobx";
import API from "../Services/API";

class TipsOfTheDayStore{

  @observable tips = [];
  @observable isFetched = false;
  @observable isFetching = false;
  @observable fetchError = null;

  @action
  async fetchTipsOfTheDay() {
    try {
      this.isFetching = true;
      this.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.tipsOfTheDay());
      runInAction(() => {
        this.isFetched = true;
        this.isFetching = false;
        this.tips = (data && data.data)?data.data:[];
      });
    } catch (e) {
      const message = e.message? e.message: e;
      this.fetchError = `Error while retrieving tips of the day (${message})`;
      this.isFetching = false;
    }
  }
}

export default new TipsOfTheDayStore();