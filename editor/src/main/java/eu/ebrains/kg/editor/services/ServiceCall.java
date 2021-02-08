package eu.ebrains.kg.editor.services;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class ServiceCall {

    private final WebClient webClient;

    final private String kgCoreEndpoint;

    final private String apiVersion;

    final private String clientSecret;

    public ServiceCall(WebClient webClient,  @Value("${kgcore.endpoint}") String kgCoreEndpoint, @Value("${kgcore.apiVersion}") String apiVersion, @Value("${client.secret}") String clientSecret) {
        this.webClient = webClient;
        this.kgCoreEndpoint = kgCoreEndpoint;
        this.apiVersion = apiVersion;
        this.clientSecret = clientSecret;
    }

    public String url(String relativeUri){
        return String.format("%s/%s/%s", kgCoreEndpoint, apiVersion, relativeUri);
    }

    public WebClient client() {
        return webClient;
    }
}
