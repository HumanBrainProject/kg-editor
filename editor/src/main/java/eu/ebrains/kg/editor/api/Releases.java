package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.services.ReleaseClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public KGCoreResult.Single getReleaseStatus(@RequestParam(value = "releaseTreeScope", required = false) String releaseTreeScope, @RequestBody List<String> ids) {
        return releaseClient.getReleaseStatus(ids, releaseTreeScope);
    }
}
