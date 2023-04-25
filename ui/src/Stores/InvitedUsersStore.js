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
export class InvitedUsersStore {
  users = [];
  fetchError = null;
  isFetching = false;
  isFetched = false;
  error = null;

  api = null;

  constructor(api) {
    makeObservable(this, {
      users: observable,
      fetchError: observable,
      isFetching: observable,
      isFetched: observable,
      error: observable,
      hasFetchError: computed,
      getInvitedUsers: action,
      inviteUser: action,
      removeUserInvitation: action
    });

    this.api = api;
  }

  get hasFetchError() {
    return !!this.fetchError;
  }

  async getInvitedUsers(instanceId) {
    if (this.isFetching) {
      return;
    }
    this.isFetching = true;
    this.users = [];
    this.isFetched = false;
    this.fetchError = null;
    try {
      const { data } = await this.transportLayer.getInvitedUsers(instanceId);
      runInAction(() => {
        this.users = data && data.data ? data.data : [];
        this.isFetching = false;
        this.isFetched = true;
        this.fetchError = null;
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.users = [];
        this.fetchError = `Error while retrieving invited users for instance "${instanceId}" (${message})`;
        this.isFetched = false;
        this.isFetching = false;
      });
    } 
  }

  async inviteUser(instanceId, userId) {
    try {
      const { data } = await this.transportLayer.inviteUser(instanceId, userId);
      runInAction(() => {
        this.users = data && data.data ? data.data : [];
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.error = `Error while inviting user "${userId}" to review instance "${instanceId}" (${message})`;
      });
    }
  }

  async removeUserInvitation(instanceId, userId) {
    try {
      const { data } = await this.transportLayer.removeUserInvitation(instanceId, userId);
      runInAction(() => {
        this.users = data && data.data ? data.data : [];
      });
    } catch (e) {
      runInAction(() => {
        const message = e.message ? e.message : e;
        this.error = `Error while removing invitation to user "${userId}" to review instance "${instanceId}" (${message})`;
      });
    }
  }
}

export default new InvitedUsersStore();