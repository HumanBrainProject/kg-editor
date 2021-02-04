package eu.ebrains.kg.editor.models.workspace;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import org.springframework.util.CollectionUtils;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class StructureOfIncomingLink {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public StructureOfIncomingLink(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgFullyQualifiedName,
            @JsonProperty(EditorConstants.VOCAB_SOURCE_TYPES) List<SourceType> kgSourceTypes
    ) {
        this.fullyQualifiedName = kgFullyQualifiedName;
        this.sourceTypes = kgSourceTypes.stream().filter(st -> Objects.nonNull(st.getSpace())).collect(Collectors.toList());
    }

    private final String fullyQualifiedName;
    private final List<SourceType> sourceTypes;

    public String getFullyQualifiedName() {
        return fullyQualifiedName;
    }

    public List<SourceType> getSourceTypes() {
        return sourceTypes;
    }

    private static class SourceType {
        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        public SourceType( @JsonProperty(EditorConstants.VOCAB_TYPE) String kgType,
                           @JsonProperty(EditorConstants.VOCAB_SPACES) List<Map<String, String>> kgSpaces) {
            this.type = kgType;
            this.space = !CollectionUtils.isEmpty(kgSpaces) ? kgSpaces.get(0).get(EditorConstants.VOCAB_SPACE): null;
        }
        private final String type;
        private final String space;

        public String getType() {
            return type;
        }

        public String getSpace() {
            return space;
        }
    }
}
