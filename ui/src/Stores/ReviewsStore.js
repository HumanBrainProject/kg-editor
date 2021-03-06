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

import {observable, action, runInAction} from "mobx";

import API from "../Services/API";
import appStore from "./AppStore";

class ReviewsStore {
  @observable instancesReviews = new Map();

  @action
  getInstanceReviews(instanceId) {
    if (!this.instancesReviews.has(instanceId)) {
      this.fetchInstanceReviews(instanceId);
    }
    return this.instancesReviews.get(instanceId);
  }


  @action
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
      const {data} = await API.axios.get(API.endpoints.instanceReviews(instanceId));

      runInAction(() => {
        const reviews = data.length ? data : [];
        const [org, , , ,] = instanceId.split("/");
        reviews.forEach(review => review.org = org);
        instanceReviews.reviews = reviews;
        instanceReviews.isFetching = false;
        instanceReviews.isFetched = true;
      });
      //
      // Mockup Data
      //
      /*
      const data = {
        data: [
          {
            userId: "305861"
          },
          {
            userId: "305670"
          },
          {
            userId: "305629"
          },
          {
            userId: "305630"
          },
          {
            userId: "305808"
          },
          {
            userId: "303447"
          },
          {
            userId: "305920"
          }
        ]
      };
      */
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        instanceReviews.reviews = [];
        instanceReviews.fetchError = `Error while retrieving reviews for instance "${instanceId}" (${message})`;
        instanceReviews.hasFetchError = true;
        instanceReviews.isFetched = false;
        instanceReviews.isFetching = false;
      });
      appStore.captureSentryException(e);
    }
    return instanceReviews;
  }

  @action
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
          const {data} = await API.axios.put(API.endpoints.instanceReviewsByUser(instanceId, userId));

          runInAction(async () => {
            instanceReview.status = data && data.status ? data.status : "PENDING";
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            instanceReview.status = "ADD_ERROR";
            instanceReview.error = `Error while inviting user "${userId}" to review instance "${instanceId}" (${message})`;
          });
          appStore.captureSentryException(e);
        }
      }
    }
  }

  @action
  async removeInstanceReviewRequest(instanceId, userId) {
    if (userId && this.instancesReviews.has(instanceId)) {
      const instanceReviews = this.instancesReviews.get(instanceId);
      if (!instanceReviews.isFetching) {
        let instanceReview = instanceReviews.reviews.find(review => review.userId === userId);
        instanceReviews.reviews.remove(instanceReview);
        delete instanceReview.error;
        try {
          await API.axios.delete(API.endpoints.instanceReviewsByUser(instanceId, userId));
          runInAction(async () => {
            instanceReviews.reviews.remove(instanceReview);
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            instanceReview.status = "REMOVE_ERROR";
            instanceReview.error = `Error while trying to cancel invite to user "${userId}" to review instance "${instanceId}" (${message})`;
          });
          appStore.captureSentryException(e);
        }
      }
    }
  }
}

export default new ReviewsStore();