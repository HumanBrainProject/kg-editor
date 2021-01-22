package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.constants.CustomHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Component
public class ReleaseClient extends AbstractServiceClient{

    public ReleaseClient(HttpServletRequest request) {
        super(request);
    }

    public Map getRelease(String id) {
        String uri = String.format("%s/graph",  id);
        return get(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map putRelease(String id) {
        String uri = String.format("instances/%s/release",  id);
        return put(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public void deleteRelease(String id) {
        String uri = String.format("instances/%s/release", id);
        delete(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getReleaseStatus(List<String> ids, String releaseTreeScope) {
        String uri = String.format("instancesByIds/release/status?releaseTreeScope=%s", releaseTreeScope);
        return post(uri)
                .body(BodyInserters.fromValue(ids))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

}
