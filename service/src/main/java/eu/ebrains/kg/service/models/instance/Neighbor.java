/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

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
