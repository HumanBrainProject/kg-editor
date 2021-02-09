package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

import java.util.List;

public class IncomingLink {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public IncomingLink(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgIdentifier,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty("@id") String kgId,
            @JsonProperty(EditorConstants.LABEL) String kgLabel,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace,
            @JsonProperty(EditorConstants.VOCAB_TYPES) List<Type> kgTypes

    ) {
        this.identifier = kgIdentifier;
        this.label = kgName;
        this.id = kgId;
        this.instanceLabel = kgLabel;
        this.space = kgSpace;
        this.types = kgTypes;

    }

    private final String identifier;
    private final String instanceLabel;
    private final String id;
    private final String label;
    private final String space;
    private final List<Type> types;

    public String getIdentifier() { return identifier; }

    public String getInstanceLabel() { return instanceLabel; }

    public String getId() { return id; }

    public String getLabel() { return label; }

    public String getSpace() { return space; }

    public List<Type> getTypes() { return types; }

    private static class  Type {
        private  String name;
        private  String labelProperty;

        public String getName() { return name; }

        public String getLabelProperty() { return labelProperty; }

        public void setName(String name) { this.name = name; }

        public void setLabelProperty(String labelProperty) { this.labelProperty = labelProperty; }
    }
}
