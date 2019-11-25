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
package services.query

import models.errors.APIEditorError
import models.instance.NexusInstanceReference
import models.specification.QuerySpec
import models.{AccessToken, BasicAccessToken, NexusPath}
import monix.eval.Task
import play.api.http.ContentTypes._
import play.api.http.HeaderNames._
import play.api.http.Status.{NO_CONTENT, OK}
import play.api.libs.json.{JsArray, JsObject}
import play.api.libs.ws.{WSClient, WSResponse}
import services.CredentialsService

import scala.concurrent.ExecutionContext

trait QueryService {

  def delete(
    wSClient: WSClient,
    apiEndpoint: String,
    instancePath: NexusPath,
    queryId: String,
    token: AccessToken
  ): Task[Either[APIEditorError, Unit]] = {
    val q = wSClient
      .url(s"$apiEndpoint/query/${instancePath.toString}/${queryId}")
      .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
    val r = Task.deferFuture(q.delete())
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(APIEditorError(res.status, res.body))
      }
    }
  }

  def putQuery(
    wSClient: WSClient,
    apiEndpoint: String,
    instancePath: NexusPath,
    queryId: String,
    payload: JsObject,
    token: AccessToken
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiEndpoint/query/${instancePath.toString}/${queryId}")
      .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
    val r = Task.deferFuture(q.put(payload))
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(res)
      }
    }
  }

  def postQuery(
    wSClient: WSClient,
    apiEndpoint: String,
    instancePath: NexusPath,
    vocab: Option[String] = None,
    size: Int,
    start: Int,
    databaseScope: Option[String] = None,
    payload: JsObject,
    token: AccessToken
  ): Task[Either[WSResponse, JsObject]] = {
    val v = vocab.map("vocab"                       -> _).getOrElse("" -> "")
    val dbScope = databaseScope.map("databaseScope" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiEndpoint/query/${instancePath}/instances")
      .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
      .addQueryStringParameters(v, "size" -> size.toString, "start" -> start.toString, dbScope)
    val r = Task.deferFuture(q.post(payload))
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def getQuery(wSClient: WSClient, apiEndpoint: String, token: AccessToken): Task[Either[WSResponse, JsArray]] = {
    val q = wSClient
      .url(s"$apiEndpoint/query")
      .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsArray])
        case _ => Left(res)
      }
    }
  }

  def getInstancesWithId(
    wSClient: WSClient,
    apiEndpoint: String,
    nexusInstanceReference: NexusInstanceReference,
    query: QuerySpec,
    token: AccessToken,
    queryApiParameters: QueryApiParameter
  ): Task[WSResponse] =
    query match {
      case QuerySpec(_, Some(queryId)) =>
        val q = wSClient
          .url(
            s"$apiEndpoint/query/${nexusInstanceReference.nexusPath.toString()}/$queryId/instances/${nexusInstanceReference.id}"
          )
          .addQueryStringParameters(queryApiParameters.toParams: _*)
          .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
        Task.deferFuture(q.get())
      case QuerySpec(payload, None) =>
        val q = wSClient
          .url(
            s"$apiEndpoint/query/${nexusInstanceReference.nexusPath.toString()}/instances/${nexusInstanceReference.id}"
          )
          .addQueryStringParameters(queryApiParameters.toParams: _*)
          .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
        Task.deferFuture(q.post(payload))
    }

  def getInstances(
    wSClient: WSClient,
    apiEndpoint: String,
    nexusPath: NexusPath,
    query: QuerySpec,
    token: AccessToken,
    queryApiParameters: QueryApiParameter,
    parameters: Map[String, String] = Map()
  ): Task[WSResponse] =
    query match {
      case QuerySpec(_, Some(queryId)) =>
        val q = wSClient
          .url(s"$apiEndpoint/query/${nexusPath.toString()}/$queryId/instances")
          .addQueryStringParameters(parameters ++: queryApiParameters.toParams: _*)
          .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
        Task.deferFuture(q.get())
      case QuerySpec(payload, None) =>
        val q = wSClient
          .url(s"$apiEndpoint/query/${nexusPath.toString()}/instances")
          .addQueryStringParameters(parameters ++: queryApiParameters.toParams: _*)
          .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
        Task.deferFuture(q.post(payload))
    }

  def getQueryResults(
    wSClient: WSClient,
    apiEndpoint: String,
    query: QuerySpec,
    workspace: String,
    token: AccessToken,
    queryApiParameters: QueryApiParameter,
    parameters: Map[String, String] = Map()
  ): Task[WSResponse] =
    query match {
      case QuerySpec(_, Some(queryId)) =>
        val q = wSClient
          .url(s"$apiEndpoint/queries/$queryId/instances")
          .addQueryStringParameters(queryApiParameters.toParams: _*) // TODO: add parameters
          .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
        Task.deferFuture(q.get())
      case QuerySpec(payload, None) =>
        val q = wSClient
          .url(s"$apiEndpoint/queries")
          .addQueryStringParameters(queryApiParameters.toParams: _*)
          .withHttpHeaders(CONTENT_TYPE -> JSON, AUTHORIZATION -> token.token)
        Task.deferFuture(q.post(payload))
    }

}
