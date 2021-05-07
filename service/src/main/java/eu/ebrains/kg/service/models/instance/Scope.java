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

package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.models.commons.Permissions;

import java.util.List;
import java.util.stream.Collectors;

public class Scope {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Scope(@JsonProperty("id") String kgId,
                 @JsonProperty("label") String kgLabel,
                 @JsonProperty("types") List<String> kgTypes,
                 @JsonProperty("children") List<Scope> kgChildren,
                 @JsonProperty("permissions") List<String> permissions) {
        this.id = kgId;
        this.label = kgLabel;
        this.types = kgTypes!=null ? kgTypes.stream().map(SimpleType::new).collect(Collectors.toList()) : null;
        this.permissions = Permissions.fromPermissionList(permissions);
        this.children = kgChildren;
    }

    private final String id;
    private final String label;
    private final Permissions permissions;
    private final List<Scope> children;
    private List<SimpleType> types;
    private String status;

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public Permissions getPermissions() {
        return permissions;
    }

    public List<Scope> getChildren() {
        return children;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public void setTypes(List<SimpleType> types) {
        this.types = types;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
