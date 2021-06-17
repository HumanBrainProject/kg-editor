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

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.service.controllers.IdController;
import eu.ebrains.kg.service.models.HasError;
import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.ResultWithOriginalMap;
import eu.ebrains.kg.service.models.instance.*;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class InstanceClient {

    private final int INCOMING_LINKS_PAGE_SIZE = 10;

    private final IdController idController;
    private final ObjectMapper objectMapper;
    private final ServiceCall kg;

    public InstanceClient(IdController idController, ServiceCall kg, ObjectMapper jacksonObjectMapper) {
        this.idController = idController;
        this.kg = kg;
        this.objectMapper = jacksonObjectMapper;
    }

    public <T extends HasError> Map<String, ResultWithOriginalMap<T>> getInstances(List<String> ids,
                                                                                   String stage,
                                                                                   boolean metadata,
                                                                                   boolean returnAlternatives,
                                                                                   boolean returnPermissions,
                                                                                   boolean returnEmbedded,
                                                                                   boolean returnIncomingLinks,
                                                                                   Class<T> clazz) {
        String incomingLinksPageSizeParam = returnIncomingLinks?String.format("&incomingLinksPageSize=%d", INCOMING_LINKS_PAGE_SIZE):"";
        String relativeUrl = String.format("instancesByIds?stage=%s&metadata=%b&returnAlternatives=%b&returnPermissions=%b&returnEmbedded=%b&returnIncomingLinks=%b%s", stage, metadata, returnAlternatives, returnPermissions, returnEmbedded, returnIncomingLinks, incomingLinksPageSizeParam);
        KGCoreResult.Single originalMap = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(ids))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        HashMap<String, ResultWithOriginalMap<T>> result = new HashMap<>();
        if (originalMap != null && originalMap.getData() != null) {
            originalMap.getData().keySet().forEach(f -> {
                Object o = originalMap.getData().get(f);
                KGCoreResult.Single r = objectMapper.convertValue(o, KGCoreResult.Single.class);
                if(f != null && r.getData() != null) {
                    if (r.getData() != null) {
                        result.put(f, buildResultWithOriginalMap(r.getData(), clazz));
                    } else if (r.getError() != null) {
                        T t = objectMapper.convertValue(new HashMap<>(), clazz);
                        t.setError(r.getError());
                        result.put(f,  new ResultWithOriginalMap<T>(null, t));
                    }
                }
            });
        }
        return result;
    }

    private static class IncomingLinksResult extends KGCoreResult<List<IncomingLink>> {};

    public KGCoreResult<List<IncomingLink>> getIncomingLinks(String id,
                                                        String property,
                                                        String type,
                                                        Integer from,
                                                        Integer size) {

        String relativeUrl = String.format("instances/%s/incomingLinks?stage=IN_PROGRESS&property=%s&type=%s&from=%d&size=%d", id, property, type, from, size);
        IncomingLinksResult response = kg.client().get().uri(kg.url(relativeUrl)).retrieve().bodyToMono(IncomingLinksResult.class).block();
        if(response!=null){
            response.getData().forEach(lk -> {
                        UUID uuid = idController.simplifyFullyQualifiedId(lk.getId());
                        if(uuid!=null){
                            lk.setId(uuid.toString());
                        }

            });
            return response;
        }
        return null;
    }

    public KGCoreResult<List<ResultWithOriginalMap<InstanceSummary>>> searchInstanceSummaries(String space,
                                                                                       String type,
                                                                                       Integer from,
                                                                                       Integer size,
                                                                                       String searchByLabel) {
        String relativeUrl = String.format("instances?stage=IN_PROGRESS&sortByLabel=true&returnPermissions=true&type=%s&space=%s", type, space);
        if(searchByLabel!=null){
            relativeUrl = String.format("%s&searchByLabel=%s", relativeUrl, searchByLabel);
        }
        if (from != null) {
            relativeUrl = String.format("%s&from=%s", relativeUrl, from);
        }
        if (size != null) {
            relativeUrl = String.format("%s&size=%s", relativeUrl, size);
        }
        KGCoreResult.List response = kg.client().get().uri(kg.url(relativeUrl)).retrieve().bodyToMono(KGCoreResult.List.class).block();
        if(response!=null){
            List<ResultWithOriginalMap<InstanceSummary>> resultList = response.getData().stream().map(m -> new ResultWithOriginalMap<>(m, objectMapper.convertValue(m, InstanceSummary.class))).collect(Collectors.toList());
            return new KGCoreResult<List<ResultWithOriginalMap<InstanceSummary>>>().setData(resultList).setTotalResults(response.getTotal()).setFrom(response.getFrom()).setSize(response.getSize());
        }
        return null;
    }

    private static class ScopeFromKG extends KGCoreResult<Scope>{}

    public Scope getInstanceScope(String id) {
        String relativeUrl = String.format("instances/%s/scope?stage=IN_PROGRESS&returnPermissions=true", id);
        ScopeFromKG response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(ScopeFromKG.class)
                .block();
        return response!=null ? response.getData() : null;
    }

    private static class NeighborFromKG extends KGCoreResult<Neighbor>{}
    public KGCoreResult<Neighbor> getNeighbors(String id) {
        String relativeUrl = String.format("instances/%s/neighbors?stage=IN_PROGRESS", id);
        return kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(NeighborFromKG.class)
                .block();
    }

    private static class SuggestionFromKG extends KGCoreResult<SuggestionStructure> {
    }

    public KGCoreResult<SuggestionStructure> postSuggestions(String id,
                                               String field,
                                               String sourceType,
                                               String targetType,
                                               Integer start,
                                               Integer size,
                                               String search,
                                               Map<String, Object> payload) {
        String relativeUrl = String.format("instances/%s/suggestedLinksForProperty?stage=IN_PROGRESS&property=%s&from=%d&size=%d", id, field, start, size);
        if(StringUtils.isNotBlank(search)){
            relativeUrl = String.format("%s&search=%s", relativeUrl, search);
        }
        if (StringUtils.isNotBlank(sourceType)) {
            relativeUrl = String.format("%s&sourceType=%s", relativeUrl, sourceType);
        }
        if (StringUtils.isNotBlank(targetType)) {
            relativeUrl = String.format("%s&targetType=%s", relativeUrl, targetType);
        }
        return kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(SuggestionFromKG.class)
                .block();
    }

    public ResultWithOriginalMap<InstanceFull> getInstance(String id) {
        String relativeUrl = String.format("instances/%s?stage=IN_PROGRESS&returnPermissions=true&returnAlternatives=true&returnIncomingLinks=true&incomingLinksPageSize=%d", id, INCOMING_LINKS_PAGE_SIZE);
        KGCoreResult.Single response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

    public KGCoreResult.Single getRawInstance(String id) {
        String relativeUrl = String.format("instances/%s?stage=IN_PROGRESS&returnEmbedded=true", id);
        return kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
    }

    public void deleteInstance(String id) {
        String relativeUrl = String.format("instances/%s", id);
        kg.client().delete().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public ResultWithOriginalMap<InstanceFull> patchInstance(String id, Map<?, ?> body) {
        String relativeUrl = String.format("instances/%s?returnPermissions=true&returnAlternatives=true&returnIncomingLinks=true&incomingLinksPageSize=%d", id, INCOMING_LINKS_PAGE_SIZE);
        KGCoreResult.Single response = kg.client().patch().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }


    private <T> ResultWithOriginalMap<T> buildResultWithOriginalMap(KGCoreResult.Single response, Class<T> target) {
        if (response != null) {
            return buildResultWithOriginalMap(response.getData(), target);
        }
        return null;
    }

    private <T> ResultWithOriginalMap<T> buildResultWithOriginalMap(Map<?,?> data, Class<T> target) {
        if (data != null) {
            T mapped = objectMapper.convertValue(data, target);
            return new ResultWithOriginalMap<T>(data, mapped);
        }
        return null;
    }


    public ResultWithOriginalMap<InstanceFull> postInstance(String id, String space, Map<?, ?> body) {
        String relativeUrl = String.format("instances/%s?returnPermissions=true&space=%s&returnAlternatives=true", id, space);
        KGCoreResult.Single response = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

    public ResultWithOriginalMap<InstanceFull> postInstance(String space, Map<?, ?> body) {
        String relativeUrl = String.format("instances?returnPermissions=true&space=%s&returnAlternatives=true", space);
        KGCoreResult.Single response = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

}
