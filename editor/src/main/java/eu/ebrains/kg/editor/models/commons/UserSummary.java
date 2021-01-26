package eu.ebrains.kg.editor.models.commons;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

public class UserSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public UserSummary(
            @JsonProperty("@id") String kgId,
            @JsonProperty(SchemaFieldsConstants.ALTERNATENAME) String kgUserName,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName
    ){
        this.id = kgId;
        this.username = kgUserName;
        this.name = kgName;
    }

    private String id;
    private final String username;
    private final String name;
    //This is actually a data url...
    private String picture;

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

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }
}
