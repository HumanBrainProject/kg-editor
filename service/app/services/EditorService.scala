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

import com.google.inject.Inject
import models.AccessToken
import models.errors.APIEditorError
import monix.eval.Task
import play.api.Logger
import play.api.libs.json.{JsObject, JsValue}
import play.api.libs.ws.WSClient

class EditorService @Inject()(wSClient: WSClient, configuration: ConfigurationServiceLive) {

  val logger = Logger(this.getClass)

  object instanceAPIService extends InstanceAPIService

  def getInstance(
                   id: String,
                   token: AccessToken,
                   clientToken: String
                 ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .getInstance(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        id,
        token,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def getInstanceScope(
                        id: String,
                        token: AccessToken,
                        clientToken: String
                      ): Task[Either[APIEditorError, JsObject]] = {
    instanceAPIService
      .getInstanceScope(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        id,
        token,
        clientToken
      )
      .map {
        case Right(res) => Right(res)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }
  }

  def retrieveInstanceNeighbors(
                             id: String,
                             token: AccessToken,
                             clientToken: String
                           ): Task[Either[APIEditorError, JsObject]] = {
    val result = instanceAPIService
      .getNeighbors(wSClient, configuration.kgCoreEndpoint, configuration.kgCoreApiVersion, id, token, clientToken)
    result.map {
      case Right(ref) => Right(ref)
      case Left(res) => Left(APIEditorError(res.status, res.body))
    }
  }

  def doSearchInstances(
                         typeId: String,
                         from: Option[Int],
                         size: Option[Int],
                         searchByLabel: String,
                         token: AccessToken,
                         clientToken: String
                       ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .searchInstances(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        from,
        size,
        typeId,
        searchByLabel,
        token,
        clientToken
      )
      .map {
        case Right(res) => Right(res)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def retrieveSuggestions(
                           id: String,
                           field: String,
                           `type`: Option[String],
                           size: Int,
                           start: Int,
                           search: String,
                           payload: JsValue,
                           token: AccessToken,
                           clientToken: String
                         ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .postSuggestions(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        token,
        id,
        field,
        `type`,
        size,
        start,
        search,
        payload,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def insertInstance(
                      id: Option[String],
                      workspace: String,
                      body: JsValue,
                      token: AccessToken,
                      clientToken: String
                    ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .postInstance(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        id,
        workspace,
        body,
        token,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def updateInstance(
                      id: String,
                      body: JsValue,
                      token: AccessToken,
                      clientToken: String
                    ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .patchInstance(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        id,
        body,
        token,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def retrieveInstances(
                         instanceIds: List[String],
                         token: AccessToken,
                         stage: String,
                         metadata: Boolean,
                         returnAlternatives: Boolean,
                         returnPermissions: Boolean,
                         returnEmbedded: Boolean,
                         clientToken: String
                       ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .getInstances(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        token,
        instanceIds,
        stage,
        metadata,
        returnAlternatives,
        returnPermissions,
        returnEmbedded,
        clientToken
      )
      .map {
        case Right(value) => Right(value)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def retrieveTypes(
                     typeOfInstance: String,
                     token: AccessToken,
                     metadata: Boolean,
                     clientToken: String
                   ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .getInstancesByType(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        token,
        typeOfInstance,
        metadata,
        clientToken
      )
      .map {
        case Right(value) => Right(value)
        case Left(res) => Left(APIEditorError(res.status, res.body))
      }

  def deleteInstance(id: String, token: AccessToken, clientToken: String): Task[Either[APIEditorError, Unit]] =
    instanceAPIService.deleteInstance(
      wSClient,
      configuration.kgCoreEndpoint,
      configuration.kgCoreApiVersion,
      id,
      token,
      clientToken
    )

}
