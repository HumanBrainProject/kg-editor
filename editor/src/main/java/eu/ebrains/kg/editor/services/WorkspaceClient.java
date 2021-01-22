package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.api.Workspace;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.StructureOfType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Component
public class WorkspaceClient extends AbstractServiceClient{

    public WorkspaceClient(HttpServletRequest request) {
        super(request);
    }

    public Map getWorkspaces() {
        String uri = "spaces?stage=IN_PROGRESS&permissions=true";
        return get(uri)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public static class StructureTypeResultFromKG extends KGCoreResult<List<StructureOfType.FromKG>>{}


    public KGCoreResult<List<StructureOfType.FromKG>> getWorkspaceTypes(String workspace) {
        String uri = String.format("types?stage=IN_PROGRESS&space=%s&withProperties=true", workspace);
        return get(uri)
                .retrieve()
                .bodyToMono(StructureTypeResultFromKG.class)
                .block();
    }




    public Map getTypesByName(java.util.List types, boolean withProperties) {
        String uri = String.format("typesByName?stage=IN_PROGRESS&withProperties=%s", withProperties);
        return post(uri)
                .body(BodyInserters.fromValue(types))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

}
