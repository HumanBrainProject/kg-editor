package eu.ebrains.kg.editor.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
public class AuthClient {
    private final WebClient webClient = WebClient.builder().build();

    @Value("${kgcore.endpoint}")
    String kgCoreEndpoint;

    @Value("${kgcore.apiVersion}")
    String apiVersion;

    @Value("${client.secret}")
    String clientSecret;

    public Map getEndpoint() {
        String uri = String.format("%s/%s/users/authorization", kgCoreEndpoint, apiVersion);
        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private Map getClientTokenEndpoint() {
        String uri = String.format("%s/%s/users/authorization/tokenEndpoint", kgCoreEndpoint, apiVersion);
        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private Map getClientToken(String endpoint) {
        Map<String, String> payload = Map.of("grant_type", "client_credentials",
                "client_id", "kg-editor",
                "client_secret", clientSecret);
        return webClient.post()
                .uri(endpoint)
                .headers(h -> {
                    h.add(HttpHeaders.CACHE_CONTROL, "no-cache");
                    h.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE);
                })
                .body(BodyInserters.fromValue(payload))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}
