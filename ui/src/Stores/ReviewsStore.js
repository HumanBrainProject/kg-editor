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


import * as reviewersMockupDataModule from '../data/mockups/reviewers.json';

const reviewersMockupData = reviewersMockupDataModule.default;

export class ReviewsStore {
  reviews = [];
  fetchError = null;
  isFetching= true;
  isFetched= false;

  transportLayer = null;

  constructor(transportLayer) {
    makeObservable(this, {
      reviews: observable,
      fetchError: observable,
      hasFetchError: computed,
      isFetching: observable,
      isFetched: observable,
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
        this.reviews = data && data.length ? data : [];
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
        this.reviews = reviewersMockupData.data;
        this.fetchError = null;
        this.isFetched = true;
      });
    } 
  }

  async addInstanceReviewRequest(instanceId, org, userId) {
    // if (userId && this.instancesReviews.has(instanceId)) {
    //   const instanceReviews = this.instancesReviews.get(instanceId);
    //   if (!instanceReviews.isFetching) {
    //     let instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
    //     if (!instanceReview) {
    //       instanceReview = {
    //         userId: userId,
    //         org: org
    //       };
    //       instanceReviews.reviews.push(instanceReview);
    //       instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
    //     }
    //     delete instanceReview.error;
    //     try {
    //       const {data} = await this.transportLayer.inviteUserToReviewInstance(userId, instanceId);

    //       runInAction(async () => {
    //         instanceReview.status = data && data.status ? data.status : "PENDING";
    //       });
    //     } catch (e) {
    //       runInAction(() => {
    //         const message = e.message ? e.message : e;
    //         instanceReview.status = "ADD_ERROR";
    //         instanceReview.error = `Error while inviting user "${userId}" to review instance "${instanceId}" (${message})`;
    //       });
    //     }
    //   }
    // }
  }

  async removeInstanceReviewRequest(instanceId, userId) {
    // if (userId && this.instancesReviews.has(instanceId)) {
    //   const instanceReviews = this.instancesReviews.get(instanceId);
    //   if (!instanceReviews.isFetching) {
    //     let instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
    //     instanceReviews.reviews.remove(instanceReview);
    //     delete instanceReview.error;
    //     try {
    //       await this.transportLayer.deleteInstanceReviewsByUser(instanceId, userId);
    //       runInAction(async () => {
    //         instanceReviews.reviews.remove(instanceReview);
    //       });
    //     } catch (e) {
    //       runInAction(() => {
    //         const message = e.message ? e.message : e;
    //         instanceReview.status = "REMOVE_ERROR";
    //         instanceReview.error = `Error while trying to cancel invite to user "${userId}" to review instance "${instanceId}" (${message})`;
    //       });
    //     }
    //   }
    // }
  }
}

export default new ReviewsStore();