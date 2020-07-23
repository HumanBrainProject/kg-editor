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

import constants.{EditorClient, ServiceClient}
import models.{AccessToken}
import monix.eval.Task
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.http.Status.OK
import play.api.libs.json.{JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

trait WorkspaceAPIService {

  def getTypesByName(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    types: List[String],
    clientToken: String
  ): Task[Either[WSResponse, JsObject]]

  def getWorkspaceTypes(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    workspace: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]]

  def getWorkspaces(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]]
}

class WorkspaceAPIServiceLive extends WorkspaceAPIService {

  def getTypesByName(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    types: List[String],
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val payload = Json.toJson(types)
    val q = wsClient
      .url(s"$apiBaseEndpoint/$apiVersion/typesByName")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("stage" -> "IN_PROGRESS", "withProperties" -> "true")
    val r = Task.deferFuture(q.post(payload))
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getWorkspaceTypes(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    workspace: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/types")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("workspace" -> workspace, "stage" -> "IN_PROGRESS", "withProperties" -> "true")
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def getWorkspaces(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    apiVersion: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/$apiVersion/spaces")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
      .addQueryStringParameters("stage" -> "IN_PROGRESS")
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

}
