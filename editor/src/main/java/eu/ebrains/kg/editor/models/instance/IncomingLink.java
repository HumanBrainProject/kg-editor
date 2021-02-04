package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

import java.util.List;

public class IncomingLink {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public IncomingLink(
            @JsonProperty(SchemaFieldsConstants.NAME) String kgLabel,
            @JsonProperty(EditorConstants.VOCAB_INSTANCE_LINKS) List<InstanceLink> kgInstanceLinks
    ) {
        this.label = kgLabel;
        this.instanceLinks = kgInstanceLinks;
    }

    private final String label;
    private final List<InstanceLink> instanceLinks;


    public String getLabel() {
        return label;
    }

    public List<InstanceLink> getInstanceLinks() {
        return instanceLinks;
    }

    private static class InstanceLink {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        public InstanceLink(@JsonProperty("@id") String kgId,
                            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace,
                            @JsonProperty(EditorConstants.VOCAB_TYPE) String kgType
        ) {
            this.id = kgId;
            this.space = kgSpace;
            this.type = kgType;
        }

        private String id;
        private String space;
        private String type;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getSpace() {
            return space;
        }

        public void setSpace(String space) {
            this.space = space;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }
}
