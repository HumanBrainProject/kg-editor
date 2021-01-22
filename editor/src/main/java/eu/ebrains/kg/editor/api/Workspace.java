package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.StructureOfType;
import eu.ebrains.kg.editor.services.WorkspaceClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RequestMapping("/workspaces")
@RestController
public class Workspace {

    private final WorkspaceClient workspaceClient;

    public Workspace(WorkspaceClient workspaceClient) {
        this.workspaceClient = workspaceClient;
    }

    @GetMapping("/{workspace}/types")
    public KGCoreResult<?> getWorkspaceTypes(@PathVariable("workspace") String workspace) {
        KGCoreResult<List<StructureOfType.FromKG>> workspaceTypes = workspaceClient.getWorkspaceTypes(workspace);
        workspaceTypes.getData().sort(Comparator.comparing(StructureOfType::getLabel));
        return workspaceTypes;
    }

}
