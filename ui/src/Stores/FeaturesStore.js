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

import { observable, action, runInAction, computed } from "mobx";
import API from "../Services/API";

class FeaturesStore{

  @observable releases = [];
  @observable isFetched = false;
  @observable isFetching = false;
  @observable fetchError = null;

  @computed
  get latestReleases() {
    return this.releases.slice(0, 3);
  }

  @computed
  get olderReleases() {
    return this.releases.slice(3);
  }

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
}

export default new FeaturesStore();