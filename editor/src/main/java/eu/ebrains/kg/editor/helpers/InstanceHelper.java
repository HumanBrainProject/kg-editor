package eu.ebrains.kg.editor.helpers;

import java.util.List;
import java.util.Map;

public class InstanceHelper {

    public static Map normalizePayloadWithId(Map<String, Object> body, String prefix) {
        body.forEach((k, v) -> {
            if(v instanceof List) {
                ((List)v).forEach(value -> {
                    if(value instanceof Map<?, ?>) {
                        checkId((Map) value, prefix);
                    }
                });
            } else if(v instanceof Map<?, ?>){
                body.put(k, checkId((Map) v, prefix));
            }
        });
        return body;
    }

    private static Map checkId(Map m, String prefix) {
        if(m.containsKey("@id")) {
            m.put("@id", addPrefix((String) m.get("@id"), prefix));
        }
        return m;
    }

    private static String addPrefix(String s, String prefix) {
        return s.startsWith("http") ? s: String.format("%s/%s", prefix, s);
    }

}
