package eu.ebrains.kg.editor.models.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

import java.util.List;

public class UserProfile {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public UserProfile(
            @JsonProperty("@id") String kgId,
            @JsonProperty(SchemaFieldsConstants.ALTERNATENAME) String kgUserName,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(SchemaFieldsConstants.GIVEN_NAME) String kgGivenName,
            @JsonProperty(SchemaFieldsConstants.FAMILY_NAME) String kgFamilyName,
            @JsonProperty(SchemaFieldsConstants.EMAIL) String kgEmail){
        this.id = kgId;
        this.username = kgUserName;
        this.name = kgName;
        this.givenName = kgGivenName;
        this.familyName = kgFamilyName;
        this.email = kgEmail;
    }

    private String id;
    private final String username;
    private final String name;
    private final String givenName;
    private final String familyName;
    private final String email;
    private String picture;
    private Boolean isCurator;
    private List<Workspace> workspaces;

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getGivenName() {
        return givenName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public String getEmail() {
        return email;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public Boolean getCurator() {
        return isCurator;
    }

    public void setCurator(Boolean curator) {
        isCurator = curator;
    }

    public List<Workspace> getWorkspaces() {
        return workspaces;
    }

    public void setWorkspaces(List<Workspace> workspaces) {
        this.workspaces = workspaces;
    }
}
