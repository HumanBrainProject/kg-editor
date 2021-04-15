package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.models.Error;
import eu.ebrains.kg.service.models.HasError;
import eu.ebrains.kg.service.models.HasId;

import java.util.List;
import java.util.stream.Collectors;

public class InstanceLabel implements HasId, HasError {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceLabel(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace
    ) {
        this.id = kgId;
        this.types = handleTypes(kgType);
        this.space = kgSpace;
    }

    private List<SimpleType> handleTypes(List<String> types) {
        return types != null ? types.stream().map(SimpleType::new).collect(Collectors.toList()) : null;
    }

    private final String space;
    private final List<SimpleType> types;

    private String id;
    private String name;
    private Error error;

    @Override
    public void setError(Error error) { this.error=error; }

    @Override
    public Error getError() { return error; }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    @Override
    public String getId() {
        return id;
    }

    public String getSpace() {
        return space;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
