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
import models.user.User
import play.api.Logger
import play.api.libs.json.{JsArray, _}
import play.api.mvc.{AnyContent, _}
import services._

class EditorUserController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  workspaceServiceLive: WorkspaceServiceLive,
  editorUserService: EditorUserService
) extends AbstractController(cc) {
  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getUserInfo(profile: JsValue, workspaces: Option[JsValue]): JsValue = {
    val info = profile.as[Map[String, JsValue]]
    val ids: JsArray = info.get(SchemaFieldsConstants.NATIVE_ID) match {
      case Some(id) => JsArray() :+ id
      case _ => JsArray()
    }
    val userInfo: Map[String, JsValue] = info
      .updated(SchemaFieldsConstants.IDENTIFIER, ids)
    val user = workspaces match {
      case Some(w) => userInfo.updated(EditorConstants.VOCAB_WORKSPACES, w)
      case _ => userInfo
    }
    Json.toJson(user)
  }

  def getUserProfile(): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val res = for {
      userProfile    <- editorUserService.getUserProfile(request.userToken)
      userWorkspaces <- workspaceServiceLive.retrieveWorkspaces(request.userToken, request.clientToken)
    } yield (userProfile, userWorkspaces)
    val result = res.map {
      case (Right(profile), Right(workspaces)) =>
        val userInfo: JsValue = getUserInfo((profile \ "data").as[JsValue], Some((workspaces \ "data").as[JsValue]))
        val user = userInfo.as[User]
        Ok(Json.toJson(EditorResponseObject(Json.toJson(user))))
      case (Right(profile), _) =>
        val userInfo: JsValue = getUserInfo((profile \ "data").as[JsValue], None)
        val user = userInfo.as[User]
        Ok(Json.toJson(EditorResponseObject(Json.toJson(user))))
      case (Left(err), _)   => err.toResult
    }
    result.runToFuture
  }

}
