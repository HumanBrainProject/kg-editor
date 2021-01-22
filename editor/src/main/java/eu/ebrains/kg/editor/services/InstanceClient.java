package eu.ebrains.kg.editor.services;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Component
public class InstanceClient extends AbstractServiceClient {

    public InstanceClient(HttpServletRequest request) {
        super(request);
    }

    public Map getInstances(List<String> ids,
                            String stage,
                            boolean metadata,
                            boolean returnAlternatives,
                            boolean returnPermissions,
                            boolean returnEmbedded) {
        String uri = String.format("instancesByIds?stage=%s&metadata=%s&returnAlternatives=%s&returnPermissions=%s&returnEmbedded=%s", stage, metadata, returnAlternatives, returnPermissions, returnEmbedded);
        return post(uri).body(BodyInserters.fromValue(ids)).retrieve().bodyToMono(Map.class).block();
    }

    public Map searchInstances(String space,
                               String type,
                               Integer from,
                               Integer size,
                               String searchByLabel) {
        String uri = String.format("instances?stage=IN_PROGRESS&returnPermissions=true&type=%s&space=%s&searchByLabel=%s", type, space, searchByLabel);
        if (from != null) {
            uri += String.format("&from=%s", from);
        }
        if (size != null) {
            uri += String.format("&size=%s", size);
        }
        return get(uri).retrieve().bodyToMono(Map.class).block();
    }

    public Map getInstanceScope(String id) {
        String uri = String.format("instances/%s/scope?stage=IN_PROGRESS&returnPermissions=true", id);
        return get(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getNeighbors(String id) {
        String uri = String.format("instances/%s/neighbors?stage=IN_PROGRESS", id);
        return get(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map postSuggestions(String id,
                               String field,
                               String type,
                               Integer start,
                               Integer size,
                               String search,
                               String payload) {
        String uri = String.format("instances/%s/suggestedLinksForProperty?stage=IN_PROGRESS&property=%s&from=%d&size=%d&search=%s", id, field, start, size, search);
        if (StringUtils.isNotBlank(type)) {
            uri += String.format("&type=%s", type);
        }
        return post(uri)
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getInstance(String id) {
        String uri = String.format("instances/%s?stage=IN_PROGRESS&metadata=true&returnPermissions=true&returnAlternatives=true", id);
        return get(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public void deleteInstance(String id) {
        String uri = String.format("instances/%s", id);
        delete(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map patchInstance(String id, String body) {
        String uri = String.format("instances/%s?returnPermissions=true&returnAlternatives=true", id);
        return patch(uri)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }


    public Map postInstance(String id, String workspace, String body) {
        String uri = "instances";
        if (StringUtils.isNotBlank(id)) {
            uri = String.format("%s/%s", uri, id);
        }
        uri += String.format("?returnPermissions=true&space=%s", workspace);
        return post(uri)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }


}
