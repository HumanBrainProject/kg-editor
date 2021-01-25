package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.models.user.UserProfile;

import java.util.List;

public class Alternative {

    @JsonProperty(EditorConstants.VOCAB_SELECTED)
    private boolean selected;

    @JsonProperty(EditorConstants.VOCAB_USER)
    private List<UserProfile> users;

}
