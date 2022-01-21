package eu.ebrains.kg.service.models.type;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;

import java.io.Serializable;

public class ValidationRule implements Serializable {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public ValidationRule(
            @JsonProperty(EditorConstants.VOCAB_REGEX) String kgRegex,
            @JsonProperty(EditorConstants.VOCAB_ERROR_MESSAGE) String kgErrorMessage
    ) {
        this.regex = kgRegex;
        this.errorMessage = kgErrorMessage;
    }

    private String regex;
    private String errorMessage;

    public String getRegex() {
        return regex;
    }

    public void setRegex(String regex) {
        this.regex = regex;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
