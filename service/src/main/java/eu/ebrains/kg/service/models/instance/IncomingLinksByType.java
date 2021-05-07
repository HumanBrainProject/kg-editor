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

import java.util.List;

public class IncomingLinksByType {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public IncomingLinksByType(
            @JsonProperty(SchemaFieldsConstants.NAME) String kgLabel,
            @JsonProperty(EditorConstants.VOCAB_COLOR) String kgColor,
            @JsonProperty("data") List<IncomingLink> kgData,
            @JsonProperty("totalResults") int kgTotal,
            @JsonProperty("from") int kgFrom,
            @JsonProperty("size") int kgSize,
            @JsonProperty(EditorConstants.VOCAB_NAME_FOR_REVERSE_LINK) String kgNameForReverseLink
    ){
        this.label = kgLabel;
        this.color = kgColor;
        this.data = kgData;
        this.total = kgTotal;
        this.from = kgFrom;
        this.size = kgSize;
        this.nameForReverseLink = kgNameForReverseLink;
    }

    private final String label;
    private final String color;
    private final List<IncomingLink> data;
    private final int total;
    private final int from;
    private final int size;
    private final String nameForReverseLink;

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }


    public List<IncomingLink> getData() {
        return data;
    }

    public int getTotal() {
        return total;
    }

    public int getFrom() {
        return from;
    }

    public int getSize() {
        return size;
    }

    public String getNameForReverseLink() {
        return nameForReverseLink;
    }
}
