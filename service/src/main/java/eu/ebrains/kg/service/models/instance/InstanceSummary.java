package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.models.commons.Permissions;
import eu.ebrains.kg.service.models.space.StructureOfField;

import java.util.List;
import java.util.Map;

public class InstanceSummary extends InstanceLabel {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public InstanceSummary(
            @JsonProperty("@id") String kgId,
            @JsonProperty("@type") List<String> kgType,
            @JsonProperty(EditorConstants.VOCAB_SPACE) String kgSpace,
            @JsonProperty(EditorConstants.VOCAB_PERMISSIONS) List<String> kgPermissions
    ) {
        super(kgId, kgType, kgSpace);
        this.permissions = Permissions.fromPermissionList(kgPermissions);
    }

    private final Permissions permissions;
    private Map<String, StructureOfField> fields;

    public Map<String, StructureOfField> getFields() {
        return fields;
    }

    public void setFields(Map<String, StructureOfField> fields) {
        this.fields = fields;
    }

    public Permissions getPermissions() {
        return permissions;
    }

}
