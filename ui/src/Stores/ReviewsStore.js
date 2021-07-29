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

import { observable, computed, action, runInAction, makeObservable } from "mobx";
export class ReviewsStore {
  reviews = [];
  fetchError = null;
  isFetching = true;
  isFetched = false;
  error = null;

  transportLayer = null;

  constructor(transportLayer) {
    makeObservable(this, {
      reviews: observable,
      fetchError: observable,
      isFetching: observable,
      isFetched: observable,
      error: observable,
      hasFetchError: computed,
      getInstanceReviews: action,
      addInstanceReviewRequest: action,
      removeInstanceReviewRequest: action
    });

    this.transportLayer = transportLayer;
  }

  get hasFetchError() {
    return !!this.fetchError;
  }

  async getInstanceReviews(instanceId) {
    this.isFetching = true;
    this.reviews = [];
    this.isFetched = false;
    this.fetchError = null;
    try {
      const { data } = await this.transportLayer.getInstanceReviews(instanceId);
      runInAction(() => {
        this.reviews = data && data.data ? data.data : [];
        this.isFetching = false;
        this.isFetched = true;
        this.fetchError = null;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.reviews = [];
        this.fetchError = `Error while retrieving reviews for instance "${instanceId}" (${message})`;
        this.isFetched = false;
        this.isFetching = false;
      });
    } 
  }

  async addInstanceReviewRequest(instanceId, userId) {
    try {
      const { data } = await this.transportLayer.inviteUserToReviewInstance(instanceId, userId);
      runInAction(() => {
        this.reviews = data && data.data ? data.data : [];
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.error = `Error while inviting user "${userId}" to review instance "${instanceId}" (${message})`;
      });
    }
  }

  async removeInstanceReviewRequest(instanceId, userId) {
    try {
      const { data } = await this.transportLayer.deleteInstanceReviewsByUser(instanceId, userId);
      runInAction(() => {
        this.reviews = data && data.data ? data.data : [];
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.error = `Error while removing user "${userId}" to review instance "${instanceId}" (${message})`;
      });
    }
  }
}

export default new ReviewsStore();