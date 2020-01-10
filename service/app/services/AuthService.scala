/*
 *   Copyright (c) 2019, EPFL/Human Brain Project PCO
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

import akka.Done
import com.google.inject.Inject
import models.errors.APIEditorError
import monix.eval.Task
import org.slf4j.LoggerFactory
import play.api.cache.AsyncCacheApi
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.WSClient
import play.cache.NamedCache
import monix.execution.Scheduler.Implicits.global

import scala.concurrent.duration.FiniteDuration

trait AuthService {

  def getEndpoint(wSClient: WSClient): Task[Either[APIEditorError, JsObject]]

  def getClientToken(): Task[Either[APIEditorError, JsObject]]

}

class AuthServiceLive @Inject()(
  wSClient: WSClient,
  config: ConfigurationServiceLive,
  authAPIServiceLive: AuthAPIServiceLive,
  @NamedCache("servicetoken-cache") serviceTokenCache: AsyncCacheApi
) extends AuthService {
  private val log = LoggerFactory.getLogger(this.getClass)

  val timeout = FiniteDuration(30, "sec")
  init().runSyncUnsafe(timeout)

  def init(): Task[Done] = {
    log.info("Client Token Initialization")
    getClientToken().map {
      case Right(res) =>
        log.info("Setting token in cache")
        val token = (res \ "access_token").as[String]
        val expiration = (res \ "expires_in").as[Long]
        serviceTokenCache.set("clientToken", token, FiniteDuration(expiration, "minute"))
        Done
      case Left(err) =>
        log.error(err.content)
        Done
    }
  }

  def getEndpoint(wSClient: WSClient): Task[Either[APIEditorError, JsObject]] =
    authAPIServiceLive
      .getEndpoint(wSClient, config.kgCoreEndpoint)
      .map {
        case Right(value) => Right(value)
        case Left(res)    => Left(APIEditorError(res.status, res.body))
      }

  def getClientToken(): Task[Either[APIEditorError, JsObject]] = {
    val clientTokenEndpoint = authAPIServiceLive.getClientTokenEndpoint(wSClient, config.kgCoreEndpoint)
    clientTokenEndpoint.flatMap {
      case Right(endpoint) =>
        val res = (endpoint \ "data").as[Map[String, String]]
        authAPIServiceLive
          .getClientToken(wSClient, res.getOrElse("endpoint", ""), config.clientSecret)
          .map {
            case Right(value) => Right(value)
            case Left(res)    => Left(APIEditorError(res.status, res.body))
          }
      case Left(res) => Task.pure(Left(APIEditorError(res.status, res.body)))
    }
  }
}
