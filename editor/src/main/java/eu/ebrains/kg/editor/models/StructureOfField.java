package eu.ebrains.kg.editor.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class StructureOfField {
    protected String fullyQualifiedName;
    protected String name;
    protected String label;
    protected Integer numOfOccurrences;
    protected String widget;
    protected String labelTooltip;
    protected Boolean markdown;
    protected Boolean searchable;
    protected Boolean allowCustomValues;
    protected Integer order;
    protected List<StructureOfField> fields;

    public String getFullyQualifiedName() {
        return fullyQualifiedName;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public Integer getNumOfOccurrences() {
        return numOfOccurrences;
    }

    public String getWidget() {
        return widget;
    }

    public String getLabelTooltip() {
        return labelTooltip;
    }

    public Boolean getMarkdown() {
        return markdown;
    }

    public Boolean getSearchable() {
        return searchable;
    }

    public Boolean getAllowCustomValues() {
        return allowCustomValues;
    }

    public Integer getOrder() {
        return order;
    }

    public List<StructureOfField> getFields() {
        return fields;
    }

    public static class FromKG extends StructureOfField{

        @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
        public void identifier(String identifier){
            this.fullyQualifiedName = identifier;
        }

        @JsonProperty(EditorConstants.VOCAB_OCCURRENCES)
        public void occurrences(Integer occ){
            this.numOfOccurrences = occ;
        }

        @JsonProperty(EditorConstants.VOCAB_ORDER)
        public void orderNumber(Integer orderNumber){
            this.order = orderNumber;
        }

        @JsonProperty(SchemaFieldsConstants.NAME)
        public void schemaOrgName(String name){
            this.name = name;
            this.label = name != null ? StringUtils.capitalize(name) : null;
        }

        @JsonProperty(EditorConstants.VOCAB_WIDGET)
        public void vocabWidget(String widget){
            this.widget  = widget;
        }

        @JsonProperty(EditorConstants.VOCAB_LABEL_TOOLTIP)
        public void vocabLabelTooltip(String labelTooltip){
            this.labelTooltip = labelTooltip;
        }

        //TODO why is this not qualified?
        @JsonProperty("markdown")
        public void vocabMarkdown(Boolean markdown){
            this.markdown = markdown;
        }

        //TODO why is this not qualified?
        @JsonProperty("allowCustomValues")
        public void vocabAllowCustomValues(Boolean allowCustomValues){
            this.allowCustomValues = allowCustomValues;
        }

        @JsonProperty(EditorConstants.VOCAB_SEARCHABLE)
        public void vocabSearchable(Boolean searchable){
            this.searchable = searchable;
        }
    }
}
