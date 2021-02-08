package eu.ebrains.kg.editor.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.instance.*;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class InstanceClient {

    private final ObjectMapper objectMapper;
    private final ServiceCall kg;

    public InstanceClient(ServiceCall kg, ObjectMapper jacksonObjectMapper) {
        this.kg = kg;
        this.objectMapper = jacksonObjectMapper;
    }

    public <T> Map<String, ResultWithOriginalMap<T>> getInstances(List<String> ids,
                                                                  String stage,
                                                                  boolean metadata,
                                                                  boolean returnAlternatives,
                                                                  boolean returnPermissions,
                                                                  boolean returnEmbedded,
                                                                  Class<T> clazz) {
        String relativeUrl = String.format("instancesByIds?stage=%s&metadata=%s&returnAlternatives=%s&returnPermissions=%s&returnEmbedded=%s", stage, metadata, returnAlternatives, returnPermissions, returnEmbedded);
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
                    result.put(f, buildResultWithOriginalMap(r.getData(), clazz));
                }
            });
        }
        return result;
    }


    public KGCoreResult<List<ResultWithOriginalMap<InstanceSummary>>> searchInstanceSummaries(String space,
                                                                                       String type,
                                                                                       Integer from,
                                                                                       Integer size,
                                                                                       String searchByLabel) {
        String relativeUrl = String.format("instances?stage=IN_PROGRESS&returnPermissions=true&type=%s&space=%s", type, space);
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
                                               String type,
                                               Integer start,
                                               Integer size,
                                               String search,
                                               Map<String, Object> payload) {
        String relativeUrl = String.format("instances/%s/suggestedLinksForProperty?stage=IN_PROGRESS&property=%s&from=%d&size=%d", id, field, start, size);
        if(StringUtils.isNotBlank(search)){
            relativeUrl = String.format("%s&search=%s", relativeUrl, search);
        }
        if (StringUtils.isNotBlank(type)) {
            relativeUrl = String.format("%s&type=%s", relativeUrl, type);
        }
        return kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(SuggestionFromKG.class)
                .block();
    }

    public ResultWithOriginalMap<InstanceFull> getInstance(String id) {
        String relativeUrl = String.format("instances/%s?stage=IN_PROGRESS&metadata=true&returnPermissions=true&returnAlternatives=true", id);
        KGCoreResult.Single response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

    public void deleteInstance(String id) {
        String relativeUrl = String.format("instances/%s", id);
        kg.client().delete().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public ResultWithOriginalMap<InstanceFull> patchInstance(String id, Map<?, ?> body) {
        String relativeUrl = String.format("instances/%s?returnPermissions=true&returnAlternatives=true", id);
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


    public ResultWithOriginalMap<InstanceFull> postInstance(String id, String workspace, Map<?, ?> body) {
        String relativeUrl = String.format("instances/%s?returnPermissions=true&space=%s&returnAlternatives=true", id, workspace);
        KGCoreResult.Single response = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

    public ResultWithOriginalMap<InstanceFull> postInstance(String workspace, Map<?, ?> body) {
        String relativeUrl = String.format("instances?returnPermissions=true&space=%s&returnAlternatives=true", workspace);
        KGCoreResult.Single response = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

}
