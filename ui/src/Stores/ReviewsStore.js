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
        reviews.forEach(review => {
          review.username = review.userName;
          review.org = org;
        });
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
  async addInstanceReviewRequest(instanceId, org, username) {
    if (username && this.instancesReviews.has(instanceId)) {
      const instanceReviews = this.instancesReviews.get(instanceId);
      if (!instanceReviews.isFetching) {
        let instanceReview = instanceReviews.reviews.find(review => review.username === username);
        if (!instanceReview) {
          instanceReview = {
            username: username,
            org: org
          };
          instanceReviews.reviews.push(instanceReview);
          instanceReview = instanceReviews.reviews.find(review => review.username === username);
        }
        delete instanceReview.error;
        try {
          const {data} = await API.axios.put(API.endpoints.instanceReviewsByUser(instanceId, username));

          runInAction(async () => {
            instanceReview.status = data && data.status ? data.status : "PENDING";
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            instanceReview.status = "ADD_ERROR";
            instanceReview.error = `Error while inviting user "${username}" to review instance "${instanceId}" (${message})`;
          });
          appStore.captureSentryException(e);
        }
      }
    }
  }

  @action
  async removeInstanceReviewRequest(instanceId, username) {
    if (username && this.instancesReviews.has(instanceId)) {
      const instanceReviews = this.instancesReviews.get(instanceId);
      if (!instanceReviews.isFetching) {
        let instanceReview = instanceReviews.reviews.find(review => review.username === username);
        instanceReviews.reviews.remove(instanceReview);
        delete instanceReview.error;
        try {
          await API.axios.delete(API.endpoints.instanceReviewsByUser(instanceId, username));
          runInAction(async () => {
            instanceReviews.reviews.remove(instanceReview);
          });
        } catch (e) {
          runInAction(() => {
            const message = e.message ? e.message : e;
            instanceReview.status = "REMOVE_ERROR";
            instanceReview.error = `Error while trying to cancel invite to user "${username}" to review instance "${instanceId}" (${message})`;
          });
          appStore.captureSentryException(e);
        }
      }
    }
  }
}

export default new ReviewsStore();