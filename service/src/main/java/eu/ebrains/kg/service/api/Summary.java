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

package eu.ebrains.kg.service.api;

import eu.ebrains.kg.service.controllers.IdController;
import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.ResultWithOriginalMap;
import eu.ebrains.kg.service.models.instance.InstanceSummary;
import eu.ebrains.kg.service.models.instance.SimpleType;
import eu.ebrains.kg.service.models.space.StructureOfField;
import eu.ebrains.kg.service.models.space.StructureOfType;
import eu.ebrains.kg.service.services.InstanceClient;
import eu.ebrains.kg.service.services.SpaceClient;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RequestMapping("/summary")
@RestController
// TODO check if this could be moved to another place
public class Summary {

    private final IdController idController;
    private final InstanceClient instanceClient;
    private final SpaceClient spaceClient;

    public Summary(IdController idController, InstanceClient instanceClient, SpaceClient spaceClient) {
        this.idController = idController;
        this.instanceClient = instanceClient;
        this.spaceClient = spaceClient;
    }

    @GetMapping
    //FIXME The pagination parameters differ from the one in instances -> they should be homogenized.
    //TODO check if it would make sense to introduce a default pagination
    public KGCoreResult<List<InstanceSummary>> searchInstancesSummary(@RequestParam("space") String space, @RequestParam("type") String type, @RequestParam(required = false, value = "from") Integer from, @RequestParam(required = false, value = "size") Integer size, @RequestParam(value = "searchByLabel", required = false) String searchByLabel) {
        KGCoreResult<List<ResultWithOriginalMap<InstanceSummary>>> result = instanceClient.searchInstanceSummaries(space, type, from, size, searchByLabel);

        // We're fetching the root type with properties to receive the information about the label field and the search fields.
        Map<String, KGCoreResult<StructureOfType>> typesByName = spaceClient.getTypesByName(Collections.singletonList(type), true);
        if(typesByName == null || typesByName.get(type) == null || typesByName.get(type).getData() == null){
            throw new IllegalArgumentException(String.format("Was not able to find the type definition for \"%s\"", type));
        }
        StructureOfType rootType = typesByName.get(type).getData();
        String rootLabelField =  rootType.getLabelField();
        Set<StructureOfField> searchableFields = rootType.getFields().values().stream().filter(f -> f.getSearchable()!=null && f.getSearchable() && !f.getFullyQualifiedName().equals(rootLabelField)).collect(Collectors.toSet());
        List<String> otherTypes = result.getData().stream().map(r -> r.getResult().getTypes()).flatMap(Collection::stream).map(SimpleType::getName).filter(t -> !t.equals(type)).distinct().collect(Collectors.toList());
        if(otherTypes.size()>0) {
            Map<String, KGCoreResult<StructureOfType>> otherTypesByName = spaceClient.getTypesByName(otherTypes, false);
            if(otherTypesByName!=null) {
                typesByName.putAll(otherTypesByName);
            }
        }
        List<InstanceSummary> instanceSummary = result.getData().stream().map(r -> {
            if (rootLabelField != null) {
                Object labelValue = r.getOriginalMap().get(rootLabelField);
                if (labelValue != null) {
                    r.getResult().setName(labelValue.toString());
                }
            }
            r.getResult().setFields(searchableFields.stream().map(f -> {
                //We're assigning the value of the instance to the StructureOfField -> we therefore need to clone it
                StructureOfField clone = SerializationUtils.clone(f);
                Object valueOfSearchField = r.getOriginalMap().get(f.getFullyQualifiedName());
                clone.setValue(valueOfSearchField);
                return clone;
            }).collect(Collectors.toMap(StructureOfField::getFullyQualifiedName, v->v)));

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
        return new KGCoreResult<List<InstanceSummary>>().setData(instanceSummary).setTotalResults(result.getTotal()).setSize(result.getSize()).setFrom(result.getFrom());
    }



}
