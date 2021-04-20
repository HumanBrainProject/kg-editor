package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;

public class IncomingLink {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public IncomingLink(
            @JsonProperty("@id") String kgId,
            @JsonProperty(EditorConstants.LABEL) String kgLabel,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace

    ) {
        this.id =  kgId;
        this.label = kgLabel;
        this.space = kgSpace;
    }

    private String id;
    private final String label;
    private final String space;

    public String getId() { return id; }

    public void setId(String id) {
        this.id = id;
    }

    public String getLabel() { return label; }

    public String getSpace() { return space; }

}
