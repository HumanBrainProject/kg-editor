package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.models.KGCoreResult;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Component
public class ReleaseClient extends AbstractServiceClient{

    public ReleaseClient(HttpServletRequest request) {
        super(request);
    }

    public void putRelease(String id) {
        String uri = String.format("instances/%s/release",  id);
        put(uri)
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

    public KGCoreResult.Single getReleaseStatus(List<String> ids, String releaseTreeScope) {
        String uri = String.format("instancesByIds/release/status?releaseTreeScope=%s", releaseTreeScope);
        return post(uri)
                .body(BodyInserters.fromValue(ids))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
    }

}
