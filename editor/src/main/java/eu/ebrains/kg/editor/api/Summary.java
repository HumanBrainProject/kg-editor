package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.IdController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/summary")
@RestController
// TODO check if this could be moved to another place
public class Summary {

    private final IdController idController;
    private final InstanceClient instanceClient;
    private final WorkspaceClient workspaceClient;

    public Summary(IdController idController, InstanceClient instanceClient, WorkspaceClient workspaceClient) {
        this.idController = idController;
        this.instanceClient = instanceClient;
        this.workspaceClient = workspaceClient;
    }

    @GetMapping
    //FIXME The pagination parameters differ from the one in instances -> they should be homogenized.
    //TODO check if it would make sense to introduce a default pagination
    public KGCoreResult<List<InstanceSummary>> searchInstancesSummary(@RequestParam("workspace") String workspace, @RequestParam("type") String type, @RequestParam(required = false, value = "from") Integer from, @RequestParam(required = false, value = "size") Integer size, @RequestParam(value = "searchByLabel", required = false) String searchByLabel) {
        List<ResultWithOriginalMap<InstanceSummary>> result = instanceClient.searchInstanceSummaries(workspace, type, from, size, searchByLabel);

        // We're fetching the root type with properties to receive the information about the label field only.
        //TODO this can be optimized if KG core provides a more lightweight method to fetch the label property or even resolves the label in the returned payload as a special property...
        Map<String, KGCoreResult<StructureOfType>> typesByName = workspaceClient.getTypesByName(Collections.singletonList(type), true);
        if(typesByName == null || typesByName.get(type) == null || typesByName.get(type).getData() == null){
            throw new IllegalArgumentException(String.format("Was not able to find the type definition for \"%s\"", type));
        }
        String rootLabelField =  typesByName.get(type).getData().getLabelField();
        List<String> otherTypes = result.stream().map(r -> r.getResult().getTypes()).flatMap(Collection::stream).map(SimpleType::getName).filter(t -> !t.equals(type)).distinct().collect(Collectors.toList());
        if(otherTypes.size()>0) {
            Map<String, KGCoreResult<StructureOfType>> otherTypesByName = workspaceClient.getTypesByName(otherTypes, false);
            if(otherTypesByName!=null) {
                typesByName.putAll(otherTypesByName);
            }
        }
        List<InstanceSummary> instanceSummary = result.stream().map(r -> {
            if (rootLabelField != null) {
                Object labelValue = r.getOriginalMap().get(rootLabelField);
                if (labelValue != null) {
                    r.getResult().setName(labelValue.toString());
                }
            }
            r.getResult().getTypes().forEach(t -> {
                KGCoreResult<StructureOfType> byName = typesByName.get(t.getName());
                if (byName != null && byName.getData() != null) {
                    //Enrich the simple type information from the structure of type...
                    t.setLabel(byName.getData().getLabel());
                    t.setColor(byName.getData().getColor());
                }
            });
            idController.simplifyId(r.getResult());
            return r.getResult();
        }).collect(Collectors.toList());
        return new KGCoreResult<List<InstanceSummary>>().setData(instanceSummary);
    }



}
