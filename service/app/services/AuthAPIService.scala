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
import monix.eval.Task
import play.api.http.Status._
import play.api.libs.json.JsObject
import play.api.libs.ws.{WSClient, WSResponse}

trait AuthAPIService {

  def getEndpoint(wSClient: WSClient, apiBaseEndpoint: String): Task[Either[WSResponse, JsObject]]

  def getClientToken(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    clientSecret: String,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]]

}

class AuthAPIServiceLive extends AuthAPIService {

  def getEndpoint(wSClient: WSClient, apiBaseEndpoint: String): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/users/authorization")
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getClientToken(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    clientSecret: String,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/clients/${serviceClient.client}/token")
      .withHttpHeaders("client_secret" -> clientSecret)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

}
