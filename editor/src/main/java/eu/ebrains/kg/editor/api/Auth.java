package eu.ebrains.kg.editor.api;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.services.AuthClient;
import io.swagger.v3.oas.annotations.Operation;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class Auth {

    @Value("${eu.ebrains.kg.editor.sentry}")
    private String sentryUrl;

    private final AuthClient authClient;

    public Auth(AuthClient authClient) {
        this.authClient = authClient;
    }

    @Operation(summary = "Get the authorization endpoint, the user should authenticate against")
    @GetMapping("/endpoint")
    public KGCoreResult.Single getAuthEndpoint() {
        KGCoreResult.Single response = authClient.getEndpoint();
        if(StringUtils.isNotBlank(sentryUrl)) {
            response.getData().put("sentryUrl", sentryUrl);
        }
        return response;
    }
}
