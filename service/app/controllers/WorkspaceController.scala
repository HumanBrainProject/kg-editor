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

package controllers

import javax.inject.{Inject, Singleton}
import models._
import models.instance._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{Action, _}
import services._

import scala.concurrent.ExecutionContext

@Singleton
class WorkspaceController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  workspaceServiceLive: WorkspaceServiceLive
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getWorkspaceTypes(workspace: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val result = workspaceServiceLive
        .retrieveWorkspaceTypes(workspace, request.userToken)
        .map {
          case Left(err) => err.toResult
          case Right(value) =>
            val res = (value \ "data").as[List[StructureOfType]]
            Ok(Json.toJson(EditorResponseObject(Json.toJson(res))))
        }
      result.runToFuture
    }

}
