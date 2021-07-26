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
import models.user.{Group, IDMUser, WikiUser}
import models.{AccessToken, BasicAccessToken, Pagination, RefreshAccessToken}
import monix.eval.Task
import org.slf4j.LoggerFactory
import play.api.cache.{AsyncCacheApi, NamedCache}
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.http.Status._
import play.api.libs.json.{JsArray, JsValue}
import play.api.libs.ws.{WSClient, WSResponse}

class IDMAPIService @Inject()(
  WSClient: WSClient,
  config: ConfigurationService,
  @NamedCache("userinfo-cache") cache: AsyncCacheApi
)(
  implicit OIDCAuthService: TokenAuthService
) {
  private val log = LoggerFactory.getLogger(this.getClass)
  object cacheService extends CacheService

  def getUserInfoFromID(userId: String, token: AccessToken): Task[Option[WikiUser]] = {
    if (userId.isEmpty) {
      Task.pure(None)
    } else {
      val url = s"${config.wikiEndpoint}/users/$userId"
      val q = WSClient.url(url).addHttpHeaders(AUTHORIZATION -> token.token)

      val queryResult = token match {
        case BasicAccessToken(_)   => Task.deferFuture(q.get())
        case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
      }

      queryResult.map { res =>
        res.status match {
          case OK => res.json.asOpt[WikiUser]
          case _ => None
        }
      }
    }
  }

  def getUserInfoFromUsername(userName: String, token: AccessToken): Task[Option[WikiUser]] = {
    if (userName.isEmpty) {
      Task.pure(None)
    } else {
      val url = s"${config.wikiEndpoint}/users/$userName"
      val q = WSClient.url(url).addHttpHeaders(AUTHORIZATION -> token.token)

      val queryResult = token match {
        case BasicAccessToken(_)   => Task.deferFuture(q.get())
        case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
      }

      queryResult.map { res =>
        res.status match {
          case OK => res.json.asOpt[WikiUser]
          case _ => None
        }
      }
    }
  }


  def getUserInfo(token: BasicAccessToken): Task[Option[IDMUser]] = {
    getUserInfoWithCache(token)
  }

  private def getUserInfoWithCache(token: BasicAccessToken): Task[Option[IDMUser]] = {
    cacheService.getOrElse[IDMUser](cache, token.token) {
      getUserInfoFromToken(token).map {
        case Some(userInfo) =>
          cacheService.set[IDMUser](cache, token.token, userInfo, config.cacheExpiration)
          Some(userInfo)
        case _ =>
          None
      }
    }
  }

  private def getUserInfoFromToken(token: BasicAccessToken): Task[Option[IDMUser]] = {
    val userRequest = WSClient.url(s"${config.iamEndpoint}/v0/oauth2/userinfo").addHttpHeaders(AUTHORIZATION -> token.token)
    Task.deferFuture(userRequest.get()).flatMap { res =>
      res.status match {
        case OK =>
          Task.pure(res.json.asOpt[IDMUser])
        case _ =>
          log.error(s"Could not fetch user - ${res.body}")
          Task.pure(None)
      }
    }
  }

  def getUsers(
    searchTerm: String,
    token: AccessToken
  ): Task[Either[WSResponse, (List[WikiUser], Pagination)]] = {
    val url = s"${config.wikiEndpoint}/users"
    if (searchTerm.nonEmpty) {
      Task
        .deferFuture {
          WSClient
            .url(url)
            .addHttpHeaders(AUTHORIZATION -> token.token)
            .addQueryStringParameters(
              "search"      -> searchTerm
            )
            .get()
        }
        .flatMap { res =>
          res.status match {
            case OK =>
              val users = res.json.as[List[WikiUser]]
              Task.pure(Right((users, Pagination(users.size, users.size, 1, 0))))
            case _ => Task.pure(Left(res))
          }
        }
    } else {
      Task.pure(Right((List(), Pagination.empty)))
    }
  }

}
