package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.IdController;
import eu.ebrains.kg.editor.controllers.InstanceController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.instance.InstanceFull;
import eu.ebrains.kg.editor.models.instance.Neighbor;
import eu.ebrains.kg.editor.models.instance.SimpleTypeWithSpaces;
import eu.ebrains.kg.editor.models.instance.SuggestionStructure;
import eu.ebrains.kg.editor.services.InstanceClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/instances")
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

    @GetMapping("/{id}")
    public KGCoreResult<InstanceFull> getInstance(@PathVariable("id") String id) {
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.getInstance(id);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }


    @PostMapping("/{id}")
    public KGCoreResult<InstanceFull> createInstance(@PathVariable("id") String id,
                                                     @RequestParam("workspace") String workspace,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.postInstance(id, workspace, normalizedPayload);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }

    @PatchMapping("/{id}")
    public KGCoreResult<InstanceFull> updateInstance(@PathVariable("id") String id,
                                                     @RequestBody Map<String, Object> payload) {
        Map<?, ?> normalizedPayload = idController.fullyQualifyAtId(payload);
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.patchInstance(id, normalizedPayload);
        InstanceFull instanceFull = instanceController.enrichInstance(instanceWithMap);
        return new KGCoreResult<InstanceFull>().setData(instanceFull);
    }

    @DeleteMapping("/{id}")
    public void deleteInstance(@PathVariable("id") String id) {
        instanceClient.deleteInstance(id);
    }

    @GetMapping("/{id}/scope")
    public void getInstanceScope(@PathVariable("id") String id) {
    }


    @PostMapping("/list")
    public KGCoreResult<Map<String, InstanceFull>> getInstancesList(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                                                    @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                                                    @RequestBody List<String> ids) {
        Map<String, ResultWithOriginalMap<InstanceFull>> result = instanceClient.getInstances(ids, stage, metadata, true, true, true, InstanceFull.class);
        Map<String, InstanceFull> enrichedInstances = instanceController.enrichInstances(result);
        return new KGCoreResult<Map<String, InstanceFull>>().setData(enrichedInstances);
    }

    @PostMapping("/summary")
    public void getInstancesSummary(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                    @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                    @RequestBody List<String> ids) {
//        InstanceSummary instances = instanceClient.getInstances(ids, stage, metadata, false, true, false, InstancesSummaryFromKG.class);
//        instances.

    }

    @PostMapping("/label")
    public void getInstancesLabel(@RequestParam(value = "stage", defaultValue = "IN_PROGRESS", required = false) String stage,
                                  @RequestParam(required = false, defaultValue = "false") boolean metadata,
                                  @RequestBody List<String> ids) {
    }

    @PostMapping("/{id}/suggestions")
    public KGCoreResult<SuggestionStructure> getSuggestions(@PathVariable("id") String id,
                                                            @RequestParam("field") String field,
                                                            @RequestParam(value = "type", required = false) String type,
                                                            @RequestParam(value = "start", required = false, defaultValue = "0") int start,
                                                            @RequestParam(value = "size", required = false, defaultValue = "50") int size,
                                                            @RequestParam(value = "search", required = false) String search,
                                                            @RequestBody Map<String, Object> payload) {
        SuggestionStructure suggestionStructure = instanceClient.postSuggestions(id, field, type, start, size, search, payload);
        suggestionStructure.getSuggestions().getData().forEach(s -> {
            if(s!=null && s.getType()!=null){
                SimpleTypeWithSpaces fullType = suggestionStructure.getTypes().get(s.getType().getName());
                if(fullType!=null){
                    s.setType(fullType);
                }
            }
        });
        return new KGCoreResult<SuggestionStructure>().setData(suggestionStructure);
    }

    @GetMapping("/{id}/neighbors")
    public KGCoreResult<Neighbor> getInstanceNeighbors(@PathVariable("id") String id) {
        Neighbor neighbor = instanceClient.getNeighbors(id);
        instanceController.enrichNeighborRecursivelyWithTypeInformation(neighbor);
        return new KGCoreResult<Neighbor>().setData(neighbor);
    }





}
