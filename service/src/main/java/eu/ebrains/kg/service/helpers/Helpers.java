package eu.ebrains.kg.service.helpers;

import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.space.StructureOfField;
import eu.ebrains.kg.service.models.space.StructureOfType;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class Helpers {

    public static Map<String, StructureOfType> getTypesByName(Map<String, KGCoreResult<StructureOfType>> typesResultByName) {
        return typesResultByName.values().stream()
                .map(KGCoreResult::getData)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(StructureOfType::getName, v -> v));
    }

    public static boolean isNestedField(StructureOfField field) {
        return field.getWidget() != null && field.getWidget().equals("Nested");
    }
}
