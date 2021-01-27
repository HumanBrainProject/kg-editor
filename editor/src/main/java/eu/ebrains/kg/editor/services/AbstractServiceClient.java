package eu.ebrains.kg.editor.services;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

import javax.servlet.http.HttpServletRequest;

public class AbstractServiceClient {

    protected final WebClient webClient = WebClient.builder().build();

    @Value("${kgcore.endpoint}")
    String kgCoreEndpoint;

    @Value("${kgcore.apiVersion}")
    String apiVersion;

    @Value("${client.secret}")
    String clientSecret;

    private final HttpServletRequest httpServletRequest;

    public AbstractServiceClient(HttpServletRequest request) {
        this.httpServletRequest = request;
    }

    private String combineEndpoint(String relativeUri){
        return String.format("%s/%s/%s", kgCoreEndpoint, apiVersion, relativeUri);
    }

    private <T extends WebClient.RequestHeadersSpec<T>> T addAuthorizationHeader(WebClient.RequestHeadersSpec<T> spec){
        return spec.header("Authorization", httpServletRequest.getHeader("Authorization")).header("Client-Id", "kg-editor").header("Client-Secret", clientSecret);
    }

    public WebClient.RequestHeadersSpec<?> get(String relativeUri){
        return addAuthorizationHeader(webClient.get()
                .uri(combineEndpoint(relativeUri)));
    }

    public WebClient.RequestBodySpec post(String relativeUri){
        return addAuthorizationHeader(webClient.post()
                .uri(combineEndpoint(relativeUri)));
    }


    public WebClient.RequestBodySpec put(String relativeUri){
        return addAuthorizationHeader(webClient.put()
                .uri(combineEndpoint(relativeUri)));

    }

    public WebClient.RequestBodySpec patch(String relativeUri){
        return addAuthorizationHeader(webClient.patch()
                .uri(combineEndpoint(relativeUri)));

    }

    public WebClient.RequestHeadersSpec<?> delete(String relativeUri){
        return addAuthorizationHeader(webClient.delete()
                .uri(combineEndpoint(relativeUri)));

    }

}
