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

package eu.ebrains.kg.service.models.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.constants.SchemaFieldsConstants;
import eu.ebrains.kg.service.models.commons.Permissions;

import java.util.List;

public class Space {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Space(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgId,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(EditorConstants.VOCAB_AUTO_RELEASE) Boolean kgAutoRelease,
            @JsonProperty(EditorConstants.VOCAB_CLIENT_SPACE) Boolean kgClientSpace,
            @JsonProperty(EditorConstants.VOCAB_INTERNAL_SPACE) Boolean kgInternalSpace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions
    ) {
        this.id = kgId;
        this.name = kgName;
        this.autorelease = kgAutoRelease;
        this.clientSpace = kgClientSpace;
        this.internalSpace = kgInternalSpace;
        this.permissions = Permissions.fromPermissionList(kgPermissions);
    }

    private final String id;
    private final String name;
    private final Boolean autorelease;
    private final Boolean clientSpace;
    private final Boolean internalSpace;
    private final Permissions permissions;

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Boolean getAutorelease() {
        return autorelease;
    }

    public Boolean getClientSpace() {
        return clientSpace;
    }

    public Boolean getInternalSpace() {
        return internalSpace;
    }

    public Permissions getPermissions() {
        return permissions;
    }
}
