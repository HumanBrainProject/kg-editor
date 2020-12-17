package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.constants.CustomHeaders;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
public class InstanceClient {
    private final WebClient webClient = WebClient.builder().build();

    @Value("${kgcore.endpoint}")
    String kgCoreEndpoint;

    @Value("${kgcore.apiVersion}")
    String apiVersion;

    public Map getInstances(List<String> ids,
                            String stage,
                            boolean metadata,
                            boolean returnAlternatives,
                            boolean returnPermissions,
                            boolean returnEmbedded,
                            String token,
                            String clientToken) {
        String uri = String.format("%s/%s/instancesByIds?stage=%s&metadata=%s&returnAlternatives=%s&returnPermissions=%s&returnEmbedded=%s",
                kgCoreEndpoint, apiVersion, stage, metadata, returnAlternatives, returnPermissions, returnEmbedded);
        return webClient.post()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .body(BodyInserters.fromValue(ids))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map searchInstances(String space,
                               String type,
                               Integer from,
                               Integer size,
                               String searchByLabel,
                               String token,
                               String clientToken) {
        String uri = String.format("%s/%s/instances?stage=IN_PROGRESS&returnPermissions=true&type=%s&space=%s&searchByLabel=%s",
                kgCoreEndpoint, apiVersion, type, space, searchByLabel);
        if (from != null) {
            uri += String.format("&from=%s", from);
        }
        if (size != null) {
            uri += String.format("&size=%s", size);
        }
        return webClient.get()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getInstanceScope(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s/scope?stage=IN_PROGRESS&returnPermissions=true", kgCoreEndpoint, apiVersion, id);
        return webClient.get()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getNeighbors(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s/neighbors?stage=IN_PROGRESS", kgCoreEndpoint, apiVersion, id);
        return webClient.get()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
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
                               String payload,
                               String token,
                               String clientToken) {
        String uri = String.format("%s/%s/instances/%s/suggestedLinksForProperty?stage=IN_PROGRESS&property=%s&from=%d&size=%d&search=%s",
                kgCoreEndpoint, apiVersion, id, field, start, size, search);
        if (StringUtils.isNotBlank(type)) {
            uri += String.format("&type=%s", type);
        }
        return webClient.post()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getInstance(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s?stage=IN_PROGRESS&metadata=true&returnPermissions=true&returnAlternatives=true",
                kgCoreEndpoint, apiVersion, id);
        return webClient.get()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public void deleteInstance(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s", kgCoreEndpoint, apiVersion, id);
        webClient.delete()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map patchInstance(String id, String body, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s?returnPermissions=true&returnAlternatives=true",
                kgCoreEndpoint, apiVersion, id);
        return webClient.patch()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }


    public Map postInstance(String id, String workspace, String body, String token, String clientToken) {
        String uri = String.format("%s/%s/instances", kgCoreEndpoint, apiVersion);
        if (StringUtils.isNotBlank(id)) {
            uri += String.format("/%s", id);
        }
        uri += String.format("?returnPermissions=true&space=%s", workspace);
        return webClient.post()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }


}
