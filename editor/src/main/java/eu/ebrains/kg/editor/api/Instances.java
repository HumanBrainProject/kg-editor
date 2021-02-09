package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.IdController;
import eu.ebrains.kg.editor.controllers.InstanceController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.instance.*;
import eu.ebrains.kg.editor.services.InstanceClient;
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
                                                     @RequestParam("workspace") String workspace,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.postInstance(id, workspace, normalizedPayload);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }


    @PostMapping("/instances")
    public KGCoreResult<InstanceFull> createInstanceWithoutId(@RequestParam("workspace") String workspace,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.postInstance(workspace, normalizedPayload);
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

    @GetMapping("/instances/{id}/scope")
    public KGCoreResult<Scope> getInstanceScope(@PathVariable("id") String id) {
        Scope instanceScope = instanceClient.getInstanceScope(id);
        instanceController.enrichScopeRecursivelyWithTypeAndReleaseStatusInformation(instanceScope);
        return new KGCoreResult<Scope>().setData(instanceScope);
    }


    @PostMapping("/instancesBulk/list")
    public KGCoreResult<Map<String, InstanceFull>> getInstancesList(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                                                    @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                                                    @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceFull>> result = instanceClient.getInstances(ids, stage, metadata, true, true, true, InstanceFull.class);
        Map<String, InstanceFull> enrichedInstances = instanceController.enrichInstances(result, stage);
        return new KGCoreResult<Map<String, InstanceFull>>().setData(enrichedInstances);
    }

    @PostMapping("/instancesBulk/summary")
    public KGCoreResult<Map<String, InstanceSummary>> getInstancesSummary(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                    @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                    @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceSummary>> result = instanceClient.getInstances(ids, stage, metadata, false, true, false, InstanceSummary.class);
        Map<String, InstanceSummary> enrichedInstances = instanceController.enrichInstancesSummary(result);
        return new KGCoreResult<Map<String, InstanceSummary>>().setData(enrichedInstances);
    }

    @PostMapping("/instancesBulk/label")
    public KGCoreResult<Map<String, InstanceLabel>> getInstancesLabel(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                  @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                  @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceLabel>> result = instanceClient.getInstances(ids, stage, metadata, false, false, false, InstanceLabel.class);
        Map<String, InstanceLabel> enrichedInstances = instanceController.enrichInstancesLabel(result);
        return new KGCoreResult<Map<String, InstanceLabel>>().setData(enrichedInstances);
    }

    @PostMapping("/instances/{id}/suggestions")
    public KGCoreResult<SuggestionStructure> getSuggestions(@PathVariable("id") String id,
                                                            @RequestParam("field") String field,
                                                            @RequestParam(value = "type", required = false) String type,
                                                            @RequestParam(value = "start", required = false, defaultValue = "0") int start,
                                                            @RequestParam(value = "size", required = false, defaultValue = "50") int size,
                                                            @RequestParam(value = "search", required = false) String search,
                                                            @RequestBody Map<String, Object> payload) {
        KGCoreResult<SuggestionStructure> suggestionStructure = instanceClient.postSuggestions(id, field, type, start, size, search, payload);
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

    @GetMapping("/instances/{id}/neighbors")
    public KGCoreResult<Neighbor> getInstanceNeighbors(@PathVariable("id") String id) {
        KGCoreResult<Neighbor> neighbor = instanceClient.getNeighbors(id);
        if(neighbor!=null && neighbor.getData()!=null) {
            instanceController.enrichNeighborRecursivelyWithTypeInformation(neighbor.getData());
        }
        return neighbor;
    }





}
