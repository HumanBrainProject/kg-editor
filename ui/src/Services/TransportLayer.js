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

  getRawInstance(instanceId) {
    return this._axios.get(API.endpoints.rawInstance(instanceId));
  }

   deleteInstance(instanceId) {
    return this._axios.delete(API.endpoints.instance(instanceId));
  }

   createInstance(space, instanceId, payload) {
    return this._axios.post(API.endpoints.createInstance(space, instanceId), payload);
  }

  moveInstance(instanceId, space) {
    return this._axios.put(API.endpoints.moveInstance(instanceId, space));
  }

   patchInstance(instanceId, payload) {
    return this._axios.patch(API.endpoints.instance(instanceId), payload);
  }

   searchInstancesByType(space, type, from, size, search) {
    return this._axios.get(API.endpoints.searchInstancesByType(space, type, from, size, search));
  }

   getSuggestions(instanceId, field, sourceType, targetType, from, size, search, payload) { //NOSONAR
    return this._axios.post(API.endpoints.suggestions(instanceId, field, sourceType, targetType, from, size, search), payload);
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

   getInvitedUsers(instanceId) {
    return this._axios.get(API.endpoints.invitedUsers(instanceId));
  }

   getUsersForReview(search) {
    return this._axios.get(API.endpoints.usersForReview(search));
  }

   inviteUser(instanceId, userId) {
    return this._axios.put(API.endpoints.inviteUser(instanceId, userId));
  }

   removeUserInvitation(instanceId, userId) {
    return this._axios.delete(API.endpoints.inviteUser(instanceId, userId));
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

  getMoreIncomingLinks(instanceId, property, type, from, size) {
    return this._axios.get(API.endpoints.incomingLinks(instanceId, property, type, from, size));
  }
}