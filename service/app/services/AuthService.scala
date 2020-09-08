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
import com.google.inject.{Inject, Singleton}
import models.errors.APIEditorError
import monix.eval.Task
import monix.execution.Scheduler.Implicits.global
import play.api.cache.AsyncCacheApi
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient
import play.cache.NamedCache

import scala.concurrent.duration.FiniteDuration

trait AuthService {

  def getEndpoint(wSClient: WSClient): Task[Either[APIEditorError, JsObject]]

  def retrieveClientToken(): Task[Either[APIEditorError, String]]

  def getClientToken(forceRefresh: Boolean): Task[Either[APIEditorError, String]]

}

@Singleton
class AuthServiceLive @Inject()(
  wSClient: WSClient,
  config: ConfigurationServiceLive,
  authAPIServiceLive: AuthAPIServiceLive,
  @NamedCache("servicetoken-cache") serviceTokenCache: AsyncCacheApi
) extends AuthService
    with CacheService {

  val timeout = FiniteDuration(30, "sec")
  init().runSyncUnsafe(timeout)

  def init(): Task[Done] = {
    log.info("Client Token Initialization")
    getClientToken()
    Task.pure(Done)
  }

  def getEndpoint(wSClient: WSClient): Task[Either[APIEditorError, JsObject]] =
    authAPIServiceLive
      .getEndpoint(wSClient, config.kgCoreEndpoint, config.kgCoreApiVersion)
      .map {
        case Right(value) => Right(value)
        case Left(res)    => Left(APIEditorError(res.status, res.body))
      }

  def retrieveClientToken(): Task[Either[APIEditorError, String]] = {
    val clientTokenEndpoint =
      authAPIServiceLive.getClientTokenEndpoint(wSClient, config.kgCoreEndpoint, config.kgCoreApiVersion)
    clientTokenEndpoint.flatMap {
      case Right(endpoint) =>
        val res = (endpoint \ "data").as[Map[String, String]]
        authAPIServiceLive
          .getClientToken(wSClient, res.getOrElse("endpoint", ""), config.clientSecret)
          .map {
            case Right(value) =>
              log.info("Setting token in cache")
              val token = (value \ "access_token").as[String]
              val expiration = (value \ "expires_in").as[Long]
              serviceTokenCache.set("clientToken", token, FiniteDuration(expiration, "sec"))
              Right(token)
            case Left(res) =>
              log.error(res.body)
              Left(APIEditorError(res.status, res.body))
          }
      case Left(res) =>
        log.error(res.body)
        Task.pure(Left(APIEditorError(res.status, res.body)))
    }
  }

  def getClientToken(forceRefresh: Boolean = false): Task[Either[APIEditorError, String]] =
    if (forceRefresh) {
      clearCache(serviceTokenCache)
      retrieveClientToken()
    } else {
      get[String](serviceTokenCache, "clientToken").flatMap {
        case None      => retrieveClientToken()
        case Some(res) => Task.pure(Right(res))
      }
    }

}
