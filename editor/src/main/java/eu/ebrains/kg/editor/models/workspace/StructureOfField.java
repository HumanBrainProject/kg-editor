package eu.ebrains.kg.editor.models.workspace;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class StructureOfField implements Serializable {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public StructureOfField(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgFullyQualifiedName,
            @JsonProperty(EditorConstants.VOCAB_OCCURRENCES) Integer kgNumOfOccurrences,
            @JsonProperty(EditorConstants.VOCAB_ORDER) Integer kgOrder,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(EditorConstants.VOCAB_WIDGET) String kgWidget,
            @JsonProperty(EditorConstants.VOCAB_LABEL_TOOLTIP) String kgLabelTooltip,
            @JsonProperty(EditorConstants.VOCAB_SEARCHABLE) Boolean kgSearchable,
            @JsonProperty(EditorConstants.VOCAB_TARGET_TYPES) List<Map<String, Object>> kgTargetTypes
    ) {
        this.fullyQualifiedName = kgFullyQualifiedName;
        this.numOfOccurrences = kgNumOfOccurrences;
        this.order = kgOrder;
        this.name = kgName;
        this.label = kgName != null ? StringUtils.capitalize(kgName) : null;
        this.widget = kgWidget;
        this.labelTooltip = kgLabelTooltip;
        this.searchable = kgSearchable;
        this.targetTypes = !CollectionUtils.isEmpty(kgTargetTypes) ? kgTargetTypes.stream()
                .map(t -> (String) t.get(EditorConstants.VOCAB_TYPE)).filter(Objects::nonNull).collect(Collectors.toList()) : null;
    }

    private final String fullyQualifiedName;
    private final Integer numOfOccurrences;
    private final Integer order;
    private final String name;
    private final String label;
    private final String widget;
    private final String labelTooltip;
    private final Boolean searchable;
    private Map<String, StructureOfField> fields;
    private Object value;
    private List<String> targetTypes;

    public List<String> getTargetTypes() {
        return targetTypes;
    }

    public void setTargetTypes(List<String> targetTypes) {
        this.targetTypes = targetTypes;
    }


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

    public Map<String, StructureOfField> getFields() {
        return fields;
    }

    public void setFields(Map<String, StructureOfField> fields) {
        this.fields = fields;
    }
}
