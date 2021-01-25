package eu.ebrains.kg.editor.helpers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class InstanceHelper {

    /**
     * This method takes a payload and translates it @id from simplified (UUID only) to fully qualified (incl. KG namespace)
     */
    public static Map<?,?> fullyQualifyAtId(Map<String, Object> body, String prefix) {
        body.forEach((k, v) -> {
            if(v instanceof List) {
                ((List<?>)v).forEach(value -> {
                    if(value instanceof Map<?, ?>) {
                        checkId((Map<String, Object>) value, prefix);
                    }
                });
            } else if(v instanceof Map<?, ?>){
                body.put(k, checkId((Map<String, Object>) v, prefix));
            }
        });
        return body;
    }

    private static Map<String, Object> checkId(Map<String, Object> m, String prefix) {
        if(m.containsKey("@id")) {
            m.put("@id", addPrefix((String) m.get("@id"), prefix));
        }
        return m;
    }

    public static UUID simplifyFullyQualifiedId(){
        return null;
    }

    private static String addPrefix(String s, String prefix) {
        return s.startsWith("http") ? s: String.format("%s/%s", prefix, s);
    }

}
