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
import eu.ebrains.kg.service.models.KGCoreResult;

import java.util.List;
import java.util.Map;

public class SuggestionStructure {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public SuggestionStructure(@JsonProperty("suggestions") KGCoreResult<List<Suggestion>> kgSuggestions, @JsonProperty("types") Map<String, SimpleTypeWithSpaces> kgTypes) {
        this.suggestions = kgSuggestions;
        this.types = kgTypes;
    }

    private KGCoreResult<List<Suggestion>>  suggestions;
    private final Map<String, SimpleTypeWithSpaces> types;

    public KGCoreResult<List<Suggestion>> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(KGCoreResult<List<Suggestion>> suggestions) {
        this.suggestions = suggestions;
    }

    public Map<String, SimpleTypeWithSpaces> getTypes() {
        return types;
    }
}
