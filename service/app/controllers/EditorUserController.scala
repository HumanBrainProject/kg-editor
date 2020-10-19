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
import models.{user, _}
import models.user.User
import monix.eval.Task
import play.api.Logger
import play.api.libs.json.{JsArray, _}
import play.api.mvc.{AnyContent, _}
import services._
import models.workspace.Workspace

class EditorUserController @Inject()(
                                      cc: ControllerComponents,
                                      authenticatedUserAction: AuthenticatedUserAction,
                                      workspaceServiceLive: WorkspaceServiceLive,
                                      editorUserService: EditorUserService
                                    ) extends AbstractController(cc) {
  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getUserInfo(profile: JsValue): JsValue = {
    val info = profile.as[Map[String, JsValue]]
    val ids: JsArray = info.get(SchemaFieldsConstants.NATIVE_ID) match {
      case Some(id) => JsArray() :+ id
      case _ => JsArray()
    }
    val userInfo: Map[String, JsValue] = info.updated(SchemaFieldsConstants.IDENTIFIER, ids)
    Json.toJson(userInfo)
  }

  def getUserProfile(): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    editorUserService
      .getUserProfile(request.userToken)
      .flatMap{
        case Right(profile) =>
          val user: User = getUserInfo((profile \ "data").as[JsValue]).as[User]
          val res = for {
            userWorkspaces <- workspaceServiceLive.retrieveWorkspaces(request.userToken, request.clientToken)
            workspaces = userWorkspaces match {
              case Right(w) => (w \ "data").asOpt[List[Workspace]]
              case _  => None
            }
            userPicture <- editorUserService.getUsersPicture(request.userToken, request.clientToken, List(user.id))
            picture = userPicture match {
              case Right(p) => p.as[Map[String,String]].get(user.id)
              case _  => None
            }
          } yield (workspaces, picture)
          res.map{r =>
            val resolvedUser = user.setWorkspaces(r._1).setPicture(r._2)
            Ok(
              Json.toJson(
                EditorResponseObject(Json.toJson(resolvedUser))
              )
            )
          }
        case Left(err) => Task.pure(err.toResult)
      }.runToFuture
  }

}
