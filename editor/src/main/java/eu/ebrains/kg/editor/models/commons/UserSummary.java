package eu.ebrains.kg.editor.models.commons;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UserSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public UserSummary(
            @JsonProperty("@id") String kgId
    ){
        this.id = kgId;
    }

    private final String id;
    private String username;
    private String name;
    //This is actually a data url...
    private String picture;

    public String getId() {
        return id;
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

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }
}
