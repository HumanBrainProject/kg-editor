package eu.ebrains.kg.editor.models;

import java.util.Map;

public class ResultWithOriginalMap<T> {
    private final Map<?, ? > originalMap;
    private final T result;

    public ResultWithOriginalMap(Map<?, ?> originalMap, T result) {
        this.originalMap = originalMap;
        this.result = result;
    }

    public Map<?, ?> getOriginalMap() {
        return originalMap;
    }

    public T getResult() {
        return result;
    }
}
