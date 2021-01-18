package eu.ebrains.kg.editor.models.Instance;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.models.User;

import java.util.List;

public class Alternative {

    @JsonProperty(EditorConstants.VOCAB_SELECTED)
    private boolean selected;

    @JsonProperty(EditorConstants.VOCAB_USER)
    private List<User> users;

}
