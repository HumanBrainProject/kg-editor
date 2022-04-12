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

package eu.ebrains.kg.service.controllers;

import eu.ebrains.kg.service.models.HasId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class IdController {


    private final String kgCoreInstancesPrefix;

    public IdController(@Value("${kgcore.instancesPrefix}") String kgCoreInstancesPrefix) {
        if (kgCoreInstancesPrefix != null) {
            this.kgCoreInstancesPrefix = kgCoreInstancesPrefix.endsWith("/") ? kgCoreInstancesPrefix : kgCoreInstancesPrefix + "/";
        } else {
            this.kgCoreInstancesPrefix = null;
        }
    }

    /**
     * This method takes a payload and translates it @id from simplified (UUID only) to fully qualified (incl. KG namespace)
     */
    public Map<String, Object> fullyQualifyAtId(Map<String, Object> body) {
        body.forEach((k, v) -> {
            if (v instanceof List) {
                ((List<?>) v).forEach(value -> {
                    if (value instanceof Map) {
                        Map<String, Object> valToMap = (Map<String, Object>) value;
                        if(!valToMap.containsKey("@id")) {
                            fullyQualifyAtId(valToMap);
                        }
                        checkId((Map<String, Object>) value);
                    }
                });
            } else if (v instanceof Map) {
                Map<String, Object> vToMap = (Map<String, Object>) v;
                if(!vToMap.containsKey("@id")) {
                    fullyQualifyAtId(vToMap);
                }
                body.put(k, checkId(vToMap));
            }
        });
        return body;
    }

    private Map<String, Object> checkId(Map<String, Object> m) {
        if (m.containsKey("@id")) {
            m.put("@id", addPrefix((String) m.get("@id"), this.kgCoreInstancesPrefix));
        }
        return m;
    }

    public <T extends HasId> T simplifyId(T object){
        if (object != null && object.getId() != null) {
            UUID uuid = simplifyFullyQualifiedId(object.getId());
            if(uuid!=null){
                object.setId(uuid.toString());
            }
        }
        return object;
    }

    public Object simplifyIdIfObjectIsAMap(Object e) {
        if(e instanceof Collection) {
            ((Collection<?>) e).forEach(col -> simplifyIdIfObjectIsAMap(col));
        } else if (e instanceof Map) {
            Map map = (Map) e;
            Object atId = map.get("@id");
            if (atId != null) {
                UUID uuid = simplifyFullyQualifiedId(atId.toString());
                if (uuid != null) {
                    //We only replace it when it's a proper UUID
                    map.put("@id", uuid.toString());
                }
            }
        }
        return e;
    }

    public UUID simplifyFullyQualifiedId(String id) {
        if (id!=null && id.startsWith(this.kgCoreInstancesPrefix)) {
            String uuid = id.substring(this.kgCoreInstancesPrefix.length());
            try {
                return UUID.fromString(uuid);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        return null;
    }

    private String addPrefix(String s, String prefix) {
        return s.startsWith("http") ? s : String.format("%s%s", prefix, s);
    }

}
