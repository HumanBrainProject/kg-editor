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

import { observable, action, runInAction, makeObservable } from "mobx";
import API from "../Services/API";

export class ReviewsStore {
  instancesReviews = new Map();

  transportLayer = null;

  constructor(transportLayer) {
    makeObservable(this, {
      instancesReviews: observable,
      getInstanceReviews: action,
      fetchInstanceReviews: action,
      addInstanceReviewRequest: action,
      removeInstanceReviewRequest: action
    });

    this.transportLayer = transportLayer;
  }

  getInstanceReviews(instanceId) {
    if (!this.instancesReviews.has(instanceId)) {
      this.fetchInstanceReviews(instanceId);
    }
    return this.instancesReviews.get(instanceId);
  }


  async fetchInstanceReviews(instanceId) {
    let instanceReviews = null;
    if (this.instancesReviews.has(instanceId)) {
      instanceReviews = this.instancesReviews.get(instanceId);
      if (instanceReviews.isFetching) {
        return instanceReviews;
      }
      instanceReviews.isFetching = true;
      instanceReviews.isFetched = false;
      instanceReviews.fetchError = null;
      instanceReviews.hasFetchError = false;
    } else {
      this.instancesReviews.set(instanceId, {
        reviews: [],
        fetchError: null,
        hasFetchError: false,
        isFetching: true,
        isFetched: false
      });
      instanceReviews = this.instancesReviews.get(instanceId);
    }

    try {
      const {data} = await this.transportLayer.getInstanceReviews(instanceId);

      runInAction(() => {
        const reviews = data.length ? data : [];
        const [org, , , ,] = instanceId.split("/");
        reviews.forEach(review => review.org = org);
        instanceReviews.reviews = reviews;
        instanceReviews.isFetching = false;
        instanceReviews.isFetched = true;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        instanceReviews.reviews = [];
        instanceReviews.fetchError = `Error while retrieving reviews for instance "${instanceId}" (${message})`;
        instanceReviews.hasFetchError = true;
        instanceReviews.isFetched = false;
        instanceReviews.isFetching = false;
      });
      this.transportLayer.captureException(e);
    }
    return instanceReviews;
  }

  async addInstanceReviewRequest(instanceId, org, userId) {
    if (userId && this.instancesReviews.has(instanceId)) {
      const instanceReviews = this.instancesReviews.get(instanceId);
      if (!instanceReviews.isFetching) {
        let instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
        if (!instanceReview) {
          instanceReview = {
            userId: userId,
            org: org
          };
          instanceReviews.reviews.push(instanceReview);
          instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
        }
        delete instanceReview.error;
        try {
          const {data} = await this.transportLayer.inviteUserToReviewInstance(userId, instanceId);

          runInAction(async () => {
            instanceReview.status = data && data.status ? data.status : "PENDING";
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            instanceReview.status = "ADD_ERROR";
            instanceReview.error = `Error while inviting user "${userId}" to review instance "${instanceId}" (${message})`;
          });
          this.transportLayer.captureException(e);
        }
      }
    }
  }

  async removeInstanceReviewRequest(instanceId, userId) {
    if (userId && this.instancesReviews.has(instanceId)) {
      const instanceReviews = this.instancesReviews.get(instanceId);
      if (!instanceReviews.isFetching) {
        let instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
        instanceReviews.reviews.remove(instanceReview);
        delete instanceReview.error;
        try {
          await this.transportLayer.deleteInstanceReviewsByUser(instanceId, userId);
          runInAction(async () => {
            instanceReviews.reviews.remove(instanceReview);
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            instanceReview.status = "REMOVE_ERROR";
            instanceReview.error = `Error while trying to cancel invite to user "${userId}" to review instance "${instanceId}" (${message})`;
          });
          this.transportLayer.captureException(e);
        }
      }
    }
  }
}

export default new ReviewsStore();