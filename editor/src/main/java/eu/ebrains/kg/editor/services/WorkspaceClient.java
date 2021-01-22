package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.user.Workspace;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
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

    private static class WorkspacesResultFromKG extends KGCoreResult<List<Workspace.FromKG>>{}

    public List<Workspace> getWorkspaces() {
        String uri = "spaces?stage=IN_PROGRESS&permissions=true";
        KGCoreResult<List<Workspace.FromKG>> block = get(uri)
                .retrieve()
                .bodyToMono(WorkspacesResultFromKG.class)
                .block();
        return castResultList(block);
    }

    private static class StructureTypeResultFromKG extends KGCoreResult<List<StructureOfType.FromKG>>{}

    public List<StructureOfType> getWorkspaceTypes(String workspace) {
        String uri = String.format("types?stage=IN_PROGRESS&space=%s&withProperties=true", workspace);
        return castResultList(get(uri)
                .retrieve()
                .bodyToMono(StructureTypeResultFromKG.class)
                .block());
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
