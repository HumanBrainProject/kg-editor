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
    "searchInstancesByBookmark": (workspace, bookmarkId, from, size, search) => `/editor/api/instances/filter?bookmarkId=${bookmarkId}&from=${from}&size=${size}&search=${search}`,
    "searchInstancesByType": (workspace, type, from, size, search) => `/editor/api/summary?workspace=${workspace}&type=${encodeURIComponent(type)}&from=${from}&size=${size}&searchByLabel=${search}`,
    "suggestions": (instanceId, field, type, start, size, search) => `/editor/api/instances/${instanceId}/suggestions?field=${encodeURIComponent(field)}${type?"&type=" + encodeURIComponent(type):""}&start=${start}&size=${size}&search=${search}`,
    "instance": instanceId => `/editor/api/instances/${instanceId}`,
    "instanceScope": instanceId => `/editor/api/instances/${instanceId}/scope`,
    "createInstance": (workspace, instanceId=null) => `/editor/api/instances${instanceId?("/" + instanceId):""}?workspace=${workspace}`,
    "release": instanceId => `/editor/api/releases/${instanceId}/release`,
    "messages": () => "/editor/api/directives/messages",
    "releaseStatusTopInstance": () => "/editor/api/releases/status?releaseTreeScope=TOP_INSTANCE_ONLY",
    "releaseStatusChildren": () => "/editor/api/releases/status?releaseTreeScope=CHILDREN_ONLY",
    "neighbors": instanceId => `/editor/api/instances/${instanceId}/neighbors`,
    "workspaceTypes": workspace => `/editor/api/workspaces/${workspace}/types`,
    "bookmark": (bookmarkId, workspace=null) => `/editor/api/bookmarks/${bookmarkId}${workspace?("?workspace=" + workspace):""}`,
    "bookmarks": workspace => `/editor/api/workspaces/${workspace}/bookmarks`,
    "instanceBookmarks": instanceId => `/editor/api/instances/${instanceId}/bookmarks`,
    "bookmarksByInstances": () => "/editor/api/instances/bookmarks"
  }
};

export default API;
