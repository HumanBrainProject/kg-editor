/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { observable, action, runInAction } from "mobx";
import API from "../Services/API";
import appStore from "./AppStore";

class StatisticsStore {
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
      appStore.captureSentryException(e);
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
      appStore.captureSentryException(e);
    }
  }
}

export default new StatisticsStore();