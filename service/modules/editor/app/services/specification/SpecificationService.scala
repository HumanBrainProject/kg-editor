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
package services.specification

import com.google.inject.Inject
import constants.{EditorConstants, QueryConstants}
import javax.inject.Singleton
import models.RefreshAccessToken
import monix.eval.Task
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.libs.json.JsObject
import play.api.libs.ws.{WSClient, WSResponse}
import services.instance.InstanceApiService
import services.ConfigurationService

final case class SpecificationFile(id: String, data: JsObject)

@Singleton
class SpecificationService @Inject()(
  WSClient: WSClient,
  config: ConfigurationService
) {
  object instanceApiService extends InstanceApiService

  def fetchSpecifications(token: RefreshAccessToken): Task[WSResponse] = {
    Task.deferFuture(
      WSClient
        .url(s"${config.kgQueryEndpoint}/query/meta/minds/specification/v0.0.1/specificationQuery/instances")
        .addHttpHeaders(AUTHORIZATION -> token.token)
        .addQueryStringParameters(QueryConstants.VOCAB -> EditorConstants.META)
        .get()
    )
  }
}
