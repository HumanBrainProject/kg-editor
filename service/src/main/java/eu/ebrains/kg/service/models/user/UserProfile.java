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

package eu.ebrains.kg.service.models.user;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.constants.SchemaFieldsConstants;
import eu.ebrains.kg.service.models.commons.UserSummary;
import org.springframework.util.CollectionUtils;

import java.util.List;

public class UserProfile extends UserSummary {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public UserProfile(
            @JsonProperty(SchemaFieldsConstants.IDENTIFIER) List<String> kgId,
            @JsonProperty(SchemaFieldsConstants.ALTERNATENAME) String kgUserName,
            @JsonProperty(SchemaFieldsConstants.NAME) String kgName,
            @JsonProperty(SchemaFieldsConstants.GIVEN_NAME) String kgGivenName,
            @JsonProperty(SchemaFieldsConstants.FAMILY_NAME) String kgFamilyName,
            @JsonProperty(SchemaFieldsConstants.EMAIL) String kgEmail){
        super(!CollectionUtils.isEmpty(kgId) ? kgId.get(0) : null, kgUserName, kgName);
        this.givenName = kgGivenName;
        this.familyName = kgFamilyName;
        this.email = kgEmail;
    }

    private final String givenName;
    private final String familyName;
    private final String email;
    private List<Space> spaces;

    public String getGivenName() {
        return givenName;
    }

    public String getFamilyName() {
        return familyName;
    }

    public String getEmail() {
        return email;
    }

    public List<Space> getSpaces() {
        return spaces;
    }

    public void setSpaces(List<Space> spaces) {
        this.spaces = spaces;
    }
}
