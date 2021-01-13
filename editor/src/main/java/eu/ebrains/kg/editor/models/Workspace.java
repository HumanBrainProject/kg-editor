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

}
