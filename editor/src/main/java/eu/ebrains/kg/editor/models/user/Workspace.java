package eu.ebrains.kg.editor.models.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import eu.ebrains.kg.editor.models.commons.Permissions;

import java.util.List;

public class Workspace {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Workspace(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgId,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(EditorConstants.VOCAB_AUTO_RELEASE) Boolean kgAutoRelease,
            @JsonProperty(EditorConstants.VOCAB_CLIENT_SPACE) Boolean kgClientSpace,
            @JsonProperty(EditorConstants.VOCAB_INTERNAL_SPACE) Boolean kgInternalSpace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions
    ) {
        this.id = kgId;
        this.name = kgName;
        this.autorelease = kgAutoRelease;
        this.clientSpace = kgClientSpace;
        this.internalSpace = kgInternalSpace;
        this.permissions = Permissions.fromPermissionList(kgPermissions);
    }

    private final String id;
    private final String name;
    private final Boolean autorelease;
    private final Boolean clientSpace;
    private final Boolean internalSpace;
    private final Permissions permissions;

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Boolean getAutorelease() {
        return autorelease;
    }

    public Boolean getClientSpace() {
        return clientSpace;
    }

    public Boolean getInternalSpace() {
        return internalSpace;
    }

    public Permissions getPermissions() {
        return permissions;
    }
}
