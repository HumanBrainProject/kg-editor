package eu.ebrains.kg.editor.controllers;

import eu.ebrains.kg.editor.models.HasId;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.commons.UserSummary;
import eu.ebrains.kg.editor.models.instance.*;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import eu.ebrains.kg.editor.services.ReleaseClient;
import eu.ebrains.kg.editor.services.UserClient;
import eu.ebrains.kg.editor.services.WorkspaceClient;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class InstanceController {
    private final WorkspaceClient workspaceClient;
    private final ReleaseClient releaseClient;
    private final IdController idController;
    private final UserClient userClient;

    public InstanceController(WorkspaceClient workspaceClient, ReleaseClient releaseClient, IdController idController, UserClient userClient) {
        this.workspaceClient = workspaceClient;
        this.releaseClient = releaseClient;
        this.idController = idController;
        this.userClient = userClient;
    }

    public InstanceFull enrichInstance(ResultWithOriginalMap<InstanceFull> instanceWithMap) {
        InstanceFull instance = idController.simplifyId(instanceWithMap.getResult());
        Map<String, StructureOfType> typesByName = getTypesByName(instance);
        enrichTypesAndFields(instance, instanceWithMap.getOriginalMap(), typesByName);
        enrichAlternatives(instance);
        return instance;
    }

    public Map<String, InstanceFull> enrichInstances(Map<String, ResultWithOriginalMap<InstanceFull>> instancesWithMap) {
        Collection<ResultWithOriginalMap<InstanceFull>> instancesWithResult = getInstancesWithSimplifiedId(instancesWithMap);
        Map<String, StructureOfType> typesByName = getTypesByName(instancesWithResult);
        instancesWithResult.forEach(instanceWithResult -> {
            enrichTypesAndFields(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), typesByName);
            enrichAlternatives(instanceWithResult.getResult());
        });
        return instancesWithResult.stream().collect(Collectors.toMap(k -> k.getResult().getId(), ResultWithOriginalMap::getResult));
    }

    public Map<String, InstanceLabel> enrichInstancesLabel(Map<String, ResultWithOriginalMap<InstanceLabel>> instancesWithMap) {
        Collection<ResultWithOriginalMap<InstanceLabel>> instancesWithResult = getInstancesWithSimplifiedId(instancesWithMap);
        Map<String, StructureOfType> typesByName = getTypesByName(instancesWithResult);
        instancesWithResult.forEach(instanceWithResult -> enrichName(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), typesByName));
        return instancesWithResult.stream().collect(Collectors.toMap(k -> k.getResult().getId(), ResultWithOriginalMap::getResult));
    }


    public Map<String, InstanceSummary> enrichInstancesSummary(Map<String, ResultWithOriginalMap<InstanceSummary>> instancesWithMap) {
        Collection<ResultWithOriginalMap<InstanceSummary>> instancesWithResult = getInstancesWithSimplifiedId(instancesWithMap);
        Map<String, StructureOfType> typesByName = getTypesByName(instancesWithResult);
        instancesWithResult.forEach(instanceWithResult -> enrichTypesAndSearchableFields(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), typesByName));
        return instancesWithResult.stream().collect(Collectors.toMap(k -> k.getResult().getId(), ResultWithOriginalMap::getResult));
    }

    private <T extends HasId> Collection<ResultWithOriginalMap<T>> getInstancesWithSimplifiedId(Map<String, ResultWithOriginalMap<T>> instancesWithMap) {
        Collection<ResultWithOriginalMap<T>> instancesWithResult = instancesWithMap.values();
        instancesWithResult.forEach(i -> idController.simplifyId(i.getResult()));
        return instancesWithResult;
    }

    public void enrichSimpleType(SimpleType t, Map<String, StructureOfType> typesByName) {
        StructureOfType structureOfTypeKGCoreResult = typesByName.get(t.getName());
        if (structureOfTypeKGCoreResult != null) {
            t.setColor(structureOfTypeKGCoreResult.getColor());
            t.setLabel(structureOfTypeKGCoreResult.getLabel());
            t.setLabelField(structureOfTypeKGCoreResult.getLabelField());
        }
    }

    private void simplifyIdsOfLinks(StructureOfField field, Map<?, ?> originalMap) {
        Object fromMap = originalMap.get(field.getFullyQualifiedName());
        if (fromMap instanceof Collection) {
            field.setValue(((Collection<?>) fromMap).stream().map(idController::simplifyIdIfObjectIsAMap));
        } else if (field.getWidget() != null && field.getWidget().equals("Nested")) {
            if (fromMap != null) {
                Map<String, Object> value = new HashMap<>();
                Map<String, Object> originalValue = (Map<String, Object>) fromMap;
                field.getFields().forEach((k, v) -> {
                    Object fieldValue = originalValue.get(v.getFullyQualifiedName());
                    value.put(k, idController.simplifyIdIfObjectIsAMap(fieldValue));
                });
                field.setValue(value);
            }
        } else if (fromMap != null) {
            field.setValue(idController.simplifyIdIfObjectIsAMap(fromMap));
        }
    }

    /**
     * The editor UI expects a combined payload. This is why we recombine information of the instance with type information
     */
    private void enrichTypesAndFields(InstanceFull instance,
                                      Map<?, ?> originalMap,
                                      Map<String, StructureOfType> typesByName) {
        if (typesByName != null) {
            // Fill the type information
            instance.getTypes().forEach(t -> enrichSimpleType(t, typesByName));

            // Define the fields with the structure of the type and the values of the instance
            List<String> types = getTypesNamesFromInstance(instance);
            Map<String, StructureOfField> fields = getFieldsFromTypes(types, typesByName);

            enrichNestedTypesToInstanceRecursively(fields, typesByName);
            fields.values().forEach(f -> simplifyIdsOfLinks(f, originalMap));
            instance.setFields(fields);

            //Define special fields such as promoted and label
            instance.setPromotedFields(typesByName.values().stream()
                    .filter(Objects::nonNull)
                    .map(StructureOfType::getPromotedFields)
                    .flatMap(Collection::stream)
                    .distinct()
                    .collect(Collectors.toList()));

            instance.setLabelField(typesByName.values().stream()
                    .filter(Objects::nonNull)
                    .map(StructureOfType::getLabelField)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null));
        }
    }

    private List<String> getTypesNamesFromInstance(InstanceLabel instance) {
        return instance.getTypes().stream().map(t ->t.getName()).filter(Objects::nonNull).collect(Collectors.toList());
    }

    private Map<String, StructureOfField> getFieldsFromTypes(List<String> types, Map<String, StructureOfType> typesByName) {
        Map<String, StructureOfField> result = new HashMap<>();
        types.forEach(t -> {
            StructureOfType structureOfType = typesByName.get(t);
            if (t != null) {
                structureOfType.getFields().values().forEach(f -> {
                    if (!result.containsKey(f.getFullyQualifiedName())) {
                        result.put(f.getFullyQualifiedName(), SerializationUtils.clone(f));
                    }
                });
            }
        });
        return result;
    }

    private void enrichNestedTypesToInstanceRecursively(Map<String, StructureOfField> fields, Map<String, StructureOfType> typesByName) {
        fields.values().forEach(f -> {
            if (f.getWidget() != null && f.getWidget().equals("Nested")) {
                Map<String, StructureOfField> nestedFields = getFieldsFromTypes(f.getTargetTypes(), typesByName);
                f.setFields(nestedFields);
                enrichNestedTypesToInstanceRecursively(nestedFields, typesByName);
            }
        });
    }

    private void enrichTypesAndSearchableFields(InstanceSummary instance, Map<?, ?> originalMap, Map<String, StructureOfType> typesByName) {
        if (typesByName != null) {
            // Fill the type information
            instance.getTypes().forEach(t -> enrichSimpleType(t, typesByName));
            
            // Define the fields with the structure of the type and the values of the instance
            List<String> types = getTypesNamesFromInstance(instance);
            Map<String, StructureOfField> fields = getFieldsFromTypes(types, typesByName);


            String labelField = typesByName.values().stream()
                    .filter(Objects::nonNull)
                    .map(StructureOfType::getLabelField)
                    .findFirst()
                    .orElse(null);

            List<String> promotedFields = typesByName.values().stream()
                    .filter(Objects::nonNull)
                    .map(StructureOfType::getPromotedFields)
                    .flatMap(Collection::stream)
                    .distinct()
                    .collect(Collectors.toList());

            Map<String, StructureOfField> filteredFields = fields.entrySet().stream()
                    .filter(f -> promotedFields.contains(f.getValue().getFullyQualifiedName()) && !f.getValue().getFullyQualifiedName().equals(labelField))
                    .collect(Collectors.toMap(k->k.getKey(), v -> v.getValue()));
                    
            filteredFields.values().stream().forEach(f -> simplifyIdsOfLinks(f, originalMap));
            instance.setFields(filteredFields);

            if (labelField != null) {
                String name = (String) originalMap.get(labelField);
                instance.setName(name);
            }
        }
    }

    private void enrichName(InstanceLabel instance, Map<?, ?> originalMap, Map<String, StructureOfType> typesByName) {
        if (typesByName != null) {
            // Fill the type information
            instance.getTypes().forEach(t -> enrichSimpleType(t, typesByName));

            //Set the name from the label field
            String labelField = typesByName.values().stream()
                    .filter(Objects::nonNull).map(StructureOfType::getLabelField).findFirst().orElse(null);
            if (labelField != null) {
                String name = (String) originalMap.get(labelField);
                instance.setName(name);
            }
        }
    }

    private <T extends InstanceLabel> Map<String, StructureOfType> getTypesByName(Collection<ResultWithOriginalMap<T>> instancesWithResult) {
        List<InstanceLabel> instanceLabelList = instancesWithResult.stream().map(ResultWithOriginalMap::getResult).collect(Collectors.toList());
        return getTypesByName(instanceLabelList);
    }

    private Map<String, StructureOfType> getTypesByName(InstanceLabel instance) {
        List<String> involvedTypes = instance.getTypes().stream().map(SimpleType::getName).collect(Collectors.toList());
        Map<String, KGCoreResult<StructureOfType>> typesResultByName = workspaceClient.getTypesByName(involvedTypes, true);
        Map<String, StructureOfType> typesByName = getTypesByName(typesResultByName);
        retrieveNestedTypes(typesByName);
        return typesByName;
    }

    private Map<String, StructureOfType> getTypesByName(List<InstanceLabel> instances) {
        Stream<SimpleType> simpleTypeStream = instances.stream()
                .map(InstanceLabel::getTypes)
                .flatMap(Collection::stream);
        List<String> involvedTypes = simpleTypeStream
                .map(SimpleType::getName)
                .collect(Collectors.toList())
                .stream()
                .distinct()
                .collect(Collectors.toList());
        Map<String, KGCoreResult<StructureOfType>> typesResultByName = workspaceClient.getTypesByName(involvedTypes, true);
        Map<String, StructureOfType> typesByName = getTypesByName(typesResultByName);
        retrieveNestedTypes(typesByName);
        return typesByName;
    }

    private void retrieveNestedTypes(Map<String, StructureOfType> typesByName) {
        List<String> nestedTypes = new ArrayList<>();
        typesByName.values()
                .forEach(v -> v.getFields().values().stream()
                        .filter(fv -> Objects.nonNull(fv) && fv.getWidget() != null && fv.getWidget().equals("Nested"))
                        .forEach(t -> t.getTargetTypes().forEach(tg -> {
                            if (!nestedTypes.contains(tg) && !typesByName.containsKey(tg)) {
                                nestedTypes.add(tg);
                            }
                        })));
        if (!CollectionUtils.isEmpty(nestedTypes)) {
            Map<String, KGCoreResult<StructureOfType>> nestedTypesResultByName = workspaceClient.getTypesByName(nestedTypes, true);
            Map<String, StructureOfType> nestedTypesByName = getTypesByName(nestedTypesResultByName);
            typesByName.putAll(nestedTypesByName);
            retrieveNestedTypes(nestedTypesByName);
        }
    }

    /**
     * Normalize users of alternatives and add pictures
     */
    private void enrichAlternatives(InstanceFull instance) {
        Stream<UserSummary> allUsers = instance.getAlternatives().values().stream().flatMap(Collection::stream)
                .map(Alternative::getUsers).flatMap(Collection::stream);
        List<String> userIds = allUsers.map(u -> {
            UserSummary userSummary = idController.simplifyId(u);
            return userSummary.getId();
        }).filter(Objects::nonNull).distinct().collect(Collectors.toList());

        instance.getAlternatives().values().forEach(value -> value.forEach(v -> idController.simplifyIdIfObjectIsAMap(v.getValue())));

        /* TODO there's a lot of replication of big payloads here since we're keeping the picture in every sub element.
         *  Can't we just provide an additional map at the root level which is then looked up by the UI?
         */
        Map<String, String> userPictures = userClient.getUserPictures(userIds);
        instance.getAlternatives().values().stream().flatMap(Collection::stream)
                .map(Alternative::getUsers).flatMap(Collection::stream).forEach(u ->
                u.setPicture(userPictures.get(u.getId()))
        );
    }

    public void enrichNeighborRecursivelyWithTypeInformation(Neighbor neighbor) {
        Set<String> typesInNeighbor = findTypesInNeighbor(neighbor, new HashSet<>());
        Map<String, KGCoreResult<StructureOfType>> typesResultByName = workspaceClient.getTypesByName(new ArrayList<>(typesInNeighbor), true);
        Map<String, StructureOfType> typesByName = getTypesByName(typesResultByName);
        enrichTypesInNeighbor(neighbor, typesByName);
    }

    private void enrichTypesInNeighbor(Neighbor neighbor, Map<String, StructureOfType> types) {
        if (neighbor.getTypes() != null) {
            neighbor.getTypes().forEach(t -> enrichSimpleType(t, types));
        }
        if (neighbor.getInbound() != null) {
            neighbor.getInbound().forEach(i -> enrichTypesInNeighbor(i, types));
        }
        if (neighbor.getOutbound() != null) {
            neighbor.getOutbound().forEach(o -> enrichTypesInNeighbor(o, types));
        }
    }

    private static Set<String> findTypesInNeighbor(Neighbor neighbor, Set<String> acc) {
        if (neighbor.getTypes() != null) {
            acc.addAll(neighbor.getTypes().stream().map(SimpleType::getName).collect(Collectors.toSet()));
        }
        if (neighbor.getInbound() != null) {
            neighbor.getInbound().forEach(inboundNeighbor -> findTypesInNeighbor(inboundNeighbor, acc));
        }
        if (neighbor.getOutbound() != null) {
            neighbor.getOutbound().forEach(outboundNeighbor -> findTypesInNeighbor(outboundNeighbor, acc));
        }
        return acc;
    }


    public void enrichScopeRecursivelyWithTypeAndReleaseStatusInformation(Scope scope) {
        Set<String> types = new HashSet<>();
        Set<String> ids = new HashSet<>();
        findTypesAndIdsInScope(scope, types, ids);

        Map<String, KGCoreResult<StructureOfType>> typesResultByName = workspaceClient.getTypesByName(new ArrayList<>(types), true);
        Map<String, StructureOfType> typesByName = getTypesByName(typesResultByName);
        enrichTypesInScope(scope, typesByName);
        Map<String, KGCoreResult<String>> releaseStatus = releaseClient.getReleaseStatus(new ArrayList<>(ids), "TOP_INSTANCE_ONLY");
        enrichReleaseStatusInScope(scope, releaseStatus);
    }

    private Map<String, StructureOfType> getTypesByName(Map<String, KGCoreResult<StructureOfType>> typesResultByName) {
        return typesResultByName.values().stream()
                .map(KGCoreResult::getData)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(StructureOfType::getName, v -> v));
    }

    private static void findTypesAndIdsInScope(Scope scope, Set<String> types, Set<String> ids) {
        types.addAll(scope.getTypes().stream().map(SimpleType::getName).collect(Collectors.toSet()));
        ids.add(scope.getId());
        if (scope.getChildren() != null) {
            scope.getChildren().forEach(s -> findTypesAndIdsInScope(s, types, ids));
        }
    }

    private void enrichReleaseStatusInScope(Scope scope, Map<String, KGCoreResult<String>> releaseStatus) {
        KGCoreResult<String> status = releaseStatus.get(scope.getId());
        scope.setStatus(status != null ? status.getData() : null);
        if (scope.getChildren() != null) {
            scope.getChildren().forEach(s -> enrichReleaseStatusInScope(s, releaseStatus));
        }
    }

    private void enrichTypesInScope(Scope scope, Map<String, StructureOfType> types) {
        scope.getTypes().forEach(t -> enrichSimpleType(t, types));
        if (scope.getChildren() != null) {
            scope.getChildren().forEach(i -> enrichTypesInScope(i, types));
        }
    }

}
