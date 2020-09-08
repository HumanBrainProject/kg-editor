package services

import models.AccessToken
import monix.eval.Task
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.http.Status.{CREATED, NO_CONTENT, OK}
import play.api.libs.json.JsArray
import play.api.libs.ws.{WSClient, WSResponse}

trait ScopeAPIService {

  def getScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsArray]]

  def addUserToScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    user: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]]

  def removeUserOfScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    user: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]]
}

class ScopeAPIServiceLive extends ScopeAPIService {

  def getScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, JsArray]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/scopes/${id}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsArray])
        case _ => Left(res)
      }
    }
  }

  def addUserToScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    user: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/scopes/${id}/${user}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.put(""))
    r.map { res =>
      res.status match {
        case OK | CREATED => Right(())
        case _            => Left(res)
      }
    }
  }

  def removeUserOfScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    user: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/scopes/${id}/${user}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> clientToken)
    val r = Task.deferFuture(q.delete())
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(res)
      }
    }
  }
}
