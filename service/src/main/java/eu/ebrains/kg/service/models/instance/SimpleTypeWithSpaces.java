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
import eu.ebrains.kg.service.constants.SchemaFieldsConstants;
import eu.ebrains.kg.service.models.type.SimpleType;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class SimpleTypeWithSpaces extends SimpleType {


    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public SimpleTypeWithSpaces(@JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgName,
                                @JsonProperty(SchemaFieldsConstants.NAME) String kgLabel,
                                @JsonProperty(SchemaFieldsConstants.DESCRIPTION) String kgDescription,
                                @JsonProperty(EditorConstants.VOCAB_COLOR) String kgColor,
                                @JsonProperty(EditorConstants.VOCAB_SPACES) List<Map<String, String>> kgSpaces) {
        super(kgName);
        this.setLabel(kgLabel);
        this.setColor(kgColor);
        this.setDescription(kgDescription);
        this.space = kgSpaces!=null ? kgSpaces.stream().map(s ->
                s.get(EditorConstants.VOCAB_SPACE)).filter(Objects::nonNull).collect(Collectors.toList()) : null;
    }

    private List<String> space;

    public List<String> getSpace() {
        return space;
    }

    public void setSpace(List<String> space) {
        this.space = space;
    }
}
