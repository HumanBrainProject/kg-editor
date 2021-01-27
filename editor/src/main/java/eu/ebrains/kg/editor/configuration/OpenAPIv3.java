/*
 * Copyright 2021 EPFL/Human Brain Project PCO
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package eu.ebrains.kg.editor.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class OpenAPIv3 {


    @Bean
    public OpenAPI customOpenAPI(@Value("${eu.ebrains.kg.login.endpoint}") String loginEndpoint) {
        OAuthFlow oAuthFlow = new OAuthFlow();
        oAuthFlow.authorizationUrl(loginEndpoint);
        SecurityScheme userToken = new SecurityScheme().name("Authorization").type(SecurityScheme.Type.OAUTH2).flows(new OAuthFlows().implicit(oAuthFlow)).description("The user authentication");
        SecurityRequirement userWithoutClientReq = new SecurityRequirement().addList("Authorization");

        OpenAPI openapi = new OpenAPI().openapi("3.0.3");
        String description = "This is the API of the EBRAINS Knowledge Graph Editor";

        return openapi.info(new Info().version("v3.0.0").title(String.format("This is the EBRAINS KG Editor API")).description(description).license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0.html")).termsOfService("https://kg.ebrains.eu/search-terms-of-use.html"))
                .components(new Components()).schemaRequirement("Authorization", userToken)
                .security(Collections.singletonList(userWithoutClientReq));
    }
}
