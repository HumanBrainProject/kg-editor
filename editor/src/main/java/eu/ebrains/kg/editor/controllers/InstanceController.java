package eu.ebrains.kg.editor.controllers;

import eu.ebrains.kg.editor.helpers.Helpers;
import eu.ebrains.kg.editor.models.HasId;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.commons.UserSummary;
import eu.ebrains.kg.editor.models.instance.*;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;
import eu.ebrains.kg.editor.models.workspace.StructureOfIncomingLink;
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
        if (instanceWithMap.getResult() != null) {
            InstanceFull instance = idController.simplifyId(instanceWithMap.getResult());
            Map<String, StructureOfType> typesByName = getTypesByName(instance);
            enrichTypesByNameWithIncomingLinksTypes(instance, typesByName);
            enrichInstanceWithPossibleIncomingLinks(instance, typesByName);
            enrichTypesAndFields(instance, instanceWithMap.getOriginalMap(), typesByName);
            enrichAlternatives(instance);
            return instance;
        }
        return null;
    }

    public Map<String, InstanceFull> enrichInstances(Map<String, ResultWithOriginalMap<InstanceFull>> instancesWithMap, String stage) {
        simplifyIdsOfInstances(instancesWithMap);
        Collection<ResultWithOriginalMap<InstanceFull>> instancesWithResult = instancesWithMap.values();
        Map<String, StructureOfType> typesByName = getTypesByName(instancesWithResult, true);
        enrichTypesByNameWithIncomingLinksTypes(instancesWithResult, typesByName);
        instancesWithResult.forEach(instanceWithResult -> {
            if (instanceWithResult.getResult() != null) {
                enrichInstanceWithPossibleIncomingLinks(instanceWithResult.getResult(), typesByName);
                enrichTypesAndFields(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), typesByName);
                if (stage.equals("IN_PROGRESS")) {
                    enrichAlternatives(instanceWithResult.getResult());
                }
            }
        });
        Map<String, InstanceFull> result = new HashMap<>();
        instancesWithMap.forEach((k, v) -> result.put(k, v.getResult()));
        return result;
    }

    private void enrichTypesByNameWithIncomingLinksTypes(InstanceFull instance, Map<String, StructureOfType> typesByName) {
        List<String> types = getTypesNamesFromInstance(instance);
        List<String> incomingLinksTypes = new ArrayList<>();
        retrieveIncomingLinksTypes(typesByName, incomingLinksTypes, types);
        List<String> filteredIncomingLinksTypes = !incomingLinksTypes.isEmpty() ? incomingLinksTypes.stream().distinct().collect(Collectors.toList()) : null;
        if (!CollectionUtils.isEmpty(filteredIncomingLinksTypes)) {
            typesByName.putAll(getTypesByNameResult(filteredIncomingLinksTypes, true));
        }
    }

    private void enrichTypesByNameWithIncomingLinksTypes(Collection<ResultWithOriginalMap<InstanceFull>> instancesWithResult, Map<String, StructureOfType> typesByName) {
        List<String> incomingLinksTypes = new ArrayList<>();
        instancesWithResult.forEach(instance -> {
            List<String> types = getTypesNamesFromInstance(instance.getResult());
            retrieveIncomingLinksTypes(typesByName, incomingLinksTypes, types);
        });
        List<String> filteredIncomingLinksTypes = !incomingLinksTypes.isEmpty() ? incomingLinksTypes.stream().distinct().collect(Collectors.toList()) : null;
        if (!CollectionUtils.isEmpty(filteredIncomingLinksTypes)) {
            typesByName.putAll(getTypesByNameResult(filteredIncomingLinksTypes, true));
        }
    }

    private void retrieveIncomingLinksTypes(Map<String, StructureOfType> typesByName, List<String> incomingLinksTypes, List<String> types) {
        types.forEach(type -> {
            StructureOfType structureOfType = typesByName.get(type);
            structureOfType
                    .getIncomingLinks()
                    .values()
                    .stream()
                    .filter(Objects::nonNull)
                    .forEach(v -> v.getSourceTypes()
                            .forEach(t -> {
                                if (!typesByName.containsKey(t.getType().getName())) {
                                    incomingLinksTypes.add(t.getType().getName());
                                }
                            }));
        });
    }

    private void enrichInstanceWithPossibleIncomingLinks(InstanceFull instance, Map<String, StructureOfType> typesByName) {
        List<String> types = getTypesNamesFromInstance(instance);
        Map<String, StructureOfIncomingLink> possibleIncomingLinks = new HashMap<>();
        types.forEach(type -> {
            StructureOfType structureOfType = typesByName.get(type);
            possibleIncomingLinks.putAll(structureOfType.getIncomingLinks());
        });
        enrichPossibleIncomingLinksTypes(typesByName, possibleIncomingLinks);
        instance.setPossibleIncomingLinks(possibleIncomingLinks);
    }

    private void enrichPossibleIncomingLinksTypes(Map<String, StructureOfType> typesByName, Map<String, StructureOfIncomingLink> possibleIncomingLinks) {
        possibleIncomingLinks.values().forEach(v -> v.getSourceTypes().forEach(s -> {
            s.getType().setColor(typesByName.get(s.getType().getName()).getColor());
            s.getType().setLabel(typesByName.get(s.getType().getName()).getLabel());
        }));
    }

    public Map<String, InstanceLabel> enrichInstancesLabel(Map<String, ResultWithOriginalMap<InstanceLabel>> instancesWithMap) {
        simplifyIdsOfInstances(instancesWithMap);
        Collection<ResultWithOriginalMap<InstanceLabel>> instancesWithResult = instancesWithMap.values();
        Map<String, StructureOfType> typesByName = getTypesByName(instancesWithResult, false);
        instancesWithResult.forEach(instanceWithResult -> {
            if (instanceWithResult.getResult() != null) {
                enrichName(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), typesByName);
            }
        });
        Map<String, InstanceLabel> result = new HashMap<>();
        instancesWithMap.forEach((k, v) -> result.put(k, v.getResult()));
        return result;
    }


    public Map<String, InstanceSummary> enrichInstancesSummary(Map<String, ResultWithOriginalMap<InstanceSummary>> instancesWithMap) {
        simplifyIdsOfInstances(instancesWithMap);
        Collection<ResultWithOriginalMap<InstanceSummary>> instancesWithResult = instancesWithMap.values();
        Map<String, StructureOfType> typesByName = getTypesByName(instancesWithResult, true);
        instancesWithResult.forEach(instanceWithResult -> {
            if (instanceWithResult.getResult() != null) {
                enrichTypesAndSearchableFields(instanceWithResult.getResult(), instanceWithResult.getOriginalMap(), typesByName);
            }
        });
        Map<String, InstanceSummary> result = new HashMap<>();
        instancesWithMap.forEach((k, v) -> result.put(k, v.getResult()));
        return result;
    }

    private <T extends HasId> void simplifyIdsOfInstances(Map<String, ResultWithOriginalMap<T>> instancesWithMap) {
        Collection<ResultWithOriginalMap<T>> instancesWithResult = instancesWithMap.values();
        instancesWithResult.forEach(i -> idController.simplifyId(i.getResult()));
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
        if (fromMap != null) {
            if (Helpers.isNestedField(field)) {
                Object value = getNestedFieldValue(fromMap, field.getFields());
                field.setValue(value);
            } else {
                Object value = getFieldValue(fromMap);
                field.setValue(value);
            }
        }
    }

    private Object simplifyIdsOfLinksInNested(Map<String, Object> originalValue, Map<String, StructureOfField> fields) {
        Map<String, Object> value = new HashMap<>();
        fields.forEach((k, v) -> {
            Object fieldOriginalValue = originalValue.get(v.getFullyQualifiedName());
            if (fieldOriginalValue != null) {
                if (Helpers.isNestedField(v)) {
                    Object fieldValue = getNestedFieldValue(fieldOriginalValue, v.getFields());
                    value.put(k, fieldValue);
                } else {
                    Object fieldValue = getFieldValue(fieldOriginalValue);
                    value.put(k, fieldValue);
                }
            }
        });
        List t = (List<String>) originalValue.get("@type");
        value.put("@type", t);
        return value;
    }

    private Object getNestedFieldValue(Object fromMap, Map<String, StructureOfField> fields) {
        if (fromMap instanceof Collection) {
            List<Object> value = ((Collection<?>) fromMap).stream()
                    .map(v -> simplifyIdsOfLinksInNested((Map<String, Object>) v, fields))
                    .collect(Collectors.toList());
            return value;
        } else {
            Object value = simplifyIdsOfLinksInNested((Map<String, Object>) fromMap, fields);
            return value;
        }
    }

    private Object getFieldValue(Object fieldOriginalValue) {
        if (fieldOriginalValue instanceof Collection) {
            return ((Collection<?>) fieldOriginalValue).stream().map(idController::simplifyIdIfObjectIsAMap);
        } else {
            return idController.simplifyIdIfObjectIsAMap(fieldOriginalValue);
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


            String labelField = instance.getTypes().stream()
                    .map(SimpleType::getLabelField)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);


            instance.setLabelField(labelField);

            if (instance.getIncomingLinks() != null) {
                instance.getIncomingLinks()
                        .values()
                        .stream().filter(Objects::nonNull)
                        .forEach(v -> v.stream().filter(Objects::nonNull)
                                .forEach(link -> {
                                            UUID uuid = idController.simplifyFullyQualifiedId(link.getId());
                                            if (uuid != null) {
                                                link.setId(uuid.toString());
                                            }
                                            if (link.getTypes() != null) {
                                                link.getTypes()
                                                        .forEach(t -> {
                                                            StructureOfType structureOfType = typesByName.get(t.getName());
                                                            if (structureOfType != null) {
                                                                t.setLabel(structureOfType.getLabel());
                                                                t.setColor(structureOfType.getColor());
                                                            }
                                                        });
                                            }
                                        }
                                )
                        );
            }

        }
    }

    private List<String> getTypesNamesFromInstance(InstanceLabel instance) {
        return instance.getTypes().stream().map(SimpleType::getName).filter(Objects::nonNull).collect(Collectors.toList());
    }

    private Map<String, StructureOfField> getFieldsFromTypes(List<String> types, Map<String, StructureOfType> typesByName) {
        Map<String, StructureOfField> result = new HashMap<>();
        types.forEach(t -> {
            if (t != null) {
                StructureOfType structureOfType = typesByName.get(t);
                if (structureOfType != null) {
                    structureOfType.getFields().values().forEach(f -> {
                        if (!result.containsKey(f.getFullyQualifiedName())) {
                            result.put(f.getFullyQualifiedName(), SerializationUtils.clone(f));
                        }
                    });
                }
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
                    .filter(Objects::nonNull)
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
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            filteredFields.values().forEach(f -> simplifyIdsOfLinks(f, originalMap));
            instance.setFields(filteredFields);

            if (labelField != null) {
                String name = (String) originalMap.get(labelField);
                instance.setName(name);
            }
        }
    }

    private void enrichName(InstanceLabel instance, Map<?, ?> originalMap, Map<String, StructureOfType> typesByName) {
        if (typesByName != null && instance != null) {
            // Fill the type information
            if (instance.getTypes() != null) {
                instance.getTypes().stream().filter(Objects::nonNull).forEach(t -> enrichSimpleType(t, typesByName));
                if (originalMap != null) {
                    String label = instance.getTypes().stream().map(SimpleType::getLabelField).filter(Objects::nonNull).map(originalMap::get).filter(Objects::nonNull).map(Object::toString).findFirst().orElse(null);
                    instance.setName(label);
                }
            }
        }
    }

    private <T extends InstanceLabel> Map<String, StructureOfType> getTypesByName(Collection<ResultWithOriginalMap<T>> instancesWithResult, boolean withProperties) {
        List<T> instanceLabelList = instancesWithResult.stream().map(ResultWithOriginalMap::getResult).filter(Objects::nonNull).collect(Collectors.toList());
        return getTypesByName(instanceLabelList, withProperties);
    }

    private Map<String, StructureOfType> getTypesByName(InstanceLabel instance) {
        List<String> involvedTypes = instance.getTypes().stream().map(SimpleType::getName).collect(Collectors.toList());
        Map<String, StructureOfType> typesByName = getTypesByNameResult(involvedTypes, true);
        retrieveTargetTypesFromNestedTypes(typesByName, typesByName);
        return typesByName;
    }

    private Map<String, StructureOfType> getTypesByName(List<? extends InstanceLabel> instances, boolean withProperties) {
        Stream<SimpleType> simpleTypeStream = instances.stream()
                .map(InstanceLabel::getTypes)
                .filter(Objects::nonNull)
                .flatMap(Collection::stream);
        List<String> involvedTypes = simpleTypeStream
                .map(SimpleType::getName)
                .filter(Objects::nonNull)
                .collect(Collectors.toList())
                .stream()
                .distinct()
                .collect(Collectors.toList());
        Map<String, StructureOfType> typesByName = getTypesByNameResult(involvedTypes, withProperties);
        retrieveTargetTypesFromNestedTypes(typesByName, typesByName);
        return typesByName;
    }

    private Map<String, StructureOfType> getTypesByNameResult(List<String> involvedTypes, boolean withProperties) {
        Map<String, KGCoreResult<StructureOfType>> typesResultByName = workspaceClient.getTypesByName(involvedTypes, withProperties);
        return Helpers.getTypesByName(typesResultByName);
    }

    private void retrieveTargetTypesFromNestedTypes(Map<String, StructureOfType> fullTypesByName, Map<String, StructureOfType> typesByName) {
        List<String> targetTypes = new ArrayList<>();
        typesByName.values()
                .forEach(v -> {
                    if (v.getFields() != null) {
                        v.getFields().values().stream()
                                .filter(f -> f != null && f.getTargetTypes() != null && f.getWidget() != null && f.getWidget().equals("Nested"))
                                .forEach(t -> t.getTargetTypes().forEach(tg -> {
                                    if (!targetTypes.contains(tg) && !fullTypesByName.containsKey(tg)) {
                                        targetTypes.add(tg);
                                    }
                                }));
                    }
                });
        if (!CollectionUtils.isEmpty(targetTypes)) {
            Map<String, StructureOfType> targetTypesByName = getTypesByNameResult(targetTypes, true);
            fullTypesByName.putAll(targetTypesByName);
            retrieveTargetTypesFromNestedTypes(fullTypesByName, targetTypesByName);
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
        Map<String, StructureOfType> typesByName = getTypesByNameResult(new ArrayList<>(typesInNeighbor), false);
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

        Map<String, StructureOfType> typesByName = getTypesByNameResult(new ArrayList<>(types), false);
        enrichTypesInScope(scope, typesByName);
        Map<String, KGCoreResult<String>> releaseStatus = releaseClient.getReleaseStatus(new ArrayList<>(ids), "TOP_INSTANCE_ONLY");
        enrichReleaseStatusInScope(scope, releaseStatus);
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
