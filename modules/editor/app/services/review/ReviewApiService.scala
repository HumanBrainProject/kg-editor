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
package services.review

import constants.{EditorClient, ServiceClient, SuggestionClient, SuggestionStatus}
import models.errors.APIEditorError
import models.instance.{NexusInstanceReference, SuggestionInstance}
import models.user.{EditorUser, User}
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.http.Status.{CREATED, OK}
import play.api.libs.ws.{EmptyBody, WSClient}
import services.review.ReviewService.UserID

import scala.concurrent.{ExecutionContext, Future}

trait ReviewApiService {

  def addUserToSuggestionInstance(
    WSClient: WSClient,
    baseUrl: String,
    nexusInstanceRef: NexusInstanceReference,
    userID: UserID,
    token: String,
    currentUser: EditorUser,
    serviceClient: ServiceClient = SuggestionClient
  )(implicit executionContext: ExecutionContext): Future[Either[APIEditorError, Unit]] = {
    WSClient
      .url(s"$baseUrl/api/suggestion/${nexusInstanceRef.toString()}/instance/$userID")
      .addHttpHeaders(AUTHORIZATION -> token)
      .addHttpHeaders("client" -> serviceClient.client)
      .addQueryStringParameters("clientIdExtension" -> currentUser.nexusUser.id)
      .post(EmptyBody)
      .map { res =>
        res.status match {
          case CREATED | OK => Right(())
          case _ =>
            Left(
              APIEditorError(
                (res.json \ "status").asOpt[Int].getOrElse(res.status),
                (res.json \ "message").asOpt[String].getOrElse("")
              )
            )
        }
      }
  }

  def acceptSuggestion(
    WSClient: WSClient,
    baseUrl: String,
    nexusInstanceReference: NexusInstanceReference,
    token: String,
    serviceClient: ServiceClient = SuggestionClient
  )(implicit executionContext: ExecutionContext): Future[Either[APIEditorError, Unit]] = {
    WSClient
      .url(s"$baseUrl/api/suggestion/${nexusInstanceReference.toString()}/accept")
      .addHttpHeaders(AUTHORIZATION -> token)
      .addHttpHeaders("client" -> serviceClient.client)
      .post(EmptyBody)
      .map { res =>
        res.status match {
          case CREATED => Right(())
          case _ =>
            Left(
              APIEditorError(
                (res.json \ "status").asOpt[Int].getOrElse(res.status),
                (res.json \ "message").asOpt[String].getOrElse("")
              )
            )
        }
      }
  }

  def rejectSuggestion(
    WSClient: WSClient,
    baseUrl: String,
    nexusInstanceReference: NexusInstanceReference,
    token: String,
    serviceClient: ServiceClient = SuggestionClient
  )(implicit executionContext: ExecutionContext): Future[Either[APIEditorError, Unit]] = {
    WSClient
      .url(s"$baseUrl/api/suggestion/${nexusInstanceReference.toString()}/reject")
      .addHttpHeaders(AUTHORIZATION -> token)
      .addHttpHeaders("client" -> serviceClient.client)
      .post(EmptyBody)
      .map { res =>
        res.status match {
          case OK => Right(())
          case _ =>
            Left(
              APIEditorError(
                (res.json \ "status").asOpt[Int].getOrElse(res.status),
                (res.json \ "message").asOpt[String].getOrElse("")
              )
            )
        }
      }
  }

  def getUsersSuggestions(
    WSClient: WSClient,
    baseUrl: String,
    suggestionStatus: SuggestionStatus,
    token: String,
    serviceClient: ServiceClient = SuggestionClient
  )(
    implicit executionContext: ExecutionContext
  ): Future[Either[APIEditorError, List[SuggestionInstance]]] = {
    WSClient
      .url(s"$baseUrl/api/suggestion/user")
      .addQueryStringParameters("status" -> suggestionStatus.status)
      .addHttpHeaders(AUTHORIZATION -> token)
      .addHttpHeaders("client" -> serviceClient.client)
      .get()
      .map { res =>
        res.status match {
          case OK => Right(res.json.as[List[SuggestionInstance]])
          case _ =>
            Left(
              APIEditorError(
                (res.json \ "status").asOpt[Int].getOrElse(res.status),
                (res.json \ "message").asOpt[String].getOrElse("")
              )
            )
        }
      }
  }

  def getInstanceSuggestions(
    WSClient: WSClient,
    baseUrl: String,
    ref: NexusInstanceReference,
    token: String,
    serviceClient: ServiceClient = SuggestionClient
  )(
    implicit executionContext: ExecutionContext
  ): Future[Either[APIEditorError, List[SuggestionInstance]]] = {
    WSClient
      .url(s"$baseUrl/api/suggestion/${ref.toString}/instances")
      .addHttpHeaders(AUTHORIZATION -> token)
      .addHttpHeaders("client" -> serviceClient.client)
      .get()
      .map { res =>
        res.status match {
          case OK => Right(res.json.as[List[SuggestionInstance]])
          case _ =>
            Left(
              APIEditorError(
                (res.json \ "status").asOpt[Int].getOrElse(res.status),
                (res.json \ "message").asOpt[String].getOrElse("")
              )
            )
        }
      }
  }
}