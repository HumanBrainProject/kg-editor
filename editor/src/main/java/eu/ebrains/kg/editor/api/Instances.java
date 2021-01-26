package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.IdController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.instance.Alternative;
import eu.ebrains.kg.editor.models.instance.InstanceFull;
import eu.ebrains.kg.editor.models.instance.SimpleType;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import eu.ebrains.kg.editor.services.InstanceClient;
import eu.ebrains.kg.editor.services.UserClient;
import eu.ebrains.kg.editor.services.WorkspaceClient;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RequestMapping("/instances")
@RestController
public class Instances {


    private final InstanceClient instanceClient;
    private final IdController idController;
    private final WorkspaceClient workspaceClient;
    private final UserClient userClient;

    public Instances(InstanceClient instanceClient, IdController idController, WorkspaceClient workspaceClient, UserClient userClient) {
        this.instanceClient = instanceClient;
        this.idController = idController;
        this.workspaceClient = workspaceClient;
        this.userClient = userClient;
    }

    private Object returnNormalizedIds(Object e) {
        if (e instanceof Map) {
            Map map = ((Map) e);
            Object atId = map.get("@id");
            if (atId != null) {
                UUID uuid = idController.simplifyFullyQualifiedId(atId.toString());
                if (uuid != null) {
                    //We only replace it when it's a proper UUID
                    map.put("@id", uuid.toString());
                }
            }
        }
        return e;
    }


    @GetMapping("/{id}")
    public KGCoreResult<InstanceFull> getInstance(@PathVariable("id") String id) {
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.getInstance(id);
        InstanceFull instance = simplifyId(instanceWithMap.getResult());
        Map<String, KGCoreResult<StructureOfType>> typesByName = workspaceClient.getTypesByName(instance.getTypes().stream().map(SimpleType::getName).collect(Collectors.toList()), true);
        if (typesByName != null) {

            // Fill the type information
            instance.getTypes().forEach(t -> {
                KGCoreResult<StructureOfType> structureOfTypeKGCoreResult = typesByName.get(t.getName());
                if (structureOfTypeKGCoreResult != null && structureOfTypeKGCoreResult.getData() != null) {
                    t.setColor(structureOfTypeKGCoreResult.getData().getColor());
                    t.setLabel(structureOfTypeKGCoreResult.getData().getLabel());
                }
            });

            // Update the fields with the values from the original instance
            List<StructureOfField> foundFields = typesByName.values().stream().map(KGCoreResult::getData).
                    filter(Objects::nonNull).map(t -> t.getFields().values()).
                    flatMap(Collection::stream).distinct().collect(Collectors.toList());
            foundFields.forEach(f -> {
                Object fromMap = instanceWithMap.getOriginalMap().get(f.getFullyQualifiedName());
                if (fromMap instanceof Collection) {
                    f.setValue(((Collection<?>) fromMap).stream().map(this::returnNormalizedIds));
                } else if (fromMap != null) {
                    f.setValue(returnNormalizedIds(fromMap));
                }
            });
            instance.setFields(foundFields);
            instance.setPromotedFields(typesByName.values().stream().map(KGCoreResult::getData)
                    .filter(Objects::nonNull).map(StructureOfType::getPromotedFields).
                            flatMap(Collection::stream).distinct().collect(Collectors.toList()));
            instance.setLabelField(typesByName.values().stream().map(KGCoreResult::getData)
                    .filter(Objects::nonNull).map(StructureOfType::getLabelField).findFirst().orElse(null));
        }

        //Normalize users of alternatives and add pictures
        List<String> userIds = instance.getAlternatives().values().stream().flatMap(Collection::stream)
                .map(Alternative::getUsers).flatMap(Collection::stream).map(u -> {
                    UUID uuid = idController.simplifyFullyQualifiedId(u.getId());
                    if (uuid != null) {
                        u.setId(uuid.toString());
                        return uuid.toString();
                    }
                    return null;
                }).filter(Objects::nonNull).distinct().collect(Collectors.toList());

        /* TODO there's a lot of replication of big payloads here since we're keeping the picture in every sub element.
         *  Can't we just provide an additional map at the root level which is then looked up by the UI?
         */
        Map<String, String> userPictures = userClient.getUserPictures(userIds);
        instance.getAlternatives().values().stream().flatMap(Collection::stream)
                .map(Alternative::getUsers).flatMap(Collection::stream).forEach(u ->
                u.setPicture(userPictures.get(u.getId()))
        );
        return new KGCoreResult<InstanceFull>().setData(instance);
    }

    private InstanceFull simplifyId(InstanceFull instance) {
        //Simplify the ID because we want to operate with the UUID on the UI only
        if (instance != null && instance.getId() != null) {
            UUID uuid = idController.simplifyFullyQualifiedId(instance.getId());
            if (uuid != null) {
                instance.setId(uuid.toString());
            }
            return instance;
        }
        return null;
    }

    @PostMapping("/{id}")
    public KGCoreResult<InstanceFull> createInstance(@PathVariable("id") String id, @RequestParam("workspace") String workspace, @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.postInstance(id, workspace, normalizedPayload);
        InstanceFull instance = simplifyId(instanceWithMap.getResult());

        //return instanceController.normalizeInstance(id, instance);
        return new KGCoreResult<InstanceFull>().setData(instance);
    }

    @PatchMapping("/{id}")
    public void updateInstance(@PathVariable("id") String id, @RequestBody Map<String, Object> payload) {
    }

    @DeleteMapping("/{id}")
    public void deleteInstance(@PathVariable("id") String id) {
    }

    @GetMapping("/{id}/scope")
    public void getInstanceScope(@PathVariable("id") String id) {
    }

    @PostMapping("/list")
    public void getInstancesList(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage, @RequestParam(required = false, defaultValue = "false") boolean metadata, @RequestBody List<String> ids) {
    }

    @PostMapping("/summary")
    public void getInstancesSummary(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage, @RequestParam(required = false, defaultValue = "false") boolean metadata, @RequestBody List<String> ids) {
    }

    @PostMapping("/label")
    public void getInstancesLabel(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage, @RequestParam(required = false, defaultValue = "false") boolean metadata, @RequestBody List<String> ids) {
    }

    @PostMapping("/{id}/suggestions")
    public void getSuggestions(@PathVariable("id") String id, @RequestParam("field") String field, @RequestParam(value = "type", required = false) String type, @RequestParam(value = "start", required = false, defaultValue = "0") int start, @RequestParam(value = "size", required = false, defaultValue = "50") int size, @RequestParam(value = "search", required = false) String search) {
    }

    @GetMapping("/{id}/neighbors")
    public void getInstanceNeighbors(@PathVariable("id") String id) {
    }


}
