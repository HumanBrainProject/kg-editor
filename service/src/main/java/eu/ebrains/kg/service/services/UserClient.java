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

import eu.ebrains.kg.service.controllers.UserPictureRepository;
import eu.ebrains.kg.service.models.KGCoreResult;
import eu.ebrains.kg.service.models.commons.UserSummary;
import eu.ebrains.kg.service.models.user.UserProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class UserClient{

    private final ServiceCall kg;
    private final UserPictureRepository userPictureRepository;

    public UserClient(ServiceCall kg, UserPictureRepository userPictureRepository) {
        this.kg = kg;
        this.userPictureRepository  = userPictureRepository;
    }

    private static class UserFromKG extends KGCoreResult<UserProfile>{}

    public UserProfile getUserProfile() {
        String relativeUrl = "users/me";
        UserFromKG response = kg.client().get().uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(UserFromKG.class)
                .block();
        return response != null ? response.getData() : null;
    }

    private static class UserSummaryFromIAM extends KGCoreResult<List<UserSummary>> {}
    public KGCoreResult<List<UserSummary>> getUsers(String search) {
        String relativeUrl = String.format("users/fromIAM?search=%s", search);
        return kg.client().get()
                .uri(kg.url(relativeUrl))
                .retrieve()
                .bodyToMono(UserSummaryFromIAM.class)
                .block();
    }

    public Map<String, String> getUserPictures(List<String> userIds){
        Map<String, String> result = new HashMap<>();
        userIds.forEach(userId -> {
            String picture = userPictureRepository.fetchUserPicture(userId);
            if (picture != null) {
                result.put(userId, picture);
            }
        });
        return result;
    }

}
