package eu.ebrains.kg.editor.api;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/instances")
@RestController
public class Instances {


    @PostMapping
    public void createInstanceWithoutId(@RequestParam("workspace") String workspace, @RequestBody Map<String, Object> payload) {
    }

    @GetMapping("/{id}")
    public void getInstance(@PathVariable("id") String id) {
    }

    @PostMapping("/{id}")
    public void createInstanceWithId(@PathVariable("id") String id, @RequestParam("workspace") String workspace, @RequestBody Map<String, Object> payload) {
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
