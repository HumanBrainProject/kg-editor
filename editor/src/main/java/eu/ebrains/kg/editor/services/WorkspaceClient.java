package eu.ebrains.kg.editor.services;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class WorkspaceClient {
    private final WebClient webClient = WebClient.builder().build();

}
