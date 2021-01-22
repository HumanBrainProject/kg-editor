package eu.ebrains.kg.editor.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class StructureOfType {
    protected String name;
    protected String label;
    protected String color;
    protected String labelField;
    protected Map<String, StructureOfField> fields;
    protected List<String> promotedFields;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getLabelField() {
        return labelField;
    }

    public void setLabelField(String labelField) {
        this.labelField = labelField;
    }

    public Map<String, StructureOfField> getFields() {
        return fields;
    }

    public void setFields(Map<String, StructureOfField> fields) {
        this.fields = fields;
    }

    public List<String> getPromotedFields() {
        return promotedFields;
    }

    public void setPromotedFields(List<String> promotedFields) {
        this.promotedFields = promotedFields;
    }


    public static class FromKG extends StructureOfType{

        @JsonProperty(SchemaFieldsConstants.NAME)
        public void schemaOrgName(String schemaOrgName) {
            this.label = schemaOrgName;
        }

        @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
        public void schemaOrgIdentifier(String schemaOrgIdentifier) {
            this.name = schemaOrgIdentifier;
        }

        @JsonProperty(EditorConstants.VOCAB_COLOR)
        public void color(String color) {
            this.color = color;
        }


    }

}
