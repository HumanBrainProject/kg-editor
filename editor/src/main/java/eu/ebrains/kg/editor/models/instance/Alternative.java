package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.models.commons.UserSummary;

import java.util.List;

public class Alternative {

    protected Object value;
    protected Boolean selected;
    protected List<UserSummary.FromKG> users;


    public static class FromKG extends Alternative{

        @JsonProperty(EditorConstants.VOCAB_SELECTED)
        public void vocabSelected(Boolean selected){
            this.selected = selected;
        }

        @JsonProperty(EditorConstants.VOCAB_VALUE)
        public void vocabValue(Object value){
            this.value = value;
        }

        @JsonProperty(EditorConstants.VOCAB_USER)
        public void vocabUser(List<UserSummary.FromKG> users){
            this.users = users;
        }
    }

}
