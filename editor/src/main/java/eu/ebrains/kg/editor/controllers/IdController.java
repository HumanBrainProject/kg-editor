package eu.ebrains.kg.editor.controllers;

import eu.ebrains.kg.editor.models.HasId;
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
    public Map<?, ?> fullyQualifyAtId(Map<String, Object> body) {
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
        if (id.startsWith(this.kgCoreInstancesPrefix)) {
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
