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

package eu.ebrains.kg.service.constants;

public class EditorConstants {
    public static final String CORE_NAMESPACE = "https://core.kg.ebrains.eu/";
    public static final String LABEL = CORE_NAMESPACE + "vocab/label";
    public static final String EDITOR_NAMESPACE = "https://editor.kg.ebrains.eu/";
    public static final String CORE_META = CORE_NAMESPACE + "vocab/meta/";
    public static final String EDITOR_META = EDITOR_NAMESPACE + "vocab/meta/";

    public static final String VOCAB_TYPES = CORE_META + "types";
    public static final String VOCAB_TYPE = CORE_META + "type";
    public static final String VOCAB_OCCURRENCES = CORE_META + "occurrences";
    public static final String VOCAB_ORDER = CORE_META + "orderNumber";
    public static final String VOCAB_SPACES = CORE_META + "spaces";
    public static final String VOCAB_SPACE = CORE_META + "space";
    public static final String VOCAB_ALTERNATIVE = CORE_META + "alternative";
    public static final String VOCAB_REGEX = CORE_META + "regex";
    public static final String VOCAB_VALIDATION = CORE_META + "validation";
    public static final String VOCAB_ERROR_MESSAGE = CORE_META + "errorMessage";
    public static final String VOCAB_MAX_LENGTH = CORE_META + "maxLength";
    public static final String VOCAB_MIN_ITEMS = CORE_META + "minItems";
    public static final String VOCAB_MAX_ITEMS = CORE_META + "maxItems";
    public static final String VOCAB_MIN_VALUE = CORE_META + "minValue";
    public static final String VOCAB_MAX_VALUE = CORE_META + "maxValue";
    public static final String VOCAB_SELECTED = CORE_META + "selected";
    public static final String VOCAB_REQUIRED = CORE_META + "required";
    public static final String VOCAB_USER = CORE_META + "user";
    public static final String VOCAB_VALUE = CORE_META + "value";
    public static final String VOCAB_PERMISSIONS = CORE_META + "permissions";
    public static final String VOCAB_COLOR = CORE_META + "color";
    public static final String VOCAB_NAME_FOR_REVERSE_LINK = CORE_META + "nameForReverseLink";
    public static final String VOCAB_PROPERTY_UPDATES = CORE_META + "propertyUpdates";
    public static final String VOCAB_PROPERTIES = CORE_META + "properties";
    public static final String VOCAB_INCOMING_LINKS = CORE_META + "incomingLinks";
    public static final String VOCAB_SOURCE_TYPES = CORE_META + "sourceTypes";
    public static final String VOCAB_EMBEDDED_ONLY = CORE_META + "embeddedOnly";
    public static final String VOCAB_LABEL_PROPERTY = CORE_META + "type/labelProperty";
    public static final String VOCAB_SEARCHABLE = CORE_META + "property/searchable";
    public static final String VOCAB_TARGET_TYPES = CORE_META + "targetTypes";
    public static final String VOCAB_AUTO_RELEASE = CORE_META + "space/autorelease";
    public static final String VOCAB_CLIENT_SPACE = CORE_META + "space/clientSpace";
    public static final String VOCAB_INTERNAL_SPACE = CORE_META + "space/internalSpace";

    public static final String VOCAB_LABEL_TOOLTIP = EDITOR_META + "property/labelTooltip";
    public static final String VOCAB_WIDGET = EDITOR_META + "property/widget";
    public static final String VOCAB_READONLY = EDITOR_META + "property/readOnly";
    public static final String VOCAB_CAN_CREATE = EDITOR_META + "type/canCreate";
}
