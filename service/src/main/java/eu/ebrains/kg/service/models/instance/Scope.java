package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.models.commons.Permissions;

import java.util.List;
import java.util.stream.Collectors;

public class Scope {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Scope(@JsonProperty("id") String kgId,
                 @JsonProperty("label") String kgLabel,
                 @JsonProperty("types") List<String> kgTypes,
                 @JsonProperty("children") List<Scope> kgChildren,
                 @JsonProperty("permissions") List<String> permissions) {
        this.id = kgId;
        this.label = kgLabel;
        this.types = kgTypes!=null ? kgTypes.stream().map(SimpleType::new).collect(Collectors.toList()) : null;
        this.permissions = Permissions.fromPermissionList(permissions);
        this.children = kgChildren;
    }

    private final String id;
    private final String label;
    private final Permissions permissions;
    private final List<Scope> children;
    private List<SimpleType> types;
    private String status;

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public Permissions getPermissions() {
        return permissions;
    }

    public List<Scope> getChildren() {
        return children;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public void setTypes(List<SimpleType> types) {
        this.types = types;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
