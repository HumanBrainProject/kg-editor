package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.models.commons.Permissions;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;

import java.util.List;
import java.util.stream.Collectors;

public class InstanceSummary {

    protected String id;
    protected String workspace;
    protected List<SimpleType> types;
    protected String name;
    protected List<StructureOfField> fields;
    protected Permissions permissions;

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

    public List<StructureOfField> getFields() {
        return fields;
    }

    public void setFields(List<StructureOfField> fields) {
        this.fields = fields;
    }

    public Permissions getPermissions() {
        return permissions;
    }

    public void setPermissions(Permissions permissions) {
        this.permissions = permissions;
    }

    public static class FromKG extends InstanceSummary {

        private static String getLastPathItem(String url){
            return url!=null ? url.substring(url.lastIndexOf("/")+1) : null;
        }


        @JsonProperty("@id")
        public void atId(String id){
            this.id = getLastPathItem(id);
        }

        @JsonProperty("@type")
        public void atType(List<String> types){
            this.types = types != null ? types.stream().map(t -> {
                SimpleType type = new SimpleType();
                type.setName(t);
                return type;
            }).collect(Collectors.toList()) : null;
        }

        @JsonProperty(EditorConstants.VOCAB_SPACE)
        public void vocabSpace(String space){
            this.workspace = space;
        }

        @JsonProperty(EditorConstants.VOCAB_PERMISSIONS)
        public void vocabPermissions(List<String> permissions) {
            this.permissions = Permissions.fromPermissionList(permissions);
        }
    }
}
