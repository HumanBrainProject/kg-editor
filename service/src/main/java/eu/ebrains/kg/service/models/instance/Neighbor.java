package eu.ebrains.kg.service.models.instance;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class Neighbor {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public Neighbor(@JsonProperty("id") String kgId,
                    @JsonProperty("name") String kgName,
                    @JsonProperty("types") List<String> kgTypes,
                    @JsonProperty("space") String kgSpace,
                    @JsonProperty("inbound") List<Neighbor> kgInbound,
                    @JsonProperty("outbound") List<Neighbor> kgOutbound) {
        this.id = kgId;
        this.name = kgName;
        this.types = kgTypes!=null ? kgTypes.stream().map(SimpleType::new).collect(Collectors.toList()) : null;
        this.space = kgSpace;
        this.inbound = kgInbound == null ? Collections.emptyList() : kgInbound;
        this.outbound = kgOutbound == null ? Collections.emptyList() : kgOutbound;
    }

    private final String id;
    private final String name;
    private List<SimpleType> types;
    private final String space;
    private final List<Neighbor> inbound;
    private final List<Neighbor> outbound;

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<SimpleType> getTypes() {
        return types;
    }

    public String getSpace() {
        return space;
    }

    public List<Neighbor> getInbound() {
        return inbound;
    }

    public List<Neighbor> getOutbound() {
        return outbound;
    }

    public void setTypes(List<SimpleType> types) {
        this.types = types;
    }
}
