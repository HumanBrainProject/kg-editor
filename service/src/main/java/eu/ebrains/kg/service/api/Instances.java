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
import eu.ebrains.kg.service.controllers.InstanceController;
import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.ResultWithOriginalMap;
import eu.ebrains.kg.service.models.commons.UserSummary;
import eu.ebrains.kg.service.models.instance.*;
import eu.ebrains.kg.service.services.InstanceClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
// TODO Add proper error handling
public class Instances {

    private final InstanceClient instanceClient;
    private final InstanceController instanceController;
    private final IdController idController;

    public Instances(InstanceClient instanceClient, InstanceController instanceController, IdController idController) {
        this.instanceClient = instanceClient;
        this.instanceController = instanceController;
        this.idController = idController;
    }

    @GetMapping("/instances/{id}")
    public KGCoreResult<InstanceFull> getInstance(@PathVariable("id") String id) {
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.getInstance(id);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }


    @PostMapping("/instances/{id}")
    public KGCoreResult<InstanceFull> createInstance(@PathVariable("id") String id,
                                                     @RequestParam("space") String space,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.postInstance(id, space, normalizedPayload);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }


    @PostMapping("/instances")
    public KGCoreResult<InstanceFull> createInstanceWithoutId(@RequestParam("space") String space,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.postInstance(space, normalizedPayload);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }

    @PatchMapping("/instances/{id}")
    public KGCoreResult<InstanceFull> updateInstance(@PathVariable("id") String id,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.patchInstance(id, normalizedPayload);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }

    @DeleteMapping("/instances/{id}")
    public void deleteInstance(@PathVariable("id") String id) {
        instanceClient.deleteInstance(id);
    }

    @GetMapping("/instances/{id}/raw")
    public Map getRawInstance(@PathVariable("id") String id) {
        return instanceClient.getRawInstance(id);
    }

    @GetMapping("/instances/{id}/scope")
    public KGCoreResult<Scope> getInstanceScope(@PathVariable("id") String id) {
        Scope instanceScope = instanceClient.getInstanceScope(id);
        instanceController.enrichScopeRecursivelyWithTypeAndReleaseStatusInformation(instanceScope);
        return new KGCoreResult<Scope>().setData(instanceScope);
    }

    @GetMapping("/instances/{id}/incomingLinks")
    public KGCoreResult<List<IncomingLink>> getIncomingLinks(@PathVariable("id") String id,
                                                       @RequestParam("property") String property,
                                                       @RequestParam("type") String type,
                                                       @RequestParam("from") int from,
                                                       @RequestParam("size") int size) {
        return instanceClient.getIncomingLinks(id, property, type, from, size);
    }


    @PostMapping("/instancesBulk/list")
    public KGCoreResult<Map<String, InstanceFull>> getInstancesList(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                                                    @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                                                    @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceFull>> result = instanceClient.getInstances(ids, stage, metadata, true, true, true, true, InstanceFull.class);
        Map<String, InstanceFull> enrichedInstances = instanceController.enrichInstances(result, stage);
        return new KGCoreResult<Map<String, InstanceFull>>().setData(enrichedInstances);
    }

    @PostMapping("/instancesBulk/summary")
    public KGCoreResult<Map<String, InstanceSummary>> getInstancesSummary(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                    @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                    @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceSummary>> result = instanceClient.getInstances(ids, stage, metadata, false, true, false, false, InstanceSummary.class);
        Map<String, InstanceSummary> enrichedInstances = instanceController.enrichInstancesSummary(result);
        return new KGCoreResult<Map<String, InstanceSummary>>().setData(enrichedInstances);
    }

    @PostMapping("/instancesBulk/label")
    public KGCoreResult<Map<String, InstanceLabel>> getInstancesLabel(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                  @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                  @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceLabel>> result = instanceClient.getInstances(ids, stage, metadata, false, false, false, false, InstanceLabel.class);
        Map<String, InstanceLabel> enrichedInstances = instanceController.enrichInstancesLabel(result);
        return new KGCoreResult<Map<String, InstanceLabel>>().setData(enrichedInstances);
    }

    @PostMapping("/instances/{id}/suggestions")
    public KGCoreResult<SuggestionStructure> getSuggestions(@PathVariable("id") String id,
                                                            @RequestParam("field") String field,
                                                            @RequestParam(value = "sourceType", required = false) String sourceType,
                                                            @RequestParam(value = "targetType", required = false) String targetType,
                                                            @RequestParam(value = "start", required = false, defaultValue = "0") int start,
                                                            @RequestParam(value = "size", required = false, defaultValue = "50") int size,
                                                            @RequestParam(value = "search", required = false) String search,
                                                            @RequestBody Map<String, Object> payload) {
        KGCoreResult<SuggestionStructure> suggestionStructure = instanceClient.postSuggestions(id, field, sourceType, targetType, start, size, search, payload);
        if(suggestionStructure!= null && suggestionStructure.getData()!=null){
            suggestionStructure.getData().getSuggestions().getData().forEach(s -> {
                if(s!=null && s.getType()!=null){
                    SimpleTypeWithSpaces fullType = suggestionStructure.getData().getTypes().get(s.getType().getName());
                    if(fullType!=null){
                        s.setType(fullType);
                    }
                }
            });
        }
        return suggestionStructure;
    }

    @PutMapping("/instances/{id}/spaces/{space}")
    public void moveInstance(@PathVariable("id") String id,
                             @PathVariable("space") String space) {
        instanceClient.moveInstance(id, space);
    }

    @GetMapping("/instances/{id}/neighbors")
    public KGCoreResult<Neighbor> getInstanceNeighbors(@PathVariable("id") String id) {
        KGCoreResult<Neighbor> neighbor = instanceClient.getNeighbors(id);
        if(neighbor!=null && neighbor.getData()!=null) {
            instanceController.enrichNeighborRecursivelyWithTypeInformation(neighbor.getData());
        }
        return neighbor;
    }

    @GetMapping("/instances/{id}/invitedUsers")
    public KGCoreResult<List<UserSummary>> getInvitedUsers(@PathVariable("id") String id) {
        return instanceClient.getInvitedUsers(id);
    }

    @DeleteMapping("/instances/{id}/users/{userId}/invite")
    public KGCoreResult<List<UserSummary>> deleteUserinvitation(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        instanceClient.deleteInvitedUser(id, userId);
        return instanceClient.getInvitedUsers(id);
    }

    @PutMapping("/instances/{id}/users/{userId}/invite")
    public KGCoreResult<List<UserSummary>> putUserinvitation(@PathVariable("id") String id, @PathVariable("userId") String userId) {
        instanceClient.addInvitation(id, userId);
        return instanceClient.getInvitedUsers(id);
    }
}
