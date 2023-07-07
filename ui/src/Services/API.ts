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
import type { Settings, UserProfile, KGCoreResult, UUID, Stage, StructureOfType, InstanceLabel, InstanceFull, InstanceSummary, SuggestionStructure, Neighbor, Scope, UserSummary, IncomingLink } from '../types';

interface APIErrorResponse {
  status: number;
  data: unknown;
}

export interface APIError {
  message?: string;
  code?: string;
  response?: APIErrorResponse;
}

interface API {

  getSettings(): Promise<Settings>;

  getUserProfile(): Promise<UserProfile>;

  getSpaceTypes(space: string): Promise<KGCoreResult<StructureOfType[]>>;

  getInstance(instanceId: UUID): Promise<KGCoreResult<InstanceFull>>;

  getRawInstance(instanceId: UUID): Promise<Map<string, unknown>>;

  deleteInstance(instanceId: UUID): Promise<void>;

  createInstance(space: string, instanceId: UUID, payload: object): Promise<KGCoreResult<InstanceFull>>;

  moveInstance(instanceId: UUID, space: string): Promise<void>;

  patchInstance(instanceId: UUID, payload: object):  Promise<KGCoreResult<InstanceFull>>;

  searchInstancesByType(space: string, type: string, from: number, size: number, search: string): Promise<KGCoreResult<InstanceSummary[]>>;

  getSuggestions(instanceId: UUID, field: string, sourceType: string, targetType: string, from: number, size: number, search: string, payload: object): Promise<KGCoreResult<SuggestionStructure>>;

  getInstanceNeighbors(instanceId: UUID): Promise<KGCoreResult<Neighbor>>;

  getInstanceScope(instanceId: UUID): Promise<KGCoreResult<Scope>>;

  getInstancesLabel(stage: Stage, instanceIds: UUID[]): Promise<KGCoreResult<Map<string, InstanceLabel>>>;

  getInstancesSummary(stage: Stage|undefined, instanceIds: UUID[]): Promise<KGCoreResult<Map<string, InstanceSummary>>>;

  getInstancesList(stage: Stage, instanceIds: UUID[]): Promise<KGCoreResult<Map<string, InstanceFull>>>;

  getInvitedUsers(instanceId: UUID): Promise<KGCoreResult<UserSummary[]>>;

  getUsersForReview(search: string): Promise<KGCoreResult<UserSummary[]>>;

  inviteUser(instanceId: UUID, userId: UUID): Promise<KGCoreResult<UserSummary[]>>;

  removeUserInvitation(instanceId: UUID, userId: UUID): Promise<KGCoreResult<UserSummary[]>>;

  releaseInstance(instanceId: UUID): Promise<void>;

  unreleaseInstance(instanceId: UUID): Promise<void>;

  getReleaseStatusTopInstance(instanceIds: UUID[]): Promise<KGCoreResult<Map<string, KGCoreResult<string>>>>;

  getReleaseStatusChildren(instanceIds: UUID[]): Promise<KGCoreResult<Map<string, KGCoreResult<string>>>>;

  getMoreIncomingLinks(instanceId: UUID, property: string, type: string, from: number, size: number): Promise<KGCoreResult<IncomingLink[]>>;
}

export default API;