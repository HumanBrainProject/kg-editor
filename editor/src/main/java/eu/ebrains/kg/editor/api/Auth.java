package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.services.AuthClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/endpoint")
@RestController
public class Auth {

    private final AuthClient authClient;

    public Auth(AuthClient authClient) {
        this.authClient = authClient;
    }

    @GetMapping
    public Map getAuthEndpoint() {
        return authClient.getEndpoint();
    }
}
