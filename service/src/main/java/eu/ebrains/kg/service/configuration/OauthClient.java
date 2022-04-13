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

package eu.ebrains.kg.service.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.RemoveAuthorizedClientOAuth2AuthorizationFailureHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Configuration
public class OauthClient {
    private final ExchangeStrategies exchangeStrategies = ExchangeStrategies.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1000000)).build();


    public static final String AUTHORIZATION_KEY = "Authorization";
    private static final String USER_AUTHORIZATION_KEY = "User-Authorization";
    private static final java.lang.String CLIENT_AUTHORIZATION_KEY = "Client-Authorization";

    private final Logger logger = LoggerFactory.getLogger(getClass());
    @Bean
    WebClient webClient(ClientRegistrationRepository clientRegistrations, OAuth2AuthorizedClientService authorizedClientService, HttpServletRequest request) {
        AuthorizedClientServiceOAuth2AuthorizedClientManager clientManager = new AuthorizedClientServiceOAuth2AuthorizedClientManager(clientRegistrations, authorizedClientService);
        ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2 =  new ServletOAuth2AuthorizedClientExchangeFilterFunction(clientManager);
        oauth2.setAuthorizationFailureHandler(new RemoveAuthorizedClientOAuth2AuthorizationFailureHandler(
                (clientRegistrationId, principal, attributes) -> {
                    logger.info("Resource server authorization failure for clientRegistrationId={}", clientRegistrationId);
                    authorizedClientService.removeAuthorizedClient(clientRegistrationId, principal.getName());
                })
        );
        oauth2.setDefaultClientRegistrationId("kg");
        return WebClient.builder().exchangeStrategies(exchangeStrategies).apply(oauth2.oauth2Configuration()).filter((clientRequest, nextFilter) ->{
            ClientRequest updatedHeaders = ClientRequest.from(clientRequest).headers(h -> {
                //Spring adds the oauth2 bearer token to the standard "Authorization" header -> we want it to be sent as
                // "Client-Authorization" though to let the user token be handed in properly.
                h.put(CLIENT_AUTHORIZATION_KEY, h.get(AUTHORIZATION_KEY));
                List<String> userAuth = h.get(USER_AUTHORIZATION_KEY);
                h.put(AUTHORIZATION_KEY, userAuth);
                h.remove(USER_AUTHORIZATION_KEY);
            }).build();
            return nextFilter.exchange(updatedHeaders);
        }).defaultRequest(r ->
            /**
             *  We have to add the user access token to the request here, because this consumer is executed in the original
             *  thread and we therefore have access to the original request. We store it in a temporary header since otherwise
             *  it would be overwritten by the above exchange filter.
             */
            r.header(USER_AUTHORIZATION_KEY, request.getHeader(AUTHORIZATION_KEY))
        ).build();
    }

}
