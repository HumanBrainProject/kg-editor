package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.WorkspaceController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/workspaces")
@RestController
public class Workspace {

    private final WorkspaceController workspaceController;

    public Workspace(WorkspaceController workspaceController) {
        this.workspaceController = workspaceController;
    }

    @GetMapping("/{workspace}/types")
    public KGCoreResult<List<StructureOfType>> getWorkspaceTypes(@PathVariable("workspace") String workspace) {
        List<StructureOfType> workspaceTypes = workspaceController.getTypes(workspace);
        return new KGCoreResult<List<StructureOfType>>().setData(workspaceTypes);
    }

}
