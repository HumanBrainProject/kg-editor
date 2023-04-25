/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import { observable, action, runInAction, computed, makeObservable } from "mobx";

export class FeaturesStore{
  releases = [];
  isFetched = false;
  isFetching = false;
  fetchError = null;

  api = null;


  constructor(api) {
    makeObservable(this, {
      releases: observable,
      isFetched: observable,
      isFetching: observable,
      fetchError: observable,
      latestReleases: computed,
      olderReleases: computed,
      fetchFeatures: action
    });

    this.api = api;
  }

  get latestReleases() {
    return this.releases.slice(0, 3);
  }

  get olderReleases() {
    return this.releases.slice(3);
  }

  async fetchFeatures() {
    try {
      this.isFetching = true;
      this.fetchError = null;
      const { data } = await this.transportLayer.getFeatures();
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

export default FeaturesStore;