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

package services

import com.google.inject.Inject
import models.RefreshAccessToken
import monix.eval.Task
import play.api.Logger
import play.api.cache.{AsyncCacheApi, NamedCache}
import play.api.http.Status._
import play.api.libs.ws.WSClient

class TokenAuthService @Inject()(
  config: ConfigurationService,
  credentialsService: CredentialsService,
  @NamedCache("userinfo-cache") cache: AsyncCacheApi,
  ws: WSClient
) {

  private val techAccessToken = "techAccessToken"
  val logger = Logger(this.getClass)

  object cacheService extends CacheService

  def getTechAccessToken(forceRefresh: Boolean = false): Task[RefreshAccessToken] = {
    if (forceRefresh) {
      val clientCred = credentialsService.getClientCredentials()
      refreshAccessToken(clientCred)
    } else {
      cacheService.get[String](cache, techAccessToken).flatMap {
        case Some(token) => Task.pure(RefreshAccessToken(token))
        case _ =>
          val clientCred = credentialsService.getClientCredentials()
          refreshAccessToken(clientCred)
      }
    }
  }

  private def refreshAccessToken(clientCredentials: ClientCredentials): Task[RefreshAccessToken] = {
    Task
      .deferFuture {
        ws.url(config.oidcTokenEndpoint)
          .withQueryStringParameters(
            "client_id"     -> clientCredentials.clientId,
            "client_secret" -> clientCredentials.clientSecret,
            "grant_type"    -> "client_credentials"
          )
          .get()
      }
      .flatMap { result =>
        result.status match {
          case OK =>
            val token = s"Bearer ${(result.json \ "access_token").as[String]}"
            cacheService.set(cache, techAccessToken, token, config.cacheExpiration).map { _ =>
              RefreshAccessToken(token)
            }
          case _ =>
            logger.error(s"Error: while fetching tech account access token $result")
            throw new Exception("Could not fetch access token for tech account")
        }
      }
  }
}
