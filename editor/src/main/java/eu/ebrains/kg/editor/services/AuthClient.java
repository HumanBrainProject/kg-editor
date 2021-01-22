package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.models.KGCoreResult;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Component
public class AuthClient extends AbstractServiceClient {

    public AuthClient(HttpServletRequest request) {
        super(request);
    }

    public KGCoreResult.Single getEndpoint() {
        return get("users/authorization")
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
    }

    private Map getClientTokenEndpoint() {
        return get("users/authorization/tokenEndpoint")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }


    private Map getClientToken(String endpoint) {
        Map<String, String> payload = Map.of("grant_type", "client_credentials",
                "client_id", "kg-editor",
                "client_secret", clientSecret);
// We're making direct use of the webclient because this is a special call not making use of standard authentication and using an absolute endpoint
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
