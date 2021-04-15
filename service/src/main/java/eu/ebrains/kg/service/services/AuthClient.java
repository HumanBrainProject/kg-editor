package eu.ebrains.kg.service.services;

import eu.ebrains.kg.service.models.KGCoreResult;
import org.springframework.stereotype.Component;

@Component
public class AuthClient {

    private final ServiceCall kg;

    public AuthClient(ServiceCall kg) {
        this.kg = kg;
    }

    public KGCoreResult.Single getEndpoint() {
        return kg.client().get().uri(kg.url("users/authorization"))
                .retrieve()
                .bodyToMono(KGCoreResult.Single.class)
                .block();
    }
}
