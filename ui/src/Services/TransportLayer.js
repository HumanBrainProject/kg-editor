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

  async getAuthEndpoint() {
    return this._axios.get(API.endpoints.auth());
  }

  async getUserProfile() {
    return this._axios.get(API.endpoints.user());
  }

  async updateUserPicture(picture) {
    return this._axios.put(API.endpoints.userPicture(), picture);
  }

  async getWorkspaceTypes(workspace) {
    return this._axios.get(API.endpoints.workspaceTypes(workspace));
  }

  async getInstance(instanceId) {
    return this._axios.get(API.endpoints.instance(instanceId));
  }

  async deleteInstance(instanceId) {
    return this._axios.delete(API.endpoints.instance(instanceId));
  }

  async createInstance(workspace, instanceId, payload) {
    return this._axios.post(API.endpoints.createInstance(workspace, instanceId), payload);
  }

  async patchInstance(instanceId, payload) {
    return this._axios.patch(API.endpoints.instance(instanceId), payload);
  }

  async searchInstancesByType(workspace, type, from, size, search) {
    return this._axios.get(API.endpoints.searchInstancesByType(workspace, type, from, size, search));
  }

  async searchInstancesByBookmark(workspace, bookmarkId, from, size, search) {
    return this._axios.get(API.endpoints.searchInstancesByBookmark(workspace, bookmarkId, from, size, search));
  }

  async getSuggestions(instanceId, field, type, from, size, search, payload) {
    return this._axios.post(API.endpoints.suggestions(instanceId, field, type, from, size, search), payload);
  }

  async getInstanceNeighbors(instanceId) {
    return this._axios.get(API.endpoints.neighbors(instanceId));
  }

  async getInstanceScope(instanceId) {
    return this._axios.get(API.endpoints.instanceScope(instanceId));
  }

  async getInstancesLabel(stage, instanceIds) {
    return this._axios.post(API.endpoints.instancesLabel(stage), instanceIds);
  }

  async getInstancesSummary(stage, instanceIds) {
    return this._axios.post(API.endpoints.instancesSummary(stage), instanceIds);
  }

  async getInstancesList(stage, instanceIds) {
    return this._axios.post(API.endpoints.instancesList(stage), instanceIds);
  }

  async getUserInfo(userId) {
    return this._axios.get(API.endpoints.userInfo(userId));
  }

  async getInstanceReviews(instanceId) {
    return this._axios.get(API.endpoints.instanceReviews(instanceId));
  }

  async getUsersForReview(from, size, search) {
    return this._axios.get(API.endpoints.usersForReview(from, size, search));
  }

  async inviteUserToReviewInstance(userId, instanceId) {
    return this._axios.put(API.endpoints.inviteUserToReviewInstance(userId, instanceId));
  }

  async deleteInstanceReviewsByUser(instanceId, userId) {
    return this._axios.delete(API.endpoints.instanceReviewsByUser(instanceId, userId));
  }

  async getMessages() {
    return this._axios.get(API.endpoints.messages());
  }

  async releaseInstance(instanceId) {
    return this._axios.put(API.endpoints.release(instanceId));
  }

  async unreleaseInstance(instanceId) {
    return this._axios.delete(API.endpoints.release(instanceId));
  }

  async getReleaseStatusTopInstance(instanceIds) {
    return this._axios.post(API.endpoints.releaseStatusTopInstance(), instanceIds);
  }

  async getReleaseStatusChildren(instanceIds) {
    return this._axios.post(API.endpoints.releaseStatusChildren(), instanceIds);
  }

  async getFeatures() {
    return this._axios.get(API.endpoints.features());
  }

  async getBookmarks(workspace) {
    return this._axios.get(API.endpoints.bookmarks(workspace));
  }

  async createBookmark(bookmarkId, workspace, name, instanceIds) {
    return this._axios.post(API.endpoints.bookmarks(bookmarkId, workspace), { name: name, list: instanceIds});
  }

  async renameBookmark(bookmarkId, name) {
    return this._axios.post(API.endpoints.bookmarks(bookmarkId), { name: name });
  }

  async deleteBookmark(bookmarkId) {
    return this._axios.delete(API.endpoints.bookmark(bookmarkId));
  }

  async getBookmarksByInstances(instanceIds) {
    return this._axios.post(API.endpoints.bookmarksByInstances(), instanceIds);
  }

  async updateInstanceBookmarks(instanceId, bookmarks) {
    return this._axios.put(API.endpoints.instanceBookmarks(instanceId), bookmarks);
  }
}