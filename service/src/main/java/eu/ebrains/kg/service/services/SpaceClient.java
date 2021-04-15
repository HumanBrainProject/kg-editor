package eu.ebrains.kg.service.services;

import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.user.Space;
import eu.ebrains.kg.service.models.space.StructureOfType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.Map;

@Component
public class SpaceClient {

    private final ServiceCall kg;

    public SpaceClient(ServiceCall kg) {
        this.kg = kg;
    }

    private static class SpacesResultFromKG extends KGCoreResult<List<Space>> {
    }

    public List<Space> getSpaces() {
        String relativeUrl = "spaces?stage=IN_PROGRESS&permissions=true";
        KGCoreResult<List<Space>> response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(SpacesResultFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    private static class StructureTypeResultFromKG extends KGCoreResult<List<StructureOfType>> {
    }

    public List<StructureOfType> getSpaceTypes(String space) {
        String relativeUrl = String.format("types?stage=IN_PROGRESS&space=%s&withProperties=true&withIncomingLinks=true", space);
        StructureTypeResultFromKG response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(StructureTypeResultFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }


    private static class StructureOfTypeByNameFromKG extends KGCoreResult<Map<String, KGCoreResult<StructureOfType>>> {
    }

    public Map<String, KGCoreResult<StructureOfType>> getTypesByName(List<String> types, boolean withProperties) {
        String relativeUrl = String.format("typesByName?stage=IN_PROGRESS&withProperties=%s", withProperties);
        StructureOfTypeByNameFromKG response = kg.client().post().uri(kg.url(relativeUrl))
                .body(BodyInserters.fromValue(types))
                .retrieve()
                .bodyToMono(StructureOfTypeByNameFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

}
