/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

package eu.ebrains.kg.service.controllers;

import eu.ebrains.kg.service.helpers.Helpers;
import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.type.StructureOfField;
import eu.ebrains.kg.service.models.type.StructureOfType;
import eu.ebrains.kg.service.models.user.Space;
import eu.ebrains.kg.service.services.SpaceClient;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class SpaceController {

    private final SpaceClient spaceClient;

    public SpaceController(SpaceClient spaceClient) {
        this.spaceClient = spaceClient;
    }

    private boolean hasSpace(String name) {
        try{
            Space space = spaceClient.getSpace(name);
            return space != null;
        } catch (WebClientResponseException.NotFound e){
            return false;
        }
        // Other exceptions are not handled here
    }

    // Exceptions are handled globally
    public void initialize(String name, List<String> types) {
        if (!hasSpace(name)) {
            spaceClient.setSpecification(name);
            if (!CollectionUtils.isEmpty(types)) {
                types.forEach(t -> spaceClient.setAssignType(name, t));
            }
        }
    }

    public List<StructureOfType> getTypes(String space) {
        List<StructureOfType> spaceTypes = spaceClient.getSpaceTypes(space);
        Map<String, StructureOfType> typesMap = spaceTypes.stream().collect(Collectors.toMap(StructureOfType::getName, v -> v));
        getNestedTypes(typesMap, spaceTypes);
        HashSet<String> spaceTypesName = new HashSet<>();
        spaceTypes.forEach(w -> spaceTypesName.add(w.getName()));
        typesMap.values().forEach(v -> {
            if (!spaceTypesName.contains(v.getName())) {
                if(v.getEmbeddedOnly() == null || !v.getEmbeddedOnly()) {
                    v.setEmbeddedOnly(true);
                }
                spaceTypes.add(v);
            }
        });
        getTargetTypes(typesMap, spaceTypes);
        getIncomingLinksTypes(spaceTypes, typesMap);
        spaceTypes.sort(Comparator.comparing(StructureOfType::getLabel));
        enrichSpaceTypes(spaceTypes, typesMap);
        return spaceTypes;
    }

    private void enrichSpaceTypes(List<StructureOfType> spaceTypes, Map<String, StructureOfType> typesMap) {
        spaceTypes.forEach(st -> Helpers.enrichFieldsTargetTypes(typesMap, st.getFields()));
    }

    private void getIncomingLinksTypes(List<StructureOfType> spaceTypes, Map<String, StructureOfType> typesMap) {
        List<String> typesFromIncomingLinks = new ArrayList<>();
        spaceTypes.stream().filter(wt -> Objects.nonNull(wt.getIncomingLinks())).toList()
                .forEach(v -> v.getIncomingLinks().values()
                        .forEach(i -> i.getSourceTypes().forEach(s -> {
                            if (!typesMap.containsKey(s.getType().getName())) {
                                typesFromIncomingLinks.add(s.getType().getName());
                            }
                        }))
                );
        if (!CollectionUtils.isEmpty(typesFromIncomingLinks)) {
            List<String> uniqueTypes = typesFromIncomingLinks.stream().distinct().toList();
            Map<String, KGCoreResult<StructureOfType>> incomingLinksTypesByNameResult = spaceClient.getTypesByName(uniqueTypes, false);
            Map<String, StructureOfType> incomingLinksTypes = Helpers.getTypesByName(incomingLinksTypesByNameResult);
            typesMap.putAll(incomingLinksTypes);
            spaceTypes.stream().filter(wt -> Objects.nonNull(wt.getIncomingLinks())).toList()
                    .forEach(v -> v.getIncomingLinks().values()
                            .forEach(i -> i.getSourceTypes().forEach(s -> {
                                StructureOfType structureOfType = typesMap.get(s.getType().getName());
                                s.getType().setLabel(structureOfType.getLabel());
                                s.getType().setColor(structureOfType.getColor());
                                s.getType().setLabelField(structureOfType.getLabelField());
                                s.getType().setDescription(structureOfType.getDescription());
                            }))
                    );
        }
    }

    private static String labelFromTypeName(String fullyQualifiedName) {
        if (fullyQualifiedName != null) {
            if (fullyQualifiedName.startsWith("@")) {
                return fullyQualifiedName.replace("@", "");
            }
            if (fullyQualifiedName.lastIndexOf("#") > -1) {
                return fullyQualifiedName.substring(fullyQualifiedName.lastIndexOf("#") + 1);
            }
            try {
                URI uri = new URI(fullyQualifiedName);
                return uri.getPath() != null ? uri.getPath().substring(uri.getPath().lastIndexOf('/') + 1) : null;
            } catch (URISyntaxException e) {
                return fullyQualifiedName;
            }
        }
        return null;
    }

    private void getTargetTypes(Map<String, StructureOfType> typesMap, List<StructureOfType> types) {
        List<String> typesToRetrieve = new ArrayList<>();
        types.forEach(type -> type.getFields().values().forEach(f -> {
            if (!CollectionUtils.isEmpty(f.getTargetTypesNames())) {
                f.getTargetTypesNames().forEach(targetType -> {
                    if (!typesMap.containsKey(targetType)) {
                        typesToRetrieve.add(targetType);
                    }
                });
            }
        }));
        Map<String, StructureOfType> targetTypesByName = new HashMap<>();
        List<String> uniqueTypes = typesToRetrieve.stream().distinct().toList();
        if (!CollectionUtils.isEmpty(uniqueTypes)) {
            Map<String, KGCoreResult<StructureOfType>> targetTypesByNameResult = spaceClient.getTypesByName(uniqueTypes, false);
            targetTypesByName.putAll(Helpers.getTypesByName(targetTypesByNameResult));
        }
        types.forEach(t -> t.getFields().values().forEach(f -> {
            if (!CollectionUtils.isEmpty(f.getTargetTypes())) {
                f.getTargetTypes().forEach(targetType -> {
                    StructureOfType structureOfType = typesMap.get(targetType.getName());
                    if (structureOfType == null) {
                        structureOfType = targetTypesByName.get(targetType.getName());
                    }
                    if(structureOfType!=null) {
                        targetType.setLabel(structureOfType.getLabel());
                        targetType.setColor(structureOfType.getColor());
                        targetType.setDescription(structureOfType.getDescription());
                    }
                    else{
                        //If the type doesn't exist, the best thing we can do is to extract the label from the type name
                        targetType.setLabel(labelFromTypeName(targetType.getName()));
                    }
                });
            }
        }));
    }

    private void getNestedTypes(Map<String, StructureOfType> typesMap, List<StructureOfType> types) {
        List<String> typesToRetrieve = new ArrayList<>();
        types.forEach(type -> type.getFields().values().forEach(f -> {
            if (Helpers.isNestedField(f) && !CollectionUtils.isEmpty(f.getTargetTypesNames())) {
                f.getTargetTypesNames().forEach(targetType -> {
                    if (!typesMap.containsKey(targetType)) {
                        typesToRetrieve.add(targetType);
                    }
                });
            }
        }));
        List<String> uniqueTypes = typesToRetrieve.stream().distinct().toList();
        if (!CollectionUtils.isEmpty(uniqueTypes)) {
            Map<String, KGCoreResult<StructureOfType>> nestedTypesByNameResult = spaceClient.getTypesByName(uniqueTypes, true);
            Map<String, StructureOfType> nestedTypesByName = Helpers.getTypesByName(nestedTypesByNameResult);
            typesMap.putAll(nestedTypesByName);
            List<StructureOfType> nestedTypes = new ArrayList<>(nestedTypesByName.values());
            getNestedTypes(typesMap, nestedTypes);
        }
        types.forEach(t -> t.getFields().values().forEach(f -> {
            if (Helpers.isNestedField(f) && !CollectionUtils.isEmpty(f.getTargetTypesNames())) {
                Map<String, StructureOfField> fields = new HashMap<>();
                f.getTargetTypesNames().forEach(targetType -> {
                    StructureOfType structureOfType = typesMap.get(targetType);
                    if(structureOfType != null) {
                        Map<String, StructureOfField> nestedFields = structureOfType.getFields().entrySet().stream()
                                .collect(Collectors.toMap(Map.Entry::getKey, v -> SerializationUtils.clone(v.getValue())));
                        fields.putAll(nestedFields);
                    }
                });
                f.setFields(fields);
            }
        }));
    }

}
