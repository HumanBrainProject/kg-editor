package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;

import java.util.List;
import java.util.Map;

public class InstanceFull extends InstanceSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceFull(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgWorkspace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions,
            @JsonProperty(EditorConstants.VOCAB_ALTERNATIVE) Map<String, List<Alternative>> kgAlternatives
    ){
        super(kgId, kgType, kgWorkspace, kgPermissions);
        this.alternatives = kgAlternatives;
    }

    private final Map<String, List<Alternative>> alternatives;
    private String labelField;
    private List<String> promotedFields;

    public Map<String, List<Alternative>> getAlternatives() {
        return alternatives;
    }

    public String getLabelField() {
        return labelField;
    }

    public void setLabelField(String labelField) {
        this.labelField = labelField;
    }

    public List<String> getPromotedFields() {
        return promotedFields;
    }

    public void setPromotedFields(List<String> promotedFields) {
        this.promotedFields = promotedFields;
    }
}
