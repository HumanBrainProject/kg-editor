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
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.models.Error;
import eu.ebrains.kg.service.models.HasError;
import eu.ebrains.kg.service.models.HasId;

import java.util.List;
import java.util.stream.Collectors;

public class InstanceLabel implements HasId, HasError {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceLabel(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace
    ) {
        this.id = kgId;
        this.types = handleTypes(kgType);
        this.space = kgSpace;
    }

    private List<SimpleType> handleTypes(List<String> types) {
        return types != null ? types.stream().map(SimpleType::new).collect(Collectors.toList()) : null;
    }

    private final String space;
    private final List<SimpleType> types;

    private String id;
    private String name;
    private Error error;

    @Override
    public void setError(Error error) { this.error=error; }

    @Override
    public Error getError() { return error; }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public String getId() {
        return id;
    }

    public String getSpace() {
        return space;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
