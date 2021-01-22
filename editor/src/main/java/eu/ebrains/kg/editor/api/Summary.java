package eu.ebrains.kg.editor.api;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/summary")
@RestController
// TODO check if this could be moved to another place
public class Summary {


    @GetMapping
    //FIXME The pagination parameters differ from the one in instances -> they should be homogenized.
    //TODO check if it would make sense to introduce a default pagination
    public void searchInstancesSummary(@RequestParam("workspace") String workspace, @RequestParam("type") String type, @RequestParam(required = false, value = "from") Integer from, @RequestParam(required = false, value = "size") Integer size, @RequestParam(value = "searchByLabel", required = false) String searchByLabel) {

    }


}
