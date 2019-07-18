import { observable, action, runInAction } from "mobx";
import API from "../Services/API";

class StatisticsStore{

  @observable statistics = {};
  @observable globalDatasetsStatistics = {
    data: {},
    isFetched: false,
    isFetching: false,
    fetchError: null
  };
  @observable perWeekDatasetsStatistics = {
    data: [],
    isFetched: false,
    isFetching: false,
    fetchError: null
  };

  @action
  async fetchGlobalDatasetsStatistics() {
    try {
      this.globalDatasetsStatistics.isFetching = true;
      this.globalDatasetsStatistics.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.globalDatasetsStatistics());
      runInAction(() => {
        this.globalDatasetsStatistics.isFetched = true;
        this.globalDatasetsStatistics.isFetching = false;
        this.globalDatasetsStatistics.data = (data && data.data)?data.data:{};
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message? e.message: e;
        this.globalDatasetsStatistics.fetchError = `Error while retrieving datasets statistics (${message})`;
        this.globalDatasetsStatistics.isFetching = false;
      });
    }
  }

  @action
  async fetchPerWeekDatasetsStatistics() {
    try {
      this.perWeekDatasetsStatistics.isFetching = true;
      this.perWeekDatasetsStatistics.fetchError = null;
      const { data } = await API.axios.get(API.endpoints.perWeekDatasetsStatistics());
      runInAction(() => {
        this.perWeekDatasetsStatistics.isFetched = true;
        this.perWeekDatasetsStatistics.isFetching = false;
        this.perWeekDatasetsStatistics.data = (data && Array.isArray(data.data))?data.data:[];
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message? e.message: e;
        this.perWeekDatasetsStatistics.fetchError = `Error while retrieving per week datasets statistics (${message})`;
        this.perWeekDatasetsStatistics.isFetching = false;
      });
    }
  }
}

export default new StatisticsStore();