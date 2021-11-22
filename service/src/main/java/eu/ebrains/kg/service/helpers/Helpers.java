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

package eu.ebrains.kg.service.helpers;

import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.type.StructureOfField;
import eu.ebrains.kg.service.models.type.StructureOfType;
import org.apache.commons.lang3.StringUtils;

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
        return field.getWidget() != null && (field.getWidget().equals("Nested") ||  field.getWidget().equals("SingleNested"));
    }

    public static void enrichFieldsTargetTypes(Map<String, StructureOfType> typesMap, Map<String, StructureOfField> fields) {
        if (fields != null) {
            fields.forEach((name, field) -> {
                if (field.getTargetTypes() != null) {
                    field.getTargetTypes().forEach(targetType -> {
                        if (StringUtils.isNotBlank(targetType.getName())) {
                            StructureOfType t = typesMap.get(targetType.getName());
                            if (t != null) {
                                targetType.setLabel(t.getLabel());
                                targetType.setColor(t.getColor());
                                targetType.setDescription(t.getDescription());
                            }
                        }
                    });
                }
            });
        }
    }
}

