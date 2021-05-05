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
import eu.ebrains.kg.service.models.space.StructureOfIncomingLink;

import java.util.List;
import java.util.Map;

public class InstanceFull extends InstanceSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceFull(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions,
            @JsonProperty(EditorConstants.VOCAB_ALTERNATIVE) Map<String, List<Alternative>> kgAlternatives,
            @JsonProperty(EditorConstants.VOCAB_INCOMING_LINKS) Map<String,  Map<String, IncomingLinksByType>> kgIncomingLinks
    ){
        super(kgId, kgType, kgSpace, kgPermissions);
        this.alternatives = kgAlternatives;
        this.incomingLinks = kgIncomingLinks;
    }


    private final Map<String, List<Alternative>> alternatives;
    private String labelField;
    private List<String> promotedFields;
    private Map<String,  Map<String, IncomingLinksByType>> incomingLinks;
    private Map<String, StructureOfIncomingLink> possibleIncomingLinks;

    public Map<String, List<Alternative>> getAlternatives() {
        return alternatives;
    }

    public String getLabelField() {
        return labelField;
    }

    public void setLabelField(String labelField) {
        this.labelField = labelField;
    }

    public List<String> getPromotedFields() {
        return promotedFields;
    }

    public void setPromotedFields(List<String> promotedFields) {
        this.promotedFields = promotedFields;
    }

    public Map<String, StructureOfIncomingLink> getPossibleIncomingLinks() { return possibleIncomingLinks; }

    public void setPossibleIncomingLinks(Map<String, StructureOfIncomingLink> possibleIncomingLinks) {
        this.possibleIncomingLinks = possibleIncomingLinks;
    }

    public Map<String,  Map<String, IncomingLinksByType>> getIncomingLinks() {
        return incomingLinks;
    }

    public void setIncomingLinks(Map<String,  Map<String, IncomingLinksByType>> incomingLinks) {
        this.incomingLinks = incomingLinks;
    }
}
