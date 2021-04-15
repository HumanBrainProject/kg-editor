package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.constants.SchemaFieldsConstants;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class SimpleTypeWithSpaces extends SimpleType{


    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public SimpleTypeWithSpaces(@JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgName,
                                @JsonProperty(SchemaFieldsConstants.NAME) String kgLabel,
                                @JsonProperty(EditorConstants.VOCAB_COLOR) String kgColor,
                                @JsonProperty(EditorConstants.VOCAB_SPACES) List<Map<String, String>> kgSpaces) {
        super(kgName);
        this.setLabel(kgLabel);
        this.setColor(kgColor);
        this.space = kgSpaces!=null ? kgSpaces.stream().map(s ->
                s.get(EditorConstants.VOCAB_SPACE)).filter(Objects::nonNull).collect(Collectors.toList()) : null;
    }

    private List<String> space;

    public List<String> getSpace() {
        return space;
    }

    public void setSpace(List<String> space) {
        this.space = space;
    }
}
