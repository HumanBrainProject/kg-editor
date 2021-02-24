package eu.ebrains.kg.editor.models.workspace;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.editor.constants.EditorConstants;
import eu.ebrains.kg.editor.constants.SchemaFieldsConstants;
import org.springframework.util.CollectionUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StructureOfType {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public StructureOfType(
            @JsonProperty(SchemaFieldsConstants.NAME) String kgLabel,
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) String kgName,
            @JsonProperty(EditorConstants.VOCAB_COLOR) String kgColor,
            @JsonProperty(EditorConstants.VOCAB_LABEL_PROPERTY) String kgLabelField,
            @JsonProperty(EditorConstants.VOCAB_PROPERTIES) List<StructureOfField> kgFields,
            @JsonProperty(EditorConstants.VOCAB_INCOMING_LINKS) List<StructureOfIncomingLink> kgIncomingLinks
    ) {
        this.label = kgLabel;
        this.name = kgName;
        this.color = kgColor;
        this.labelField = kgLabelField;
        this.promotedFields = kgFields != null ? kgFields.stream().filter(StructureOfType::filterField).filter(f -> f.getSearchable() != null && f.getSearchable()).map(StructureOfField::getFullyQualifiedName).sorted().collect(Collectors.toList()) : null;
        if (this.labelField != null && !CollectionUtils.isEmpty(this.promotedFields)) {
            //Ensure the label field is at the first position
            this.promotedFields.remove(this.labelField);
            this.promotedFields.add(0, this.labelField);
        }
        this.fields = kgFields != null ? kgFields.stream().filter(StructureOfType::filterField).collect(Collectors.toMap(StructureOfField::getFullyQualifiedName, f -> f)) : Collections.emptyMap();
        this.incomingLinks = !CollectionUtils.isEmpty(kgIncomingLinks) ?
                kgIncomingLinks.stream()
                        .collect(Collectors.toMap(
                                StructureOfIncomingLink::getFullyQualifiedName,
                                v -> v)
                        ) : Collections.emptyMap();
    }

    private static final List<String> FIELDS_BLACKLIST = Arrays.asList("@id", "@type", SchemaFieldsConstants.IDENTIFIER, EditorConstants.VOCAB_ALTERNATIVE, EditorConstants.VOCAB_USER, EditorConstants.VOCAB_SPACES, EditorConstants.VOCAB_PROPERTY_UPDATES);

    private static boolean filterField(StructureOfField f) {
        return f.getLabel() != null && !FIELDS_BLACKLIST.contains(f.getFullyQualifiedName());
    }

    private final String label;
    private final String name;
    private final String color;
    private final String labelField;
    private final Map<String, StructureOfField> fields;
    private final List<String> promotedFields;
    private final Map<String, StructureOfIncomingLink> incomingLinks;

    public static List<String> getFieldsBlacklist() {
        return FIELDS_BLACKLIST;
    }

    public String getLabel() {
        return label;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public String getLabelField() {
        return labelField;
    }

    public Map<String, StructureOfField> getFields() {
        return fields;
    }

    public List<String> getPromotedFields() {
        return promotedFields;
    }

    public Map<String, StructureOfIncomingLink> getIncomingLinks() {
        return incomingLinks;
    }
}
