package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.models.commons.UserSummary;

import java.util.List;

public class Alternative {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Alternative(     @JsonProperty(EditorConstants.VOCAB_SELECTED) Boolean kgSelected,
                            @JsonProperty(EditorConstants.VOCAB_VALUE) Object kgValue,
                            @JsonProperty(EditorConstants.VOCAB_USER) List<UserSummary> kgUsers) {
        this.value = kgValue;
        this.selected = kgSelected;
        this.users = kgUsers;
    }

    private final Object value;
    private final Boolean selected;
    private final List<UserSummary> users;

    public Object getValue() {
        return value;
    }

    public Boolean getSelected() {
        return selected;
    }

    public List<UserSummary> getUsers() {
        return users;
    }
}
