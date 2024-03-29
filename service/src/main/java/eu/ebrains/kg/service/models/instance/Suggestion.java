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

public class Suggestion {
    private final String id;
    private final String name;
    private final String additionalInformation;
    private SimpleTypeWithSpaces type;
    private final String space;

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Suggestion(@JsonProperty("id") String kgId, @JsonProperty("label") String kgName, @JsonProperty("additionalInformation") String kgAdditionalInformation, @JsonProperty("type") String kgType, @JsonProperty("space") String kgSpace) {
        this.id = kgId;
        this.name = kgName;
        this.additionalInformation = kgAdditionalInformation;
        this.type = kgType != null ? new SimpleTypeWithSpaces(kgType, null, null, null, null) : null;
        this.space = kgSpace;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAdditionalInformation() {
        return additionalInformation;
    }

    public SimpleTypeWithSpaces getType() {
        return type;
    }

    public void setType(SimpleTypeWithSpaces type) {
        this.type = type;
    }

    public String getSpace() {
        return space;
    }
}
