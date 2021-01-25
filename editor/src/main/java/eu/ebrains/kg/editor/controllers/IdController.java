package eu.ebrains.kg.editor.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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
                        checkId((Map<String, Object>) value);
                    }
                });
            } else if (v instanceof Map) {
                body.put(k, checkId((Map<String, Object>) v));
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
        return s.startsWith("http") ? s : String.format("%s/%s", prefix, s);
    }

}
