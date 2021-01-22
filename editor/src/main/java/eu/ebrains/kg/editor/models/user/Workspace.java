package eu.ebrains.kg.editor.models.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

import java.util.List;

public class Workspace {

    protected String id;
    protected String name;
    protected Boolean autorelease;
    protected Boolean clientSpace;
    protected Boolean internalSpace;
    protected Permissions permissions;

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

    public static class FromKG extends Workspace {
        @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
        public void schemaIdentifier(String identifier) {
            this.id = identifier;
        }

        @JsonProperty(SchemaFieldsConstants.NAME)
        public void schemaName(String name) {
            this.name = name;
        }

        @JsonProperty(EditorConstants.VOCAB_AUTO_RELEASE)
        public void vocabAutoRelease(Boolean autoRelease) {
            this.autorelease = autoRelease;
        }

        @JsonProperty(EditorConstants.VOCAB_CLIENT_SPACE)
        public void vocabClientSpace(Boolean clientSpace) {
            this.clientSpace = clientSpace;
        }

        @JsonProperty(EditorConstants.VOCAB_INTERNAL_SPACE)
        public void vocabInternalSpace(Boolean internalSpace) {
            this.internalSpace = internalSpace;
        }

        @JsonProperty(EditorConstants.VOCAB_PERMISSIONS)
        public void vocabPermissions(List<String> permissions) {
            this.permissions = new Permissions();
            this.permissions.setCanCreate(permissions.contains("CREATE"));
            this.permissions.setCanInviteForReview(permissions.contains("INVITE_FOR_REVIEW"));
            this.permissions.setCanDelete(permissions.contains("DELETE"));
            this.permissions.setCanInviteForSuggestion(permissions.contains("INVITE_FOR_SUGGESTION"));
            this.permissions.setCanRead(permissions.contains("READ"));
            this.permissions.setCanSuggest(permissions.contains("SUGGEST"));
            this.permissions.setCanWrite(permissions.contains("WRITE"));
            this.permissions.setCanRelease(permissions.contains("RELEASE"));
        }
    }
}
