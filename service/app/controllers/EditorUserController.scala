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

import com.google.inject.Inject
import constants.{EditorConstants, SchemaFieldsConstants}
import models._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AnyContent, _}
import services._

import scala.concurrent.ExecutionContext

class EditorUserController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  workspaceServiceLive: WorkspaceServiceLive,
  editorUserService: EditorUserService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {
  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getUserProfile(): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val res = for {
      userProfile    <- editorUserService.getUserProfile(request.userToken)
      userWorkspaces <- workspaceServiceLive.retrieveWorkspaces(request.userToken, request.clientToken)
    } yield (userProfile, userWorkspaces)
    val result = res.map {
      case (Right(user), Right(workspace)) =>
        val workspaces =
          (workspace \ "data").as[List[Map[String, JsValue]]].map(w => w.getOrElse(SchemaFieldsConstants.NAME, JsString("")).as[String])
        val r = (user \ "data").as[Map[String, JsValue]].updated(EditorConstants.VOCAB_WORKSPACES, Json.toJson(workspaces))
        Ok(Json.toJson(EditorResponseObject(Json.toJson(r))))
      case (Right(user), _) => Ok(user)
      case (Left(err), _)   => err.toResult
    }
    result.runToFuture
  }

}
