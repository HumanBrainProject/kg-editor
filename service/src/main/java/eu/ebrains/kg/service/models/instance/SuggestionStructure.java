package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.models.KGCoreResult;

import java.util.List;
import java.util.Map;

public class SuggestionStructure {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public SuggestionStructure(@JsonProperty("suggestions") KGCoreResult<List<Suggestion>> kgSuggestions, @JsonProperty("types") Map<String, SimpleTypeWithSpaces> kgTypes) {
        this.suggestions = kgSuggestions;
        this.types = kgTypes;
    }

    private KGCoreResult<List<Suggestion>>  suggestions;
    private final Map<String, SimpleTypeWithSpaces> types;

    public KGCoreResult<List<Suggestion>> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(KGCoreResult<List<Suggestion>> suggestions) {
        this.suggestions = suggestions;
    }

    public Map<String, SimpleTypeWithSpaces> getTypes() {
        return types;
    }
}
