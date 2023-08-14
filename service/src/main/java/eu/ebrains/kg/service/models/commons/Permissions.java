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

package eu.ebrains.kg.service.models.commons;

import java.util.List;

public class Permissions {

    private Permissions(boolean canCreate, boolean canInviteForReview, boolean canDelete, boolean canInviteForSuggestion, boolean canRead, boolean canSuggest, boolean canWrite, boolean canRelease, boolean canManageSpace) { // NOSONAR
        this.canCreate = canCreate;
        this.canInviteForReview = canInviteForReview;
        this.canDelete = canDelete;
        this.canInviteForSuggestion = canInviteForSuggestion;
        this.canRead = canRead;
        this.canSuggest = canSuggest;
        this.canWrite = canWrite;
        this.canRelease = canRelease;
        this.canManageSpace = canManageSpace;
    }

    public static Permissions fromPermissionList(List<String> permissions){
        return permissions == null ? null : new Permissions(
                permissions.contains("CREATE"),
                permissions.contains("INVITE_FOR_REVIEW"),
                permissions.contains("DELETE"),
                permissions.contains("INVITE_FOR_SUGGESTION"),
                permissions.contains("READ"),
                permissions.contains("SUGGEST"),
                permissions.contains("WRITE"),
                permissions.contains("RELEASE"),
                permissions.contains("DEFINE_TYPES_AND_PROPERTIES")
        );
    }

    private final boolean canCreate;
    private final boolean canInviteForReview;
    private final boolean canDelete;
    private final boolean canInviteForSuggestion;
    private final boolean canRead;
    private final boolean canSuggest;
    private final boolean canWrite;
    private final boolean canRelease;
    private final boolean canManageSpace;

    public boolean isCanCreate() {
        return canCreate;
    }

    public boolean isCanInviteForReview() {
        return canInviteForReview;
    }

    public boolean isCanDelete() {
        return canDelete;
    }

    public boolean isCanInviteForSuggestion() {
        return canInviteForSuggestion;
    }

    public boolean isCanRead() {
        return canRead;
    }

    public boolean isCanSuggest() {
        return canSuggest;
    }

    public boolean isCanWrite() {
        return canWrite;
    }

    public boolean isCanRelease() {
        return canRelease;
    }

    public boolean isCanManageSpace() {
        return canManageSpace;
    }
}
