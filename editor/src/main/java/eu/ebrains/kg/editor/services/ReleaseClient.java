package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.constants.CustomHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
public class ReleaseClient {
    private final WebClient webClient = WebClient.builder().build();

    @Value("${kgcore.endpoint}")
    String kgCoreEndpoint;

    @Value("${kgcore.apiVersion}")
    String apiVersion;


    public Map getRelease(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/%s/graph", kgCoreEndpoint, apiVersion, id);
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

    public Map putRelease(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s/release", kgCoreEndpoint, apiVersion, id);
        return webClient.put()
                .uri(uri)
                .headers(h -> {
                    h.add(HttpHeaders.AUTHORIZATION, token);
                    h.add(CustomHeaders.CLIENT_AUTHORIZATION, clientToken);
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public void deleteRelease(String id, String token, String clientToken) {
        String uri = String.format("%s/%s/instances/%s/release", kgCoreEndpoint, apiVersion, id);
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

    public Map getReleaseStatus(List<String> ids, String releaseTreeScope, String token, String clientToken) {
        String uri = String.format("%s/%s/instancesByIds/release/status?releaseTreeScope=%s", kgCoreEndpoint, apiVersion, releaseTreeScope);
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

}
