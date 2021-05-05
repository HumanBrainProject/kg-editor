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

public class SchemaFieldsConstants {
    public static final String SCHEMA_ORG = "http://schema.org/";
    public static final String SCHEMA_HBP = "https://schema.hbp.eu/";

    public static final String IDENTIFIER = SCHEMA_ORG + "identifier";
    public static final String ALTERNATENAME = SCHEMA_ORG + "alternateName";
    public static final String NAME = SCHEMA_ORG + "name";
    public static final String GIVEN_NAME = SCHEMA_ORG + "givenName";
    public static final String FAMILY_NAME = SCHEMA_ORG + "familyName";
    public static final String EMAIL = SCHEMA_ORG + "email";
    public static final String PICTURE = SCHEMA_ORG + "picture";
    public static final String CURATOR = SCHEMA_HBP + "curator";
}
