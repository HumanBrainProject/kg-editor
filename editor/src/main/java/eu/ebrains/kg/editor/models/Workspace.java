package eu.ebrains.kg.editor.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import eu.ebrains.kg.editor.models.deserializers.PermissionDeserializer;

public class Workspace {

    @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
    private String id;

    @JsonProperty(SchemaFieldsConstants.NAME)
    private String name;

    @JsonProperty(EditorConstants.VOCAB_AUTO_RELEASE)
    private Boolean autorelease;

    @JsonProperty(EditorConstants.VOCAB_CLIENT_SPACE)
    private Boolean clientSpace;

    @JsonProperty(EditorConstants.VOCAB_INTERNAL_SPACE)
    private Boolean internalSpace;

    @JsonProperty(EditorConstants.VOCAB_PERMISSIONS)
    @JsonDeserialize(using = PermissionDeserializer.class)
    private Permissions permissions;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getAutorelease() {
        return autorelease;
    }

    public void setAutorelease(Boolean autorelease) {
        this.autorelease = autorelease;
    }

    public Boolean getClientSpace() {
        return clientSpace;
    }

    public void setClientSpace(Boolean clientSpace) {
        this.clientSpace = clientSpace;
    }

    public Boolean getInternalSpace() {
        return internalSpace;
    }

    public void setInternalSpace(Boolean internalSpace) {
        this.internalSpace = internalSpace;
    }

    public Permissions getPermissions() {
        return permissions;
    }

    public void setPermissions(Permissions permissions) {
        this.permissions = permissions;
    }

}
