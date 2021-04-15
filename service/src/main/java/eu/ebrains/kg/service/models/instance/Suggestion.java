package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Suggestion {
    private final String id;
    private final String name;
    private SimpleTypeWithSpaces type;
    private final String space;

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Suggestion(@JsonProperty("id") String kgId, @JsonProperty("label") String kgName, @JsonProperty("type") String kgType, @JsonProperty("space") String kgSpace) {
        this.id = kgId;
        this.name = kgName;
        this.type = kgType != null ? new SimpleTypeWithSpaces(kgType, null, null, null) : null;
        this.space = kgSpace;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public SimpleTypeWithSpaces getType() {
        return type;
    }

    public void setType(SimpleTypeWithSpaces type) {
        this.type = type;
    }

    public String getSpace() {
        return space;
    }
}
