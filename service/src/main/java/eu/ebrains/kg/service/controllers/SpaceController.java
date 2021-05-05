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
import eu.ebrains.kg.service.models.space.StructureOfField;
import eu.ebrains.kg.service.models.space.StructureOfType;
import eu.ebrains.kg.service.services.SpaceClient;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class SpaceController {

    private final SpaceClient spaceClient;

    public SpaceController(SpaceClient spaceClient) {
        this.spaceClient = spaceClient;
    }

    public List<StructureOfType> getTypes(String space) {
        List<StructureOfType> spaceTypes = spaceClient.getSpaceTypes(space);
        Map<String, StructureOfType> typesMap = spaceTypes.stream().collect(Collectors.toMap(StructureOfType::getName, v -> v));
        getNestedTypes(typesMap, spaceTypes);
        HashSet<String> spaceTypesName = new HashSet<>();
        spaceTypes.forEach(w -> spaceTypesName.add(w.getName()));
        typesMap.values().forEach(v -> {
            if (!spaceTypesName.contains(v.getName())) {
                if(!v.getEmbeddedOnly()) {
                    v.setEmbeddedOnly(true);
                }
                spaceTypes.add(v);
            }
        });
        getIncomingLinksTypes(spaceTypes, typesMap);
        spaceTypes.sort(Comparator.comparing(StructureOfType::getLabel));
        return spaceTypes;
    }

    private void getIncomingLinksTypes(List<StructureOfType> spaceTypes, Map<String, StructureOfType> typesMap) {
        List<String> typesFromIncomingLinks = new ArrayList<>();
        spaceTypes.stream().filter(wt -> Objects.nonNull(wt.getIncomingLinks()))
                .collect(Collectors.toList())
                .forEach(v -> v.getIncomingLinks().values()
                        .forEach(i -> i.getSourceTypes().forEach(s -> {
                            if (!typesMap.containsKey(s.getType().getName())) {
                                typesFromIncomingLinks.add(s.getType().getName());
                            }
                        }))
                );
        if (!CollectionUtils.isEmpty(typesFromIncomingLinks)) {
            List<String> uniqueTypes = typesFromIncomingLinks.stream().distinct().collect(Collectors.toList());
            Map<String, KGCoreResult<StructureOfType>> incomingLinksTypesByNameResult = spaceClient.getTypesByName(uniqueTypes, false);
            Map<String, StructureOfType> incomingLinksTypes = Helpers.getTypesByName(incomingLinksTypesByNameResult);
            typesMap.putAll(incomingLinksTypes);
            spaceTypes.stream().filter(wt -> Objects.nonNull(wt.getIncomingLinks()))
                    .collect(Collectors.toList())
                    .forEach(v -> v.getIncomingLinks().values()
                            .forEach(i -> i.getSourceTypes().forEach(s -> {
                                StructureOfType structureOfType = typesMap.get(s.getType().getName());
                                s.getType().setLabel(structureOfType.getLabel());
                                s.getType().setColor(structureOfType.getColor());
                                s.getType().setLabelField(structureOfType.getLabelField());
                            }))
                    );
        }
    }

    private void getNestedTypes(Map<String, StructureOfType> typesMap, List<StructureOfType> types) {
        List<String> typesToRetrieve = new ArrayList<>();
        types.forEach(type -> type.getFields().values().forEach(f -> {
            if (Helpers.isNestedField(f) && !CollectionUtils.isEmpty(f.getTargetTypes())) {
                f.getTargetTypes().forEach(targetType -> {
                    if (!typesMap.containsKey(targetType)) {
                        typesToRetrieve.add(targetType);
                    }
                });
            }
        }));
        List<String> uniqueTypes = typesToRetrieve.stream().distinct().collect(Collectors.toList());
        if (!CollectionUtils.isEmpty(uniqueTypes)) {
            Map<String, KGCoreResult<StructureOfType>> nestedTypesByNameResult = spaceClient.getTypesByName(uniqueTypes, true);
            Map<String, StructureOfType> nestedTypesByName = Helpers.getTypesByName(nestedTypesByNameResult);
            typesMap.putAll(nestedTypesByName);
            List<StructureOfType> nestedTypes = new ArrayList<>(nestedTypesByName.values());
            getNestedTypes(typesMap, nestedTypes);
        }
        types.forEach(t -> t.getFields().values().forEach(f -> {
            if (Helpers.isNestedField(f) && !CollectionUtils.isEmpty(f.getTargetTypes())) {
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
