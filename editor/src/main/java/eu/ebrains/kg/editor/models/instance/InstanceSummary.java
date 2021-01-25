package eu.ebrains.kg.editor.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.models.commons.Permissions;
import eu.ebrains.kg.editor.models.workspace.StructureOfField;

import java.util.List;
import java.util.stream.Collectors;

public class InstanceSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceSummary(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgWorkspace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions
    ) {
        this.id = getLastPathItem(kgId);
        this.types = handleTypes(kgType);
        this.workspace = kgWorkspace;
        this.permissions = Permissions.fromPermissionList(kgPermissions);
    }

    private List<SimpleType> handleTypes(List<String> types) {
        return types != null ? types.stream().map(SimpleType::new).collect(Collectors.toList()) : null;
    }

    private final String workspace;
    private final List<SimpleType> types;
    private final Permissions permissions;

    private String id;
    private String name;
    private List<StructureOfField> fields;

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getWorkspace() {
        return workspace;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public String getName() {
        return name;
    }

    public List<StructureOfField> getFields() {
        return fields;
    }

    public Permissions getPermissions() {
        return permissions;
    }

    private static String getLastPathItem(String url) {
        return url != null ? url.substring(url.lastIndexOf("/") + 1) : null;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setFields(List<StructureOfField> fields) {
        this.fields = fields;
    }
}
