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

package eu.ebrains.kg.service.services;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.commons.UserSummary;
import eu.ebrains.kg.service.models.user.UserProfile;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class UserClient {

    private final ServiceCall kg;
    private final String searchEndpoint;
    private final String detailEndpoint;

    public UserClient(ServiceCall kg, @Value("${kg.users.searchEndpoint}") String searchEndpoint, @Value("${kg.users.detailEndpoint}") String detailEndpoint) {
        this.kg = kg;
        this.searchEndpoint = searchEndpoint;
        this.detailEndpoint = detailEndpoint;

    }

    private static class UserFromKG extends KGCoreResult<UserProfile> {
    }

    public UserProfile getUserProfile() {
        String relativeUrl = "users/me";
        UserFromKG response = kg.client(true).get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(UserFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    public static class UserRepresentation {
        private final String id;
        private final String username;
        private final String lastName;
        private final String firstName;

        @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
        public UserRepresentation(@JsonProperty("id") String id,
                                  @JsonProperty("username") String username,
                                  @JsonProperty("lastName") String lastName, @JsonProperty("firstName") String firstName
        ) {
            this.id = id;
            this.username = username;
            this.lastName = lastName;
            this.firstName = firstName;
        }
    }

    public List<UserSummary> getUsers(String search) {
        final List<UserRepresentation> result = this.kg.client(false).get().uri(String.format(this.searchEndpoint, URLEncoder.encode(search, StandardCharsets.UTF_8))).retrieve().bodyToMono(new ParameterizedTypeReference<List<UserRepresentation>>() {
        }).block();
        return result == null ? null : result.stream().map(this::fromUserRepresentation).toList();

    }

    private UserSummary fromUserRepresentation(UserRepresentation userRepresentation) {
        return new UserSummary(userRepresentation.id, userRepresentation.username, userRepresentation.firstName + " " + userRepresentation.lastName);
    }

    public UserSummary getUserById(String userId) {
        final UserRepresentation user = this.kg.client(false).get().uri(String.format(this.detailEndpoint, URLEncoder.encode(userId, StandardCharsets.UTF_8))).retrieve().bodyToMono(UserRepresentation.class).block();
        return user!=null ? fromUserRepresentation(user) : null;
    }

}
