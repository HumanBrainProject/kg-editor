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

const API = {
  endpoints: {
    "auth": () => "/editor/api/auth/endpoint",
    "user": () => "/editor/api/user",
    "userPicture": () => "/editor/api/user/picture",
    "userInfo": user => `/editor/api/review/user/${user}`,
    "usersForReview": (from, size, search) => `/editor/api/review/users?from=${from}&size=${size}&search=${search}`,
    "instanceReviews": instanceId => `/editor/api/scopes/${instanceId}`,
    "inviteUserToReviewInstance": (userId, instanceId) => `/editor/api/scopes/${instanceId}/${userId}`,
    "features": () => `${window.rootPath}/data/features.json`,
    "instancesList": (stage=null) => `/editor/api/instancesBulk/list${stage?`?stage=${stage}`:"" }`,
    "instancesSummary": (stage=null) => `/editor/api/instancesBulk/summary${stage?`?stage=${stage}`:"" }`,
    "instancesLabel": (stage=null) => `/editor/api/instancesBulk/label${stage?`?stage=${stage}`:"" }`,
    "searchInstancesByBookmark": (space, bookmarkId, from, size, search) => `/editor/api/instances/filter?bookmarkId=${bookmarkId}&from=${from}&size=${size}&search=${search}`,
    "searchInstancesByType": (space, type, from, size, search) => `/editor/api/summary?space=${space}&type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${search}`,
    "suggestions": (instanceId, field, sourceType, targetType, start, size, search) => `/editor/api/instances/${instanceId}/suggestions?field=${encodeURIComponent(field)}${sourceType?"&sourceType=" + encodeURIComponent(sourceType):""}}${targetType?"&targetType=" + encodeURIComponent(targetType):""}&start=${start}&size=${size}&search=${search}`,
    "instance": instanceId => `/editor/api/instances/${instanceId}`,
    "instanceScope": instanceId => `/editor/api/instances/${instanceId}/scope`,
    "createInstance": (space, instanceId=null) => `/editor/api/instances${instanceId?("/" + instanceId):""}?space=${space}`,
    "release": instanceId => `/editor/api/releases/${instanceId}/release`,
    "messages": () => "/editor/api/directives/messages",
    "releaseStatusTopInstance": () => "/editor/api/releases/status?releaseTreeScope=TOP_INSTANCE_ONLY",
    "releaseStatusChildren": () => "/editor/api/releases/status?releaseTreeScope=CHILDREN_ONLY",
    "neighbors": instanceId => `/editor/api/instances/${instanceId}/neighbors`,
    "workspaceTypes": space => `/editor/api/spaces/${space}/types`,
    "bookmark": (bookmarkId, space=null) => `/editor/api/bookmarks/${bookmarkId}${space?("?space=" + space):""}`,
    "bookmarks": space => `/editor/api/spaces/${space}/bookmarks`,
    "instanceBookmarks": instanceId => `/editor/api/instances/${instanceId}/bookmarks`,
    "bookmarksByInstances": () => "/editor/api/instances/bookmarks",
    "incomingLinks": (instanceId, property, type, from, size) => `/editor/api/instances/${instanceId}/incomingLinks?property=${encodeURIComponent(property)}&type=${encodeURIComponent(type)}&from=${from}&size=${size}`,
  }
};

export default API;
