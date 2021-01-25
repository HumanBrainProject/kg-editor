package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.controllers.IdController;
import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.ResultWithOriginalMap;
import eu.ebrains.kg.editor.models.instance.InstanceFull;
import eu.ebrains.kg.editor.services.InstanceClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequestMapping("/instances")
@RestController
public class Instances {


    private final InstanceClient instanceClient;
    private final IdController idController;

    public Instances(InstanceClient instanceClient, IdController idController) {
        this.instanceClient = instanceClient;
        this.idController = idController;
    }

    @GetMapping("/{id}")
    public KGCoreResult<InstanceFull> getInstance(@PathVariable("id") String id) {
        ResultWithOriginalMap<InstanceFull> instanceWithMap = instanceClient.getInstance(id);
        InstanceFull instance = simplifyId(instanceWithMap.getResult());
        //return instanceController.normalizeInstance(id, instance);
        return new KGCoreResult<InstanceFull>().setData(instance);
    }

    private InstanceFull simplifyId(InstanceFull instance){
        //Simplify the ID because we want to operate with the UUID on the UI only
        if(instance!=null && instance.getId()!=null) {
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
        Map<?,?> normalizedPayload = idController.fullyQualifyAtId(payload);
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
