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

import models.AccessToken
import monix.eval.Task
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.http.Status.{CREATED, NO_CONTENT, OK}
import play.api.libs.json.{JsArray, JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

trait ReleaseAPIService {
  val instanceReleaseEndpoint = "/api/releases"

  def getRelease(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]]

  def putReleaseInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]]

  def deleteRelease(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]]

  def getReleaseStatus(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    instanceIds: List[String],
    token: AccessToken,
    releaseTreeScope: String,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]]
}

class ReleaseAPIServiceLive extends ReleaseAPIService {

  def getRelease(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceReleaseEndpoint/${id}/graph")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def putReleaseInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceReleaseEndpoint/${id}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.put(""))
    r.map { res =>
      res.status match {
        case OK | CREATED => Right(())
        case _            => Left(res)
      }
    }
  }

  def deleteRelease(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceReleaseEndpoint/${id}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.delete())
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(res)
      }
    }
  }

  def getReleaseStatus(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    instanceIds: List[String],
    token: AccessToken,
    releaseTreeScope: String,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val payload = Json.toJson(instanceIds).as[JsArray]
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/releases/statusByIds")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("releaseTreeScope" -> releaseTreeScope)
    val r = Task.deferFuture(q.post(payload))
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

}
