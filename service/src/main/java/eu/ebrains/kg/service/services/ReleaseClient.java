package eu.ebrains.kg.service.services;

import eu.ebrains.kg.service.models.KGCoreResult;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.Map;

@Component
public class ReleaseClient {

    private final ServiceCall kg;

    public ReleaseClient(ServiceCall kg) {
        this.kg = kg;
    }

    public void putRelease(String id) {
        String relativeUrl = String.format("instances/%s/release",  id);
        kg.client().put().uri(kg.url(relativeUrl))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
    }

    public void deleteRelease(String id) {
        String relativeUrl = String.format("instances/%s/release", id);
        kg.client().delete().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private static class ReleaseStatusFromKG extends KGCoreResult<Map<String, KGCoreResult<String>>>{}

    public Map<String, KGCoreResult<String>> getReleaseStatus(List<String> ids, String releaseTreeScope) {
        String relativeUrl = String.format("instancesByIds/release/status?releaseTreeScope=%s", releaseTreeScope);
        ReleaseStatusFromKG response = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(ids))
                .retrieve()
                .bodyToMono(ReleaseStatusFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

}
