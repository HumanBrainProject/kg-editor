package eu.ebrains.kg.editor.services;

import eu.ebrains.kg.editor.models.KGCoreResult;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

@Component
public class AuthClient extends AbstractServiceClient {

    public AuthClient(HttpServletRequest request) {
        super(request);
    }

    public KGCoreResult.Single getEndpoint() {
        return get("users/authorization")
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
    }
}
