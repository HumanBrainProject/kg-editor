package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.models.space.StructureOfIncomingLink;

import java.util.List;
import java.util.Map;

public class InstanceFull extends InstanceSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceFull(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions,
            @JsonProperty(EditorConstants.VOCAB_ALTERNATIVE) Map<String, List<Alternative>> kgAlternatives,
            @JsonProperty(EditorConstants.VOCAB_INCOMING_LINKS) Map<String,  List<IncomingLink>> kgIncomingLinks
    ){
        super(kgId, kgType, kgSpace, kgPermissions);
        this.alternatives = kgAlternatives;
        this.incomingLinks = kgIncomingLinks;
    }


    private final Map<String, List<Alternative>> alternatives;
    private String labelField;
    private List<String> promotedFields;
    private Map<String, List<IncomingLink>> incomingLinks;
    private Map<String, StructureOfIncomingLink> possibleIncomingLinks;

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

    public Map<String, StructureOfIncomingLink> getPossibleIncomingLinks() { return possibleIncomingLinks; }

    public void setPossibleIncomingLinks(Map<String, StructureOfIncomingLink> possibleIncomingLinks) {
        this.possibleIncomingLinks = possibleIncomingLinks;
    }

    public Map<String, List<IncomingLink>> getIncomingLinks() {
        return incomingLinks;
    }

    public void setIncomingLinks(Map<String, List<IncomingLink>> incomingLinks) {
        this.incomingLinks = incomingLinks;
    }
}
