package eu.ebrains.kg.editor.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.instance.InstanceFull;
import eu.ebrains.kg.editor.models.instance.InstanceSummary;
import eu.ebrains.kg.editor.models.instance.Neighbor;
import eu.ebrains.kg.editor.models.instance.SuggestionStructure;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class InstanceClient extends AbstractServiceClient {

    private ObjectMapper objectMapper;

    public InstanceClient(HttpServletRequest request, ObjectMapper jacksonObjectMapper) {
        super(request);
        this.objectMapper = jacksonObjectMapper;
    }

    public <T> Map<String, ResultWithOriginalMap<T>> getInstances(List<String> ids,
                                                                  String stage,
                                                                  boolean metadata,
                                                                  boolean returnAlternatives,
                                                                  boolean returnPermissions,
                                                                  boolean returnEmbedded,
                                                                  Class<T> clazz) {
        String uri = String.format("instancesByIds?stage=%s&metadata=%s&returnAlternatives=%s&returnPermissions=%s&returnEmbedded=%s", stage, metadata, returnAlternatives, returnPermissions, returnEmbedded);
        KGCoreResult.Single originalMap = post(uri)
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


    public List<ResultWithOriginalMap<InstanceSummary>> searchInstanceSummaries(String space,
                                                                                       String type,
                                                                                       Integer from,
                                                                                       Integer size,
                                                                                       String searchByLabel) {
        String uri = String.format("instances?stage=IN_PROGRESS&returnPermissions=true&type=%s&space=%s", type, space);
        if(searchByLabel!=null){
            uri = String.format("%s&searchByLabel=%s", uri, searchByLabel);
        }
        if (from != null) {
            uri = String.format("%s&from=%s", uri, from);
        }
        if (size != null) {
            uri = String.format("%s&size=%s", uri, size);
        }
        KGCoreResult.List response = get(uri).retrieve().bodyToMono(KGCoreResult.List.class).block();
        if(response!=null){
            return response.getData().stream().map(m -> new ResultWithOriginalMap<>(m, objectMapper.convertValue(m, InstanceSummary.class))).collect(Collectors.toList());
        }
        return null;
    }

    public Map getInstanceScope(String id) {
        String uri = String.format("instances/%s/scope?stage=IN_PROGRESS&returnPermissions=true", id);
        return get(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private static class NeighborFromKG extends KGCoreResult<Neighbor>{}
    public Neighbor getNeighbors(String id) {
        String uri = String.format("instances/%s/neighbors?stage=IN_PROGRESS", id);
        NeighborFromKG response = get(uri)
                .retrieve()
                .bodyToMono(NeighborFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    private static class SuggestionFromKG extends KGCoreResult<SuggestionStructure> {
    }

    public SuggestionStructure postSuggestions(String id,
                                               String field,
                                               String type,
                                               Integer start,
                                               Integer size,
                                               String search,
                                               Map<String, Object> payload) {
        String uri = String.format("instances/%s/suggestedLinksForProperty?stage=IN_PROGRESS&property=%s&from=%d&size=%d", id, field, start, size);
        if(StringUtils.isNotBlank(search)){
            uri += String.format("&search=%s", search);
        }
        if (StringUtils.isNotBlank(type)) {
            uri += String.format("&type=%s", type);
        }
        SuggestionFromKG response = post(uri)
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(SuggestionFromKG.class)
                .block();
        return response!=null ? response.getData() : null;
    }

    public ResultWithOriginalMap<InstanceFull> getInstance(String id) {
        String uri = String.format("instances/%s?stage=IN_PROGRESS&metadata=true&returnPermissions=true&returnAlternatives=true", id);
        KGCoreResult.Single response = get(uri)
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

    public void deleteInstance(String id) {
        String uri = String.format("instances/%s", id);
        delete(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public ResultWithOriginalMap<InstanceFull> patchInstance(String id, Map<?, ?> body) {
        String uri = String.format("instances/%s?returnPermissions=true&returnAlternatives=true", id);
        KGCoreResult.Single response = patch(uri)
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

    private <T> ResultWithOriginalMap<T> buildResultWithOriginalMap(Map data, Class<T> target) {
        if (data != null) {
            T mapped = objectMapper.convertValue(data, target);
            return new ResultWithOriginalMap<T>(data, mapped);
        }
        return null;
    }


    public ResultWithOriginalMap<InstanceFull> postInstance(String id, String workspace, Map<?, ?> body) {
        String uri = String.format("instances/%s?returnPermissions=true&space=%s&returnAlternatives=true", id, workspace);
        KGCoreResult.Single response = post(uri)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
        return buildResultWithOriginalMap(response, InstanceFull.class);
    }

}
