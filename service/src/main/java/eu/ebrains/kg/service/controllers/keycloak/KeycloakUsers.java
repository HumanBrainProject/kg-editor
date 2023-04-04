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
 */

package eu.ebrains.kg.service.controllers.keycloak;

import eu.ebrains.kg.service.models.commons.UserSummary;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.ws.rs.NotFoundException;
import java.util.List;

@Component
public class KeycloakUsers {
    private final Keycloak keycloakAdmin;
    private final String realm;

    public KeycloakUsers(Keycloak keycloakAdmin, @Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri}") String issuerUri) {
        this.keycloakAdmin = keycloakAdmin;
        this.realm = KeycloakAdminConfig.getRealmFromIssuerUri(issuerUri);
    }


    private boolean matchesFirstOrLastName(String firstName, String lastName, String[] words) {
        for (String w : words) {
            if ((firstName == null || !firstName.toLowerCase().contains(w.toLowerCase())) && (lastName == null || !lastName.toLowerCase().contains(w.toLowerCase()))) {
                return false;
            }
        }
        return true;
    }

    public List<UserSummary> findUser(String search) {
        final List<UserRepresentation> result = getUsers().search(search, 0, 20);
        final String[] words = search.split(" ");
        // We remove all elements where there are no matches in first or last name to prevent brute-force extraction of e-mail addresses.
        // In theory, we could end up with a problem of pagination (due to the post-removal) but this should not occur for real values - we therefore take the risk
        return result.stream().filter(r -> matchesFirstOrLastName(r.getFirstName(), r.getLastName(), words))
                .map(this::fromUserRepresentation)
                .toList();
    }

    private UserSummary fromUserRepresentation(UserRepresentation userRepresentation){
        return new UserSummary(userRepresentation.getId(), userRepresentation.getUsername(), userRepresentation.getFirstName() + " " + userRepresentation.getLastName());
    }

    public UserSummary getUserById(String userId) {
        final UserResource userResource = getUsers().get(userId);
        if (userResource != null) {
            try {
                return fromUserRepresentation(userResource.toRepresentation());
            } catch (NotFoundException e) {
                return null;
            }
        }
        return null;
    }

    private UsersResource getUsers() {
        return keycloakAdmin.realm(realm).users();
    }

}
