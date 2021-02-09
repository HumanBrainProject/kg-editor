package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.user.Workspace;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.List;
import java.util.Map;

@Component
public class WorkspaceClient {

    private final ServiceCall kg;

    public WorkspaceClient(ServiceCall kg) {
        this.kg = kg;
    }

    private static class WorkspacesResultFromKG extends KGCoreResult<List<Workspace>> {
    }

    public List<Workspace> getWorkspaces() {
        String relativeUrl = "spaces?stage=IN_PROGRESS&permissions=true";
        KGCoreResult<List<Workspace>> response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(WorkspacesResultFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    private static class StructureTypeResultFromKG extends KGCoreResult<List<StructureOfType>> {
    }

    public List<StructureOfType> getWorkspaceTypes(String workspace) {
        String relativeUrl = String.format("types?stage=IN_PROGRESS&space=%s&withProperties=true&withIncomingLinks=true", workspace);
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
