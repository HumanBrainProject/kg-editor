package eu.ebrains.kg.service.models.space;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.constants.SchemaFieldsConstants;
import eu.ebrains.kg.service.models.instance.SimpleType;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StructureOfIncomingLink {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public StructureOfIncomingLink(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgFullyQualifiedName,
            @JsonProperty(EditorConstants.VOCAB_SOURCE_TYPES) List<SourceType> kgSourceTypes
    ) {
        this.fullyQualifiedName = kgFullyQualifiedName;
        this.sourceTypes = kgSourceTypes;
    }

    private final String fullyQualifiedName;
    private final List<SourceType> sourceTypes;

    public String getFullyQualifiedName() {
        return fullyQualifiedName;
    }

    public List<SourceType> getSourceTypes() {
        return sourceTypes;
    }

    public static class SourceType {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        public SourceType( @JsonProperty(EditorConstants.VOCAB_TYPE) String kgType,
                           @JsonProperty(EditorConstants.VOCAB_SPACES) List<Map<String, String>> kgSpaces) {
            this.type = new SimpleType(kgType);
            this.spaces = kgSpaces.stream().map(s -> s.get(EditorConstants.VOCAB_SPACE)).collect(Collectors.toList());
        }
        private SimpleType type;
        private final List<String> spaces;

        public SimpleType getType() {
            return type;
        }

        public void setType(SimpleType type) {
            this.type = type;
        }

        public List<String> getSpaces() {
            return spaces;
        }
    }
}
