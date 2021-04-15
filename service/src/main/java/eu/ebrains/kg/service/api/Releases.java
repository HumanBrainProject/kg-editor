package eu.ebrains.kg.service.api;

import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.services.ReleaseClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/releases")
@RestController
public class Releases {

    private final ReleaseClient releaseClient;

    public Releases(ReleaseClient releaseClient) {
        this.releaseClient = releaseClient;
    }

    @PutMapping("/{id}/release")
    public void putInstanceRelease(@PathVariable("id") String id) {
        releaseClient.putRelease(id);
    }

    @DeleteMapping("/{id}/release")
    public void deleteInstanceRelease(@PathVariable("id") String id) {
        releaseClient.deleteRelease(id);
    }

    @PostMapping("/status")
    public KGCoreResult<Map<String, KGCoreResult<String>>> getReleaseStatus(@RequestParam(value = "releaseTreeScope", required = false) String releaseTreeScope, @RequestBody List<String> ids) {
        Map<String, KGCoreResult<String>> releaseStatus = releaseClient.getReleaseStatus(ids, releaseTreeScope);
        return new KGCoreResult<Map<String, KGCoreResult<String>>>().setData(releaseStatus);
    }
}
