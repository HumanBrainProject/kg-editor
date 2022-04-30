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

const getStage = stage => {
  if(stage) {
    return `?stage=${stage}`;
  }
  return "";
}

const API = {
  endpoints: {
    "auth": () => "/editor/api/auth/endpoint",
    "user": () => "/editor/api/users/me",
    "userPicture": () => "/editor/api/users/picture",
    "userInfo": user => `/editor/api/review/user/${user}`,
    "usersForReview": search => `/editor/api/users/search?search=${search}`,
    "instanceReviews": instanceId => `/editor/api/instances/${instanceId}/invitedUsers`,
    "inviteUserToReviewInstance": (instanceId, userId) => `/editor/api/instances/${instanceId}/users/${userId}/invite`,
    "features": () => `${window.rootPath}/data/features.json`,
    "instancesList": (stage=null) => `/editor/api/instancesBulk/list${getStage(stage)}`,
    "instancesSummary": (stage=null) => `/editor/api/instancesBulk/summary${getStage(stage)}`,
    "instancesLabel": (stage=null) => `/editor/api/instancesBulk/label${getStage(stage)}`,
    "searchInstancesByType": (space, type, from, size, search) => `/editor/api/summary?space=${space}&type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${search}`,
    "suggestions": (instanceId, field, sourceType, targetType, start, size, search) => `/editor/api/instances/${instanceId}/suggestions?field=${encodeURIComponent(field)}${sourceType?"&sourceType=" + encodeURIComponent(sourceType):""}${targetType?"&targetType=" + encodeURIComponent(targetType):""}&start=${start}&size=${size}&search=${search}`,
    "instance": instanceId => `/editor/api/instances/${instanceId}`,
    "rawInstance": instanceId => `/editor/api/instances/${instanceId}/raw`,
    "instanceScope": instanceId => `/editor/api/instances/${instanceId}/scope`,
    "createInstance": (space, instanceId=null) => `/editor/api/instances${instanceId?("/" + instanceId):""}?space=${space}`,
    "moveInstance": (instanceId, space) => `/editor/api/instances/${instanceId}/spaces/${space}`,
    "release": instanceId => `/editor/api/releases/${instanceId}/release`,
    "messages": () => "/editor/api/directives/messages",
    "releaseStatusTopInstance": () => "/editor/api/releases/status?releaseTreeScope=TOP_INSTANCE_ONLY",
    "releaseStatusChildren": () => "/editor/api/releases/status?releaseTreeScope=CHILDREN_ONLY",
    "neighbors": instanceId => `/editor/api/instances/${instanceId}/neighbors`,
    "workspaceTypes": space => `/editor/api/spaces/${space}/types`,
    "incomingLinks": (instanceId, property, type, from, size) => `/editor/api/instances/${instanceId}/incomingLinks?property=${encodeURIComponent(property)}&type=${encodeURIComponent(type)}&from=${from}&size=${size}`
  }
};

export default API;
