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
import models.AccessToken
import models.errors.APIEditorError
import monix.eval.Task
import play.api.libs.json.JsArray
import play.api.libs.ws.WSClient

trait ScopeService {

  def getInstanceScope(id: String, token: AccessToken): Task[Either[APIEditorError, JsArray]]

  def addUserToInstanceScope(id: String, user: String, token: AccessToken): Task[Either[APIEditorError, Unit]]

  def removeUserOfInstanceScope(id: String, user: String, token: AccessToken): Task[Either[APIEditorError, Unit]]

}

class ScopeServiceLive @Inject()(
  wSClient: WSClient,
  configuration: ConfigurationServiceLive,
  scopeAPIServiceLive: ScopeAPIServiceLive
) extends ScopeService {

  def getInstanceScope(id: String, token: AccessToken): Task[Either[APIEditorError, JsArray]] = {
    val result = scopeAPIServiceLive
      .getScope(wSClient, configuration.kgQueryEndpoint, id, token)
    result.map {
      case Right(ref) => Right(ref)
      case Left(res)  => Left(APIEditorError(res.status, res.body))
    }
  }

  def addUserToInstanceScope(id: String, user: String, token: AccessToken): Task[Either[APIEditorError, Unit]] = {
    val result = scopeAPIServiceLive
      .addUserToScope(wSClient, configuration.kgQueryEndpoint, id, user, token)
    result.map {
      case Right(()) => Right(())
      case Left(res) => Left(APIEditorError(res.status, res.body))
    }
  }

  def removeUserOfInstanceScope(id: String, user: String, token: AccessToken): Task[Either[APIEditorError, Unit]] = {
    val result = scopeAPIServiceLive
      .removeUserOfScope(wSClient, configuration.kgQueryEndpoint, id, user, token)
    result.map {
      case Right(()) => Right(())
      case Left(res) => Left(APIEditorError(res.status, res.body))
    }
  }

}
