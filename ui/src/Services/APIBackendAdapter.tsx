/*  Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0.
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  This open source software code was developed in part or in whole in the
 *  Human Brain Project, funded from the European Union's Horizon 2020
 *  Framework Programme for Research and Innovation under
 *  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 *  (Human Brain Project SGA1, SGA2 and SGA3).
 *
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
 *
 */
import { AxiosInstance } from "axios";
import API from "./API";
import { UUID, Stage, Settings, UserProfile } from "../types";

const RELATIVE_ROOT_PATH = "/editor/api";

declare global {
	interface Window {
		rootPath?: string
	}
}

const getStage = (stage?: Stage) => {
  if(stage) {
    return `?stage=${stage}`;
  }
  return "";
}

const endpoints = {
  settings: () => `${RELATIVE_ROOT_PATH}/settings`,
  user: () => "${RELATIVE_ROOT_PATH}/users/me",
  usersForReview: (search: string) => `${RELATIVE_ROOT_PATH}/users/search?search=${search}`,
  invitedUsers: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/invitedUsers`,
  inviteUser: (instanceId: UUID, userId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/users/${userId}/invite`,
  features: () => `${window.rootPath}/data/features.json`,
  instancesList: (stage?: Stage) => `${RELATIVE_ROOT_PATH}/instancesBulk/list${getStage(stage)}`,
  instancesSummary: (stage?: Stage) => `${RELATIVE_ROOT_PATH}/instancesBulk/summary${getStage(stage)}`,
  instancesLabel: (stage?: Stage) => `${RELATIVE_ROOT_PATH}/instancesBulk/label${getStage(stage)}`,
  searchInstancesByType: (space: string, type: string, from: number, size: number, search: string) => `${RELATIVE_ROOT_PATH}/summary?space=${space}&type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${encodeURIComponent(search)}`,
  suggestions: (instanceId: UUID, field: string, sourceType: string, targetType: string, start, size, search: string) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/suggestions?field=${encodeURIComponent(field)}${sourceType?"&sourceType=" + encodeURIComponent(sourceType):""}${targetType?"&targetType=" + encodeURIComponent(targetType):""}&start=${start}&size=${size}&search=${search}`,
  instance: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}`,
  rawInstance: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/raw`,
  instanceScope: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/scope`,
  createInstance: (space: string, instanceId?: UUID) => `${RELATIVE_ROOT_PATH}/instances${instanceId?("/" + instanceId):""}?space=${space}`,
  moveInstance: (instanceId: UUID, space: string) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/spaces/${space}`,
  release: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/releases/${instanceId}/release`,
  messages: () => `${RELATIVE_ROOT_PATH}/directives/messages`,
  releaseStatusTopInstance: () => `${RELATIVE_ROOT_PATH}/releases/status?releaseTreeScope=TOP_INSTANCE_ONLY`,
  releaseStatusChildren: () => `${RELATIVE_ROOT_PATH}/releases/status?releaseTreeScope=CHILDREN_ONLY`,
  neighbors: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/neighbors`,
  workspaceTypes: (space: string) => `${RELATIVE_ROOT_PATH}/spaces/${space}/types`,
  incomingLinks: (instanceId: UUID, property: string, type: string, from: number, size: number) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/incomingLinks?property=${encodeURIComponent(property)}&type=${encodeURIComponent(type)}&from=${from}&size=${size}`
};

class APIBackendAdapter implements API {
  _axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this._axios = axios;
  }
  
  async getSettings(): Promise<Settings> {
    const { data } = await await this._axios.get(endpoints.settings());
    return data?.data as Settings;
  }

  async getUserProfile() {
    const { data } = await this._axios.get(endpoints.user());
    return data?.data as UserProfile;
  }

  async getSpaceTypes(space: string) {
    await this._axios.get(endpoints.workspaceTypes(space));
  }

  async getInstance(instanceId: UUID) {
    await this._axios.get(endpoints.instance(instanceId));
  }

  async getRawInstance(instanceId: UUID) {
    await this._axios.get(endpoints.rawInstance(instanceId));
  }

  async deleteInstance(instanceId: UUID) {
    await this._axios.delete(endpoints.instance(instanceId));
  }

  async createInstance(space, instanceId: UUID, payload: object) {
    await this._axios.post(endpoints.createInstance(space, instanceId), payload);
  }

  async moveInstance(instanceId: UUID, space: string) {
    await this._axios.put(endpoints.moveInstance(instanceId, space));
  }

  async patchInstance(instanceId: UUID, payload: object) {
    await this._axios.patch(endpoints.instance(instanceId), payload);
  }

  async searchInstancesByType(space: string, type: string, from: number, size: number, search: string) {
    await this._axios.get(endpoints.searchInstancesByType(space, type, from, size, search));
  }

  async getSuggestions(instanceId: UUID, field: string, sourceType: string, targetType: string, from: number, size: number, search: string, payload: object) { //NOSONAR
    await this._axios.post(endpoints.suggestions(instanceId, field, sourceType, targetType, from, size, search), payload);
  }

  async getInstanceNeighbors(instanceId: UUID) {
    await this._axios.get(endpoints.neighbors(instanceId));
  }

  async getInstanceScope(instanceId: UUID) {
    await this._axios.get(endpoints.instanceScope(instanceId));
  }

  async getInstancesLabel(stage: Stage, instanceIds: UUID[]) {
    await this._axios.post(endpoints.instancesLabel(stage), instanceIds);
  }

  async getInstancesSummary(stage: Stage, instanceIds: UUID[]) {
    await this._axios.post(endpoints.instancesSummary(stage), instanceIds);
  }

  async getInstancesList(stage: Stage, instanceIds: UUID[]) {
    await this._axios.post(endpoints.instancesList(stage), instanceIds);
  }

  async getInvitedUsers(instanceId: UUID) {
    await this._axios.get(endpoints.invitedUsers(instanceId));
  }

  async getUsersForReview(search: string) {
    await this._axios.get(endpoints.usersForReview(search));
  }

  async inviteUser(instanceId: UUID, userId: UUID) {
    await this._axios.put(endpoints.inviteUser(instanceId, userId));
  }

  async removeUserInvitation(instanceId: UUID, userId: UUID) {
    await this._axios.delete(endpoints.inviteUser(instanceId, userId));
  }

  async getMessages() {
    await this._axios.get(endpoints.messages());
  }

  async releaseInstance(instanceId: UUID) {
    await this._axios.put(endpoints.release(instanceId));
  }

  async unreleaseInstance(instanceId: UUID) {
    await this._axios.delete(endpoints.release(instanceId));
  }

  async getReleaseStatusTopInstance(instanceIds: UUID[]) {
    await this._axios.post(endpoints.releaseStatusTopInstance(), instanceIds);
  }

  async getReleaseStatusChildren(instanceIds: UUID[]) {
    await this._axios.post(endpoints.releaseStatusChildren(), instanceIds);
  }

  async getFeatures() {
    await this._axios.get(endpoints.features());
  }

  async getMoreIncomingLinks(instanceId: UUID, property: string, type: string, from: number, size: number) {
    await this._axios.get(endpoints.incomingLinks(instanceId, property, type, from, size));
  }
}

export default APIBackendAdapter;
