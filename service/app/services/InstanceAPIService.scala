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

import models.AccessToken
import models.errors.APIEditorError
import monix.eval.Task
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.http.Status.{CREATED, NO_CONTENT, OK}
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

trait InstanceAPIService {
  val instanceEndpoint = "/api/instances"
  val internalInstanceEndpoint = "/internal/api/instances"

  def getInstances(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    instanceIds: List[String],
    stage: String,
    metadata: Boolean,
    returnAlternatives: Boolean,
    returnPermissions: Boolean,
    returnEmbedded: Boolean,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val payload = Json.toJson(instanceIds)
    val q = wsClient
      .url(s"${apiBaseEndpoint}/$apiVersion/instancesByIds")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters(
        "stage"              -> stage,
        "metadata"           -> metadata.toString,
        "returnAlternatives" -> returnAlternatives.toString,
        "returnPermissions"  -> returnPermissions.toString,
        "returnEmbedded"     -> returnEmbedded.toString
      )
    val r = Task.deferFuture(q.post(payload))
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def searchInstances(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    from: Option[Int],
    size: Option[Int],
    typeId: String,
    searchByLabel: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wsClient
      .url(s"$apiBaseEndpoint/$apiVersion/instances")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters(
        "stage"             -> "IN_PROGRESS",
        "returnPermissions" -> "true",
        "type"              -> typeId,
        "searchByLabel"     -> searchByLabel
      )
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getInstancesByType(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    typeOfInstance: String,
    metadata: Boolean,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wsClient
      .url(s"$apiBaseEndpoint/$apiVersion/instances")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("type" -> typeOfInstance, "metadata" -> metadata.toString, "stage" -> "IN_PROGRESS")
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getGraph(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String,
    clientExtensionId: Option[String] = None
  ): Task[Either[WSResponse, JsObject]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint/instances/$id/graph") // TODO: Not implemented in kg-core
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("stage" -> "IN_PROGRESS")
      .addQueryStringParameters(params)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def postSuggestions(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    id: String,
    field: String,
    `type`: Option[String],
    start: Int,
    size: Int,
    search: String,
    payload: JsObject,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val wsc = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/extra/instances/$id/suggestedLinksForProperty")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters(
        "property" -> field,
        "from"     -> start.toString,
        "size"     -> size.toString,
        "search"   -> search,
        "stage"    -> "IN_PROGRESS"
      )
    val q = `type` match {
      case Some(t) => wsc.addQueryStringParameters("type" -> t)
      case _       => wsc
    }
    val r = Task.deferFuture(q.post(payload))
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    id: String,
    token: AccessToken,
    metadata: Boolean,
    returnPermissions: Boolean,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/instances/$id")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters(
        "stage"             -> "IN_PROGRESS",
        "metadata"          -> metadata.toString,
        "returnPermissions" -> returnPermissions.toString
      )
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def deleteInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/instances/$id")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.delete())
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(APIEditorError(res.status, res.body))
      }
    }
  }

  def patchInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    id: String,
    body: JsObject,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/instances/$id")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("returnAlternatives" -> true.toString)
    val r = Task.deferFuture(q.patch(body))
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def postInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    id: Option[String],
    workspace: String,
    body: JsObject,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val idRes = id.getOrElse("")
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/instances/$idRes")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("space" -> workspace)
    val r = Task.deferFuture(q.post(body))
    r.map { res =>
      res.status match {
        case OK | CREATED => Right(res.json.as[JsObject])
        case _            => Left(res)
      }
    }
  }

}
