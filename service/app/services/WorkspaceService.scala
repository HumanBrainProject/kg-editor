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

import com.google.inject.Inject
import models.{AccessToken}
import models.errors.APIEditorError
import monix.eval.Task
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient

trait WorkspaceService {

  def retrieveTypesListByName(
    types: List[String],
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]]

  def retrieveWorkspaceTypes(
    workspace: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]]

  def retrieveWorkspaces(token: AccessToken, clientToken: String): Task[Either[APIEditorError, JsObject]]

}

class WorkspaceServiceLive @Inject()(
  wSClient: WSClient,
  configuration: ConfigurationServiceLive,
  workspaceAPIServiceLive: WorkspaceAPIServiceLive
) extends WorkspaceService {

  def retrieveTypesListByName(
    types: List[String],
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    workspaceAPIServiceLive
      .getTypesByName(wSClient, configuration.kgCoreEndpoint, configuration.kgCoreApiVersion, token, types, clientToken)
      .map {
        case Right(value) => Right(value)
        case Left(res)    => Left(APIEditorError(res.status, res.body))
      }

  def retrieveWorkspaceTypes(
    workspace: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    workspaceAPIServiceLive
      .getWorkspaceTypes(
        wSClient,
        configuration.kgCoreEndpoint,
        configuration.kgCoreApiVersion,
        workspace,
        token,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }

  def retrieveWorkspaces(token: AccessToken, clientToken: String): Task[Either[APIEditorError, JsObject]] = {
    val result = workspaceAPIServiceLive
      .getWorkspaces(wSClient, configuration.kgCoreEndpoint, configuration.kgCoreApiVersion, token, clientToken)
    result.map {
      case Right(ref) => Right(ref)
      case Left(res)  => Left(APIEditorError(res.status, res.body))
    }
  }

}
