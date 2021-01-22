package eu.ebrains.kg.editor.models.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import org.springframework.util.CollectionUtils;

import java.util.List;

public class UserProfile {
    protected String id;
    protected String username;
    protected String name;
    protected String givenName;
    protected String familyName;
    protected String email;
    protected String picture;
    protected Boolean isCurator;
    protected List<Workspace> workspaces;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGivenName() {
        return givenName;
    }

    public void setGivenName(String givenName) {
        this.givenName = givenName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public void setFamilyName(String familyName) {
        this.familyName = familyName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public Boolean isCurator() {
        return isCurator;
    }

    public void setCurator(Boolean curator) {
        isCurator = curator;
    }

    public List<Workspace> getWorkspaces() {
        return workspaces;
    }

    public void setWorkspaces(List<Workspace> workspaces) {
        this.workspaces =  workspaces;
    }

    
    public static class FromKG extends UserProfile {

        @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
        public void schemaIdentifier(List<String> identifiers){
            if(!CollectionUtils.isEmpty(identifiers)){
                this.id = identifiers.get(0);
            }
        }

        @JsonProperty(SchemaFieldsConstants.ALTERNATENAME)
        public void schemaAlternateName(String alternateName){
            this.username = alternateName;
        }

        @JsonProperty(SchemaFieldsConstants.NAME)
        public void schemaName(String name){
            this.name = name;
        }

        @JsonProperty(SchemaFieldsConstants.GIVEN_NAME)
        public void schemaGivenName(String givenName){
            this.givenName = givenName;
        }

        @JsonProperty(SchemaFieldsConstants.FAMILY_NAME)
        public void schemaFamilyName(String familyName){
            this.familyName = familyName;
        }

        @JsonProperty(SchemaFieldsConstants.EMAIL)
        public void schemaEmail(String email){
            this.email = email;
        }

    }
}
