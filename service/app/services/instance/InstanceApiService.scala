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

package services.instance

import constants.{EditorClient, EditorConstants, ServiceClient}
import models.errors.APIEditorError
import models.instance.{EditorInstance, NexusInstance, NexusInstanceReference}
import models.{AccessToken, BasicAccessToken, NexusPath, RefreshAccessToken}
import monix.eval.Task
import play.api.http.HeaderNames._
import play.api.http.Status._
import play.api.libs.json.{JsArray, JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}
import services.query.QueryApiParameter
import services.{AuthHttpClient, CredentialsService, TokenAuthService}

trait InstanceApiService {
  val instanceEndpoint = "/api/instances"
  val instanceReleaseEndpoint = "/api/releases"
  val internalInstanceEndpoint = "/internal/api/instances"

  def getByIdList(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    instanceIds: List[NexusInstanceReference],
    token: AccessToken,
    queryId: String,
    queryApiParameters: QueryApiParameter
  )(implicit OIDCAuthService: TokenAuthService, clientCredentials: CredentialsService): Task[WSResponse] = {

    val payload = Json.toJson(instanceIds.map(i => i.toString)).as[JsArray]
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceEndpoint/${queryId}")
      .withHttpHeaders(AUTHORIZATION -> token.token)
      .addQueryStringParameters(queryApiParameters.toParams: _*)
    token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.post(payload))
      case RefreshAccessToken(_) => AuthHttpClient.postWithRetry(q, payload)
    }
  }

  def getInstances(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    token: AccessToken,
    instanceIds: List[String],
    metadata: Boolean,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]] = {
    val payload = Json.toJson(instanceIds)
    val q = wsClient
      .url(s"${apiBaseEndpoint}/LIVE/instancesByIds")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters("metadata" -> metadata.toString)
    val r = Task.deferFuture(q.post(payload))
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
    token: AccessToken,
    typeOfInstance: String,
    metadata: Boolean,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wsClient
      .url(s"${apiBaseEndpoint}/instances")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters("type" -> typeOfInstance)
      .addQueryStringParameters("metadata" -> metadata.toString)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getInstancesByTypeList(
    wsClient: WSClient,
    apiBaseEndpoint: String,
    token: AccessToken,
    types: List[String],
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]] = {
    val payload = Json.toJson(types)
    val q = wsClient
      .url(s"$apiBaseEndpoint/LIVE/typesWithPropertiesByName")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = Task.deferFuture(q.post(payload))
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  def getReleaseStatus(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    instanceIds: List[String],
    token: AccessToken,
    releaseTreeScope: String,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, JsObject]] = {
    val payload = Json.toJson(instanceIds).as[JsArray]
    val q = wSClient
      .url(s"${apiBaseEndpoint}/releases/status")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
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

  def getScope(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstanceReference,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, JsArray]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/scopes/${nexusInstance.toString}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(params)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.get())
      case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
    }
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
    nexusInstance: NexusInstanceReference,
    user: String,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, Unit]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/scopes/${nexusInstance.toString}/${user}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(params)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.put(""))
      case RefreshAccessToken(_) => AuthHttpClient.putWithRetry(q, "")
    }
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
    nexusInstance: NexusInstanceReference,
    user: String,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, Unit]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/scopes/${nexusInstance.toString}/${user}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(params)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.delete())
      case RefreshAccessToken(_) => AuthHttpClient.deleteWithRetry(q)
    }
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(res)
      }
    }
  }

  def getGraph(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, JsObject]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint/LIVE/instances/${id}/graph")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(params)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.get())
      case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
    }
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def getRelease(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstanceReference,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, JsObject]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceReleaseEndpoint/${nexusInstance.toString}/graph")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(params)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.get())
      case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
    }
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
    instancePath: NexusPath,
    token: AccessToken,
    field: String,
    fieldType: String,
    start: Int,
    size: Int,
    search: String,
    payload: JsObject,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/api/suggestion/${instancePath}/fields")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(
        "field"  -> field,
        "type"   -> fieldType,
        "start"  -> start.toString,
        "size"   -> size.toString,
        "search" -> search
      )
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.post(payload))
      case RefreshAccessToken(_) => AuthHttpClient.postWithRetry(q, payload)
    }
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }

  }

  def isInstanceIdAvailable(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[APIEditorError, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/LIVE/instances/${id}/available")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(())
        case _ => Left(APIEditorError(res.status, res.body))
      }
    }
  }

  //TODO: Consider moving this to another service
  def getWorkspaceTypes(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    workspace: String,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/LIVE/typesWithProperties")
      .addQueryStringParameters("workspace" -> workspace)
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
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
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  ): Task[Either[WSResponse, JsObject]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/LIVE/spaces")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[JsObject])
        case _  => Left(res)
      }
    }
  }

  //TODO: Consider moving this to another service
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
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(res)
      }
    }
  }

  def get(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstanceReference,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient,
    clientExtensionId: Option[String] = None
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, NexusInstance]] = {
    val params = clientExtensionId.map("clientIdExtension" -> _).getOrElse("" -> "")
    val q = wSClient
      .url(s"$apiBaseEndpoint$internalInstanceEndpoint/${nexusInstance.toString}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters(params)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.get())
      case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
    }
    r.map { res =>
      res.status match {
        case OK =>
          Right(NexusInstance(Some(nexusInstance.id), nexusInstance.nexusPath, res.json.as[JsObject]))
        case _ => Left(res)
      }
    }
  }

  def put(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstanceReference,
    editorInstance: EditorInstance,
    token: AccessToken,
    userId: String,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$internalInstanceEndpoint/${nexusInstance.toString}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters("clientIdExtension" -> userId)

    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.put(editorInstance.nexusInstance.content))
      case RefreshAccessToken(_) => AuthHttpClient.putWithRetry(q, editorInstance.nexusInstance.content)
    }
    r.map { res =>
      res.status match {
        case OK | CREATED => Right(())
        case _            => Left(res)
      }
    }
  }

  def putReleaseInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstanceReference,
    token: AccessToken,
    //     userId: String,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceReleaseEndpoint/${nexusInstance.toString}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.put(""))
      case RefreshAccessToken(_) => AuthHttpClient.putWithRetry(q, "")
    }
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
    nexusInstance: NexusInstanceReference,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceReleaseEndpoint/${nexusInstance.toString}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.delete())
      case RefreshAccessToken(_) => AuthHttpClient.deleteWithRetry(q)
    }
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(res)
      }
    }
  }

  def delete(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstanceReference,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$instanceEndpoint/${nexusInstance.toString}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.delete())
      case RefreshAccessToken(_) => AuthHttpClient.deleteWithRetry(q)
    }
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(res)
      }
    }
  }

  def deleteEditorInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    id: String,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[APIEditorError, Unit]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint/LIVE/instances/${id}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = Task.deferFuture(q.delete())
    r.map { res =>
      res.status match {
        case OK | NO_CONTENT => Right(())
        case _               => Left(APIEditorError(res.status, res.body))
      }
    }
  }

  def post(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    nexusInstance: NexusInstance,
    user: Option[String],
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, NexusInstanceReference]] = {
    val q = wSClient
      .url(s"$apiBaseEndpoint$internalInstanceEndpoint/${nexusInstance.nexusPath.toString()}")
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
      .addQueryStringParameters("clientIdExtension" -> user.getOrElse(""))
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.post(nexusInstance.content))
      case RefreshAccessToken(_) => AuthHttpClient.postWithRetry(q, nexusInstance.content)
    }
    r.map { res =>
      res.status match {
        case OK | CREATED =>
          Right(NexusInstanceReference.fromUrl((res.json \ EditorConstants.RELATIVEURL).as[String]))
        case _ => Left(res)
      }
    }
  }

  def getLinkingInstance(
    wSClient: WSClient,
    apiBaseEndpoint: String,
    from: NexusInstanceReference,
    to: NexusInstanceReference,
    linkingInstancePath: NexusPath,
    token: AccessToken,
    serviceClient: ServiceClient = EditorClient
  )(
    implicit OIDCAuthService: TokenAuthService,
    clientCredentials: CredentialsService
  ): Task[Either[WSResponse, List[NexusInstanceReference]]] = {
    val q = wSClient
      .url(
        s"$apiBaseEndpoint$internalInstanceEndpoint/${to.toString}/links/${from.toString}/${linkingInstancePath.toString()}"
      )
      .withHttpHeaders(AUTHORIZATION -> token.token, "Client-Authorization" -> serviceClient.client)
    val r = token match {
      case BasicAccessToken(_)   => Task.deferFuture(q.get())
      case RefreshAccessToken(_) => AuthHttpClient.getWithRetry(q)
    }
    r.map { res =>
      res.status match {
        case OK => Right(res.json.as[List[NexusInstanceReference]])
        case _  => Left(res)
      }
    }
  }
}
