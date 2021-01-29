package eu.ebrains.kg.editor.controllers;

import java.util.*;
import java.util.stream.Collectors;

import eu.ebrains.kg.editor.helpers.Helpers;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import eu.ebrains.kg.editor.services.WorkspaceClient;

@Component
public class WorkspaceController {
    
    private final WorkspaceClient workspaceClient;

    public WorkspaceController(WorkspaceClient workspaceClient) {
        this.workspaceClient = workspaceClient;
    }

    public List<StructureOfType> getTypes(String workspace) {
        List<StructureOfType> workspaceTypes = workspaceClient.getWorkspaceTypes(workspace);
        Map<String, StructureOfType> typesMap = workspaceTypes.stream().collect(Collectors.toMap(StructureOfType::getName, v -> v));
        getNestedTypes(typesMap, workspaceTypes);
        workspaceTypes.sort(Comparator.comparing(StructureOfType::getLabel));
        return workspaceTypes;
    }

    private void getNestedTypes(Map<String, StructureOfType> typesMap, List<StructureOfType> types) {
        List<String> typesToRetrieve = new ArrayList<>();
        types.forEach(type -> type.getFields().values().forEach(f -> {
            if(Helpers.isNestedField(f) && !CollectionUtils.isEmpty(f.getTargetTypes())) {
                f.getTargetTypes().forEach(targetType -> {
                    if(!typesMap.containsKey(targetType)) {
                        typesToRetrieve.add(targetType);
                    }
                });
            }
        }));
        List<String> uniqueTypes = typesToRetrieve.stream().distinct().collect(Collectors.toList());
        if(!CollectionUtils.isEmpty(uniqueTypes)) {
            Map<String, KGCoreResult<StructureOfType>> nestedTypesByNameResult = workspaceClient.getTypesByName(uniqueTypes, true);
            Map<String, StructureOfType> nestedTypesByName = Helpers.getTypesByName(nestedTypesByNameResult);
            typesMap.putAll(nestedTypesByName);
            List<StructureOfType> nestedTypes = new ArrayList<>(nestedTypesByName.values());
            getNestedTypes(typesMap, nestedTypes);
        }
        types.forEach(t -> t.getFields().values().forEach(f -> {
            if(Helpers.isNestedField(f) && !CollectionUtils.isEmpty(f.getTargetTypes())) {
                Map<String, StructureOfField> fields = new HashMap<>();
                f.getTargetTypes().forEach(targetType -> {
                    StructureOfType structureOfType = typesMap.get(targetType);
                    Map<String, StructureOfField> nestedFields = structureOfType.getFields().entrySet().stream()
                            .collect(Collectors.toMap(Map.Entry::getKey, v -> SerializationUtils.clone(v.getValue())));
                    fields.putAll(nestedFields);
                });
                f.setFields(fields);
            }
        }));
    } 
    
}
