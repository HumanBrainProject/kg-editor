package eu.ebrains.kg.editor.models.workspace;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class StructureOfField {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public StructureOfField(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgFullyQualifiedName,
            @JsonProperty(EditorConstants.VOCAB_OCCURRENCES) Integer kgNumOfOccurrences,
            @JsonProperty(EditorConstants.VOCAB_ORDER) Integer kgOrder,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(EditorConstants.VOCAB_WIDGET) String kgWidget,
            @JsonProperty(EditorConstants.VOCAB_LABEL_TOOLTIP) String kgLabelTooltip,
            @JsonProperty(EditorConstants.VOCAB_SEARCHABLE) Boolean kgSearchable
    ){
        this.fullyQualifiedName = kgFullyQualifiedName;
        this.numOfOccurrences = kgNumOfOccurrences;
        this.order = kgOrder;
        this.name = kgName;
        this.label = kgName != null ? StringUtils.capitalize(kgName) : null;
        this.widget = kgWidget;
        this.labelTooltip = kgLabelTooltip;
        this.searchable = kgSearchable;
    }

    private final String fullyQualifiedName;
    private final Integer numOfOccurrences;
    private final Integer order;
    private final String name;
    private final String label;
    private final String widget;
    private final String labelTooltip;
    private final Boolean searchable;
    private List<StructureOfField> fields;
    private Object value;

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public String getFullyQualifiedName() {
        return fullyQualifiedName;
    }

    public Integer getNumOfOccurrences() {
        return numOfOccurrences;
    }

    public Integer getOrder() {
        return order;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public String getWidget() {
        return widget;
    }

    public String getLabelTooltip() {
        return labelTooltip;
    }

    public Boolean getSearchable() {
        return searchable;
    }

    public List<StructureOfField> getFields() {
        return fields;
    }

    public void setFields(List<StructureOfField> fields) {
        this.fields = fields;
    }
}
