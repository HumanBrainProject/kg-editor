package eu.ebrains.kg.editor.models.workspace;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        private static final List<String> FIELDS_BLACKLIST = Arrays.asList("@id", "@type", SchemaFieldsConstants.IDENTIFIER, EditorConstants.VOCAB_ALTERNATIVE, EditorConstants.VOCAB_USER, EditorConstants.VOCAB_SPACES, EditorConstants.VOCAB_PROPERTY_UPDATES);


        @JsonProperty(SchemaFieldsConstants.NAME)
        public void schemaOrgName(String schemaOrgName) {
            this.label = schemaOrgName;
        }

        @JsonProperty(SchemaFieldsConstants.IDENTIFIER)
        public void schemaOrgIdentifier(String schemaOrgIdentifier) {
            this.name = schemaOrgIdentifier;
        }

        @JsonProperty(EditorConstants.VOCAB_COLOR)
        public void vocabColor(String color) {
            this.color = color;
        }

        @JsonProperty(EditorConstants.VOCAB_LABEL_PROPERTY)
        public void labelProperty(String labelProperty) {
            this.labelField = labelProperty;
            ensureLabelPropertyInPromotedFields();
        }


        // This has to be done a little special because we need to
        // ensure the code to work no matter in which order the fields are deserialized.
        private void ensureLabelPropertyInPromotedFields(){
            if(this.promotedFields != null && this.labelField != null){
                //Ensure the label field is at the first position
                this.promotedFields.remove(this.labelField);
                this.promotedFields.add(0, this.labelField);
            }
        }

        private static boolean filterField(StructureOfField f){
            return f.label != null && !FIELDS_BLACKLIST.contains(f.fullyQualifiedName);
        }

        @JsonProperty(EditorConstants.VOCAB_PROPERTIES)
        public void properties(List<StructureOfField.FromKG> fields){
            if(fields!=null){
                this.promotedFields = fields.stream().filter(FromKG::filterField).filter(f -> f.searchable != null && f.searchable).map(StructureOfField::getFullyQualifiedName).sorted().collect(Collectors.toList());
                ensureLabelPropertyInPromotedFields();
                this.fields = fields.stream().filter(FromKG::filterField).collect(Collectors.toMap(StructureOfField::getFullyQualifiedName, f -> f));
            }
        }

    }

}
