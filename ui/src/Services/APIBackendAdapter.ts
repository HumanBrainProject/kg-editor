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
import type API from './API';
import type { UUID, Stage, Settings, UserProfile, KGCoreResult, StructureOfType, InstanceLabel, InstanceFull, InstanceSummary, SuggestionStructure, Neighbor, Scope, UserSummary, IncomingLink, InstanceRawStructure, InstanceSummaryData, InstanceLabelData, InstanceFullData } from '../types';
import type { AxiosInstance } from 'axios';

const RELATIVE_ROOT_PATH = '/editor/api';

declare global {
	interface Window {
		rootPath?: string
	}
}

const getStage = (stage?: Stage) => {
  if(stage) {
    return `?stage=${stage}`;
  }
  return '';
};

const endpoints = {
  settings: () => `${RELATIVE_ROOT_PATH}/settings`,
  user: () => `${RELATIVE_ROOT_PATH}/users/me`,
  usersForReview: (search: string) => `${RELATIVE_ROOT_PATH}/users/search?search=${search}`,
  invitedUsers: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/invitedUsers`,
  inviteUser: (instanceId: UUID, userId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/users/${userId}/invite`,
  instancesList: (stage?: Stage) => `${RELATIVE_ROOT_PATH}/instancesBulk/list${getStage(stage)}`,
  instancesSummary: (stage?: Stage) => `${RELATIVE_ROOT_PATH}/instancesBulk/summary${getStage(stage)}`,
  instancesLabel: (stage?: Stage) => `${RELATIVE_ROOT_PATH}/instancesBulk/label${getStage(stage)}`,
  searchInstancesByType: (space: string, type: string, from: number, size: number, search: string) => `${RELATIVE_ROOT_PATH}/summary?space=${space}&type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${encodeURIComponent(search)}`,
  suggestions: (instanceId: UUID, field: string, sourceType: string, targetType: string, start:number, size:number, search: string) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/suggestions?field=${encodeURIComponent(field)}${sourceType?'&sourceType=' + encodeURIComponent(sourceType):''}${targetType?'&targetType=' + encodeURIComponent(targetType):''}&start=${start}&size=${size}&search=${search}`,
  instance: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}`,
  rawInstance: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/raw`,
  instanceScope: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/scope`,
  createInstance: (space: string, instanceId?: UUID) => `${RELATIVE_ROOT_PATH}/instances${instanceId?('/' + instanceId):''}?space=${space}`,
  moveInstance: (instanceId: UUID, space: string) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/spaces/${space}`,
  release: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/releases/${instanceId}/release`,
  releaseStatusTopInstance: () => `${RELATIVE_ROOT_PATH}/releases/status?releaseTreeScope=TOP_INSTANCE_ONLY`,
  releaseStatusChildren: () => `${RELATIVE_ROOT_PATH}/releases/status?releaseTreeScope=CHILDREN_ONLY`,
  neighbors: (instanceId: UUID) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/neighbors`,
  workspaceTypes: (space: string) => `${RELATIVE_ROOT_PATH}/spaces/${space}/types`,
  incomingLinks: (instanceId: UUID, property: string, type: string, from: number, size: number) => `${RELATIVE_ROOT_PATH}/instances/${instanceId}/incomingLinks?property=${encodeURIComponent(property)}&type=${encodeURIComponent(type)}&from=${from}&size=${size}`
};

class APIBackendAdapter implements API {
  private _axios: AxiosInstance;

  constructor(axios: AxiosInstance) {
    this._axios = axios;
  }

  async getSettings(): Promise<Settings> {
    const { data } = await this._axios.get(endpoints.settings());
    return data?.data as Settings;
  }

  async getUserProfile(): Promise<UserProfile> {
    const { data } = await this._axios.get(endpoints.user());
    return data?.data as UserProfile;
  }

  async getSpaceTypes(space: string): Promise<KGCoreResult<StructureOfType[]>> {
    const { data } = await this._axios.get(endpoints.workspaceTypes(space));
    return data;
  }

  async getInstance(instanceId: UUID): Promise<KGCoreResult<InstanceFull>> {
    const { data } = await this._axios.get(endpoints.instance(instanceId));
    return data;
  }

  async getRawInstance(instanceId: UUID): Promise<InstanceRawStructure> {
    const { data } = await this._axios.get(endpoints.rawInstance(instanceId));
    return data;
  }

  async deleteInstance(instanceId: UUID): Promise<void> {
    await this._axios.delete(endpoints.instance(instanceId));
  }

  async createInstance(space: string, instanceId: UUID, payload: object): Promise<KGCoreResult<InstanceFull>> {
    const { data } = await this._axios.post(endpoints.createInstance(space, instanceId), payload);
    return data;
  }

  async moveInstance(instanceId: UUID, space: string): Promise<void> {
    await this._axios.put(endpoints.moveInstance(instanceId, space));
  }

  async patchInstance(instanceId: UUID, payload: object): Promise<KGCoreResult<InstanceFull>> {
    const { data } = await this._axios.patch(endpoints.instance(instanceId), payload);
    return data;
  }

  async searchInstancesByType(space: string, type: string, from: number, size: number, search: string): Promise<KGCoreResult<InstanceSummary[]>> {
    const  { data } = await this._axios.get(endpoints.searchInstancesByType(space, type, from, size, search));
    return data;
  }

  async getSuggestions(instanceId: UUID, field: string, sourceType: string, targetType: string, from: number, size: number, search: string, payload: object): Promise<KGCoreResult<SuggestionStructure>> { //NOSONAR
    const { data } = await this._axios.post(endpoints.suggestions(instanceId, field, sourceType, targetType, from, size, search), payload);
    return data;
  }

  async getInstanceNeighbors(instanceId: UUID): Promise<KGCoreResult<Neighbor>> {
    const { data } = await this._axios.get(endpoints.neighbors(instanceId));
    return data;
  }

  async getInstanceScope(instanceId: UUID): Promise<KGCoreResult<Scope>> {
    const { data } = await this._axios.get(endpoints.instanceScope(instanceId));
    return data;
  }

  async getInstancesLabel(stage: Stage, instanceIds: UUID[]): Promise<KGCoreResult<InstanceLabelData>> {
    const { data } = await this._axios.post(endpoints.instancesLabel(stage), instanceIds);
    return data;
  }

  async getInstancesSummary(stage: Stage | undefined, instanceIds: UUID[]): Promise<KGCoreResult<InstanceSummaryData>> {
    const { data } = await this._axios.post(endpoints.instancesSummary(stage), instanceIds);
    return data;
  }

  async getInstancesList(stage: Stage, instanceIds: UUID[]): Promise<KGCoreResult<InstanceFullData>> {
    const { data } = await this._axios.post(endpoints.instancesList(stage), instanceIds);
    return data;
  }

  async getInvitedUsers(instanceId: UUID): Promise<KGCoreResult<UserSummary[]>> {
    const { data } = await this._axios.get(endpoints.invitedUsers(instanceId));
    return data;
  }

  async getUsersForReview(search: string): Promise<KGCoreResult<UserSummary[]>> {
    const { data } = await this._axios.get(endpoints.usersForReview(search));
    return data;
  }

  async inviteUser(instanceId: UUID, userId: UUID): Promise<KGCoreResult<UserSummary[]>> {
    const { data } = await this._axios.put(endpoints.inviteUser(instanceId, userId));
    return data;
  }

  async removeUserInvitation(instanceId: UUID, userId: UUID): Promise<KGCoreResult<UserSummary[]>> {
    const { data } =  await this._axios.delete(endpoints.inviteUser(instanceId, userId));
    return data;
  }

  async releaseInstance(instanceId: UUID): Promise<void> {
    await this._axios.put(endpoints.release(instanceId));
  }

  async unreleaseInstance(instanceId: UUID): Promise<void> {
    await this._axios.delete(endpoints.release(instanceId));
  }

  async getReleaseStatusTopInstance(instanceIds: UUID[]): Promise<KGCoreResult<Map<string, KGCoreResult<string>>>> {
    const { data } = await this._axios.post(endpoints.releaseStatusTopInstance(), instanceIds);
    return data;
  }

  async getReleaseStatusChildren(instanceIds: UUID[]): Promise<KGCoreResult<Map<string, KGCoreResult<string>>>> {
    const { data } = await this._axios.post(endpoints.releaseStatusChildren(), instanceIds);
    return  data;
  }

  async getMoreIncomingLinks(instanceId: UUID, property: string, type: string, from: number, size: number): Promise<KGCoreResult<IncomingLink[]>> {
    const { data } = await this._axios.get(endpoints.incomingLinks(instanceId, property, type, from, size));
    return data;
  }
}

export default APIBackendAdapter;
