package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.models.instance.InstanceSummary;
import eu.ebrains.kg.editor.models.instance.SimpleType;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import eu.ebrains.kg.editor.services.InstanceClient;
import eu.ebrains.kg.editor.services.WorkspaceClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/summary")
@RestController
// TODO check if this could be moved to another place
public class Summary {

    private final InstanceClient instanceClient;
    private final WorkspaceClient workspaceClient;

    public Summary(InstanceClient instanceClient, WorkspaceClient workspaceClient) {
        this.instanceClient = instanceClient;
        this.workspaceClient = workspaceClient;
    }

    @GetMapping
    //FIXME The pagination parameters differ from the one in instances -> they should be homogenized.
    //TODO check if it would make sense to introduce a default pagination

    //TODO is the type optional? If not: Why do we need to lazily fetch the type information? Can't we just ask for the parametrized type?
    public List<InstanceSummary> searchInstancesSummary(@RequestParam("workspace") String workspace, @RequestParam("type") String type, @RequestParam(required = false, value = "from") Integer from, @RequestParam(required = false, value = "size") Integer size, @RequestParam(value = "searchByLabel", required = false) String searchByLabel) {
        List<InstanceSummary> result = instanceClient.searchInstances(workspace, type, from, size, searchByLabel);
        List<String> involvedTypes = result.stream().map(InstanceSummary::getTypes).flatMap(Collection::stream).map(SimpleType::getName).distinct().collect(Collectors.toList());
        Map<String, StructureOfType> typesByName = workspaceClient.getTypesByName(involvedTypes, true);
        result.forEach(r -> {
            r.getTypes().forEach(t -> {
                StructureOfType byName = typesByName.get(t.getName());
                if(byName!=null){
                    //Enrich the simple type information from the structure of type...
                    t.setLabel(byName.getLabel());
                    t.setColor(byName.getColor());

                    //Extract the fields which are either label fields or
                }
            });
        });
        return null;
    }


}
