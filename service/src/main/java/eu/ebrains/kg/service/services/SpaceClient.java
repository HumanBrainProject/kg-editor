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

package eu.ebrains.kg.service.services;

import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.user.Space;
import eu.ebrains.kg.service.models.type.StructureOfType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.Map;

@Component
public class SpaceClient {

    private final ServiceCall kg;

    public SpaceClient(ServiceCall kg) {
        this.kg = kg;
    }

    private static class SpaceResultFromKG extends KGCoreResult<Space> {}
    private static class SpacesResultFromKG extends KGCoreResult<List<Space>> {}

    public List<Space> getSpaces() {
        String relativeUrl = "spaces?permissions=true";
        KGCoreResult<List<Space>> response = kg.client(true).get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(SpacesResultFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    public Space getSpace(String space) {
        String relativeUrl = String.format("spaces/%s", space);
        KGCoreResult<Space> response = kg.client(true).get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(SpaceResultFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    public void setSpecification(String space) {
        String relativeUrl = String.format("spaces/%s/specification", space);
        kg.client(false).put().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    public void setAssignType(String space, String type) {
        String relativeUrl = String.format("spaces/%s/types?type=%s", space, type);
        kg.client(false).put().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(type))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }

    private static class StructureTypeResultFromKG extends KGCoreResult<List<StructureOfType>> {
    }

    public List<StructureOfType> getSpaceTypes(String space) {
        String relativeUrl = String.format("types?stage=IN_PROGRESS&space=%s&withProperties=true&withIncomingLinks=true", space);
        StructureTypeResultFromKG response = kg.client(true).get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(StructureTypeResultFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }


    private static class StructureOfTypeByNameFromKG extends KGCoreResult<Map<String, KGCoreResult<StructureOfType>>> {
    }

    public Map<String, KGCoreResult<StructureOfType>> getTypesByName(List<String> types, boolean withProperties) {
        String relativeUrl = String.format("typesByName?stage=IN_PROGRESS&withProperties=%s", withProperties);
        StructureOfTypeByNameFromKG response = kg.client(true).post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(types))
                .retrieve()
                .bodyToMono(StructureOfTypeByNameFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

}
