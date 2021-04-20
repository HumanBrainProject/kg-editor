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

import axios from "axios";

import API from "./API";

export class TransportLayer {
  _axios = null

  constructor() {
    this._axios = axios.create({});
  }

  setAuthStore = authStore => {
    this.authStore = authStore;
    this._axios = axios.create({});
    this._axios.interceptors.request.use(config => {
      if(this.authStore.keycloak) {
        config.headers.Authorization = "Bearer " + this.authStore.keycloak.token;
      }
      return Promise.resolve(config);
    });
    this._axios.interceptors.response.use(null, (error) => {
      if (error.response && error.response.status === 401 && !error.config._isRetry) {
        this.authStore.logout();
        return this.axios.request(error.config);
      } else {
        return Promise.reject(error);
      }
    });
  }

   getAuthEndpoint() {
    return this._axios.get(API.endpoints.auth());
  }

   getUserProfile() {
    return this._axios.get(API.endpoints.user());
  }

   updateUserPicture(picture) {
    return this._axios.put(API.endpoints.userPicture(), picture);
  }

   getSpaceTypes(space) {
    return this._axios.get(API.endpoints.workspaceTypes(space));
  }

   getInstance(instanceId) {
    return this._axios.get(API.endpoints.instance(instanceId));
  }

   deleteInstance(instanceId) {
    return this._axios.delete(API.endpoints.instance(instanceId));
  }

   createInstance(space, instanceId, payload) {
    return this._axios.post(API.endpoints.createInstance(space, instanceId), payload);
  }

   patchInstance(instanceId, payload) {
    return this._axios.patch(API.endpoints.instance(instanceId), payload);
  }

   searchInstancesByType(space, type, from, size, search) {
    return this._axios.get(API.endpoints.searchInstancesByType(space, type, from, size, search));
  }

   searchInstancesByBookmark(space, bookmarkId, from, size, search) {
    return this._axios.get(API.endpoints.searchInstancesByBookmark(space, bookmarkId, from, size, search));
  }

   getSuggestions(instanceId, field, type, from, size, search, payload) {
    return this._axios.post(API.endpoints.suggestions(instanceId, field, type, from, size, search), payload);
  }

   getInstanceNeighbors(instanceId) {
    return this._axios.get(API.endpoints.neighbors(instanceId));
  }

   getInstanceScope(instanceId) {
    return this._axios.get(API.endpoints.instanceScope(instanceId));
  }

   getInstancesLabel(stage, instanceIds) {
    return this._axios.post(API.endpoints.instancesLabel(stage), instanceIds);
  }

   getInstancesSummary(stage, instanceIds) {
    return this._axios.post(API.endpoints.instancesSummary(stage), instanceIds);
  }

   getInstancesList(stage, instanceIds) {
    return this._axios.post(API.endpoints.instancesList(stage), instanceIds);
  }

   getUserInfo(userId) {
    return this._axios.get(API.endpoints.userInfo(userId));
  }

   getInstanceReviews(instanceId) {
    return this._axios.get(API.endpoints.instanceReviews(instanceId));
  }

   getUsersForReview(from, size, search) {
    return this._axios.get(API.endpoints.usersForReview(from, size, search));
  }

   inviteUserToReviewInstance(userId, instanceId) {
    return this._axios.put(API.endpoints.inviteUserToReviewInstance(userId, instanceId));
  }

   deleteInstanceReviewsByUser(instanceId, userId) {
    return this._axios.delete(API.endpoints.instanceReviewsByUser(instanceId, userId));
  }

   getMessages() {
    return this._axios.get(API.endpoints.messages());
  }

   releaseInstance(instanceId) {
    return this._axios.put(API.endpoints.release(instanceId));
  }

  unreleaseInstance(instanceId) {
    return this._axios.delete(API.endpoints.release(instanceId));
  }

  getReleaseStatusTopInstance(instanceIds) {
    return this._axios.post(API.endpoints.releaseStatusTopInstance(), instanceIds);
  }

  getReleaseStatusChildren(instanceIds) {
    return this._axios.post(API.endpoints.releaseStatusChildren(), instanceIds);
  }

  getFeatures() {
    return this._axios.get(API.endpoints.features());
  }

  getBookmarks(space) {
    return this._axios.get(API.endpoints.bookmarks(space));
  }

  createBookmark(bookmarkId, space, name, instanceIds) {
    return this._axios.post(API.endpoints.bookmarks(bookmarkId, space), { name: name, list: instanceIds});
  }

  renameBookmark(bookmarkId, name) {
    return this._axios.post(API.endpoints.bookmarks(bookmarkId), { name: name });
  }

  deleteBookmark(bookmarkId) {
    return this._axios.delete(API.endpoints.bookmark(bookmarkId));
  }

  getBookmarksByInstances(instanceIds) {
    return this._axios.post(API.endpoints.bookmarksByInstances(), instanceIds);
  }

  updateInstanceBookmarks(instanceId, bookmarks) {
    return this._axios.put(API.endpoints.instanceBookmarks(instanceId), bookmarks);
  }

  getMoreIncomingLinks(instanceId, property, type, from, size) {
    return this._axios.get(API.endpoints.incomingLinks(instanceId, property, type, from, size));
  }
}