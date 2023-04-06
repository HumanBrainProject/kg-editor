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

import eu.ebrains.kg.service.models.KGCoreResult;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;


@Component
public class AuthClient {

    private static final String ENDPOINT = "endpoint";

    private final ServiceCall kg;

    public AuthClient(ServiceCall kg) {
        this.kg = kg;
    }

    @Cacheable(value = "authEndpoint", unless = "#result == null")
    public String getEndpoint() {
        try {
            KGCoreResult.Single result = kg.client(true).get().uri(kg.url("users/authorization"))
                    .retrieve()
                    .bodyToMono(KGCoreResult.Single.class)
                    .block();
            if (result != null && result.getData() != null && result.getData().get(ENDPOINT) != null && StringUtils.isNotBlank(result.getData().get(ENDPOINT).toString())) {
                return result.getData().get(ENDPOINT).toString();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
