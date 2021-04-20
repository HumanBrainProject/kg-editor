package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.EditorConstants;
import eu.ebrains.kg.service.constants.SchemaFieldsConstants;

import java.util.List;

public class IncomingLinksByType {
    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public IncomingLinksByType(
            @JsonProperty(SchemaFieldsConstants.NAME) String kgLabel,
            @JsonProperty(EditorConstants.VOCAB_COLOR) String kgColor,
            @JsonProperty("data") List<IncomingLink> kgData,
            @JsonProperty("totalResults") int kgTotal,
            @JsonProperty("from") int kgFrom,
            @JsonProperty("size") int kgSize,
            @JsonProperty(EditorConstants.VOCAB_NAME_FOR_REVERSE_LINK) String kgNameForReverseLink
    ){
        this.label = kgLabel;
        this.color = kgColor;
        this.data = kgData;
        this.total = kgTotal;
        this.from = kgFrom;
        this.size = kgSize;
        this.nameForReverseLink = kgNameForReverseLink;
    }

    private final String label;
    private final String color;
    private final List<IncomingLink> data;
    private final int total;
    private final int from;
    private final int size;
    private final String nameForReverseLink;

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }


    public List<IncomingLink> getData() {
        return data;
    }

    public int getTotal() {
        return total;
    }

    public int getFrom() {
        return from;
    }

    public int getSize() {
        return size;
    }

    public String getNameForReverseLink() {
        return nameForReverseLink;
    }
}
