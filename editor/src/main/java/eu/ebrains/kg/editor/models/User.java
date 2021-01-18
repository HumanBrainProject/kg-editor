package eu.ebrains.kg.editor.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import eu.ebrains.kg.editor.models.deserializers.ListOfStringToStringDeserializer;

import java.util.List;
import java.util.stream.Collectors;

public class User {
    @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
    @JsonDeserialize(using = ListOfStringToStringDeserializer.class)
    private String id;

    @JsonProperty(SchemaFieldsConstants.ALTERNATENAME)
    private String username;

    @JsonProperty(SchemaFieldsConstants.NAME)
    private String name;

    @JsonProperty(SchemaFieldsConstants.GIVEN_NAME)
    private String givenName;

    @JsonProperty(SchemaFieldsConstants.FAMILY_NAME)
    private String familyName;

    @JsonProperty(SchemaFieldsConstants.EMAIL)
    private String email;

    @JsonProperty(SchemaFieldsConstants.PICTURE)
    private String picture;

    @JsonProperty(SchemaFieldsConstants.CURATOR)
    private boolean isCurator;

    @JsonProperty(EditorConstants.VOCAB_WORKSPACES)
    private List<Workspace> workspaces;

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

    public boolean isCurator() {
        return isCurator;
    }

    public void setCurator(boolean curator) {
        isCurator = curator;
    }

    public List<Workspace> getWorkspaces() {
        return workspaces;
    }

    public void setWorkspaces(List<Workspace> workspaces) {
        this.workspaces = workspaces.stream().filter(w-> !w.getClientSpace() || !w.getInternalSpace()).collect(Collectors.toList());
    }

}
