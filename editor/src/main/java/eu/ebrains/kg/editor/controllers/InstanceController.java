package eu.ebrains.kg.editor.controllers;

import eu.ebrains.kg.editor.models.KGCoreResult;
import eu.ebrains.kg.editor.models.workspace.StructureOfType;
import eu.ebrains.kg.editor.services.WorkspaceClient;
import org.springframework.http.HttpStatus;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Map;

public class InstanceController {
    private final WorkspaceClient workspaceClient;

    public InstanceController(WorkspaceClient workspaceClient) {
        this.workspaceClient = workspaceClient;
    }

    public KGCoreResult.Single normalizeInstance(String id, KGCoreResult.Single instance) {
        List<String> typesToRetrieve = (List<String>) instance.getData().get("@type");
        if(CollectionUtils.isEmpty(typesToRetrieve)) {
           throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while extracting the types! Please try again!");
        }
        Map<String, StructureOfType> typesByName = workspaceClient.getTypesByName(typesToRetrieve, true);
        if(CollectionUtils.isEmpty(typesByName)) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while processing the types! Please try again!");
        }
        return null;

    }
}
