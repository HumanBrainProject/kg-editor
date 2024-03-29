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
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.Map;

@Component
public class ReleaseClient {

    private final ServiceCall kg;

    public ReleaseClient(ServiceCall kg) {
        this.kg = kg;
    }

    public void putRelease(String id) {
        String relativeUrl = String.format("instances/%s/release",  id);
        kg.client(true).put().uri(kg.url(relativeUrl))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }

    public void deleteRelease(String id) {
        String relativeUrl = String.format("instances/%s/release", id);
        kg.client(true).delete().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private static class ReleaseStatusFromKG extends KGCoreResult<Map<String, KGCoreResult<String>>>{}

    public Map<String, KGCoreResult<String>> getReleaseStatus(List<String> ids, String releaseTreeScope) {
        String relativeUrl = String.format("instancesByIds/release/status?releaseTreeScope=%s", releaseTreeScope);
        ReleaseStatusFromKG response = kg.client(true).post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(ids))
                .retrieve()
                .bodyToMono(ReleaseStatusFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

}
