/*
 *   Copyright (c) 2018, EPFL/Human Brain Project PCO
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

package services

import com.google.inject.Inject
import models.{AccessToken, BasicAccessToken}
import monix.eval.Task
import play.api.Logger
import play.api.cache.{AsyncCacheApi, NamedCache}
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient

class TokenAuthService @Inject()(
  wSClient: WSClient,
  config: ConfigurationServiceLive,
  credentialsService: CredentialsService,
  authServiceLive: AuthServiceLive,
  @NamedCache("userinfo-cache") cache: AsyncCacheApi,
  ws: WSClient
) {

  private val techAccessToken = "techAccessToken"
  val logger = Logger(this.getClass)

  object cacheService extends CacheService

  def getTechAccessToken(forceRefresh: Boolean = false): Task[AccessToken] =
    authServiceLive
      .getClientToken(wSClient, config.kgCoreEndpoint, config.clientSecret)
      .map {
        case Right(value) =>
          val d = (value \ "data").as[JsObject]
          BasicAccessToken((d \ "uuid").as[String]) //TODO: this is an assumption, move it to AuthService and create a reader
        case _ => throw new Exception("Could not fetch access token for tech account")
      }
}
