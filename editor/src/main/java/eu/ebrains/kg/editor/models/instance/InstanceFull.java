package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.models.commons.Permissions;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class InstanceFull {
    protected String id;
    protected String workspace;
    protected List<SimpleType> types;
    protected String name;
    protected Map<String, StructureOfField> fields;
    protected Permissions permissions;
    protected Map<String, List<Alternative.FromKG>> alternatives;
    protected String labelField;
    protected List<String> promotedFields;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWorkspace() {
        return workspace;
    }

    public void setWorkspace(String workspace) {
        this.workspace = workspace;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public void setTypes(List<SimpleType> types) {
        this.types = types;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, StructureOfField> getFields() {
        return fields;
    }

    public void setFields(Map<String, StructureOfField> fields) {
        this.fields = fields;
    }

    public Permissions getPermissions() {
        return permissions;
    }

    public void setPermissions(Permissions permissions) {
        this.permissions = permissions;
    }

    public Map<String, List<Alternative.FromKG>> getAlternatives() {
        return alternatives;
    }

    public void setAlternatives(Map<String, List<Alternative.FromKG>> alternatives) {
        this.alternatives = alternatives;
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

    public static class FromKG extends InstanceFull{

        @JsonProperty("@id")
        public void atId(String id){
            this.id = id;
        }

        @JsonProperty("@type")
        public void atType(List<String> types){
            if(types!=null){
                this.types = types.stream().map(t -> {
                    SimpleType simpleType = new SimpleType();
                    simpleType.setName(t);
                    return simpleType;
                }).collect(Collectors.toList());
            }
        }

        @JsonProperty(EditorConstants.VOCAB_SPACE)
        public void vocabSpace(String space){
            this.workspace = space;
        }

        @JsonProperty(EditorConstants.VOCAB_PERMISSIONS)
        public void vocabPermissions(List<String> permissions) {
            this.permissions = Permissions.fromPermissionList(permissions);
        }

        @JsonProperty(EditorConstants.VOCAB_ALTERNATIVE)
        public void vocabAlternative(Map<String, List<Alternative.FromKG>> alternatives){
            this.alternatives=alternatives;
        }

    }



//    protected
//
//    promotedFields: Option[List[String]],
//    labelField: Option[String],
//    fields: Map[String, Field],
//    user: Option[String],

}
