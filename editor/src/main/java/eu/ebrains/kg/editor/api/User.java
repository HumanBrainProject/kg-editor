package eu.ebrains.kg.editor.api;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/user")
@RestController
public class User {


    @GetMapping
    public void getUserProfile() {
    }

    @PutMapping("/picture")
    public void saveUserPicture(@PathVariable("id") String id, @RequestBody Object payload) {
    }

}
