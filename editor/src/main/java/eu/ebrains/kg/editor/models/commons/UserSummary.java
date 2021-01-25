package eu.ebrains.kg.editor.models.commons;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserSummary {

    protected String id;
    protected String username;
    protected String name;
    //This is actually a data url...
    protected String picture;

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

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public static class FromKG extends UserSummary{

        @JsonProperty("@id")
        public void atId(String id){
            this.id = id;
        }

    }
}
