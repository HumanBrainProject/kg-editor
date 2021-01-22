package eu.ebrains.kg.editor.api;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/releases")
@RestController
public class Releases {


    @GetMapping("/{id}/release")
    public void getInstanceRelease(@PathVariable("id") String id) {
    }

    @PutMapping("/{id}/release")
    public void putInstanceRelease(@PathVariable("id") String id) {
    }

    @DeleteMapping("/{id}/release")
    public void deleteInstanceRelease(@PathVariable("id") String id) {
    }

    @PostMapping("/status")
    public void getReleaseStatus(@RequestParam(value = "releaseTreeScope", required = false) String releaseTreeScope, @RequestBody List<String> ids) {
    }
}
