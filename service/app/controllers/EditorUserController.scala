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

import actions.EditorUserAction
import com.google.inject.Inject
import constants.{EditorConstants, SchemaFieldsConstants}
import models._
import models.editorUserList.BOOKMARKFOLDER
import models.errors.APIEditorError
import models.instance.NexusInstanceReference
import models.user.EditorUser
import monix.eval.Task
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AnyContent, _}
import services._
import services.bookmark.BookmarkService
import services.query.QueryService
import services.specification.FormService

import scala.concurrent.ExecutionContext

class EditorUserController @Inject()(
  cc: ControllerComponents,
  config: ConfigurationServiceLive,
  authenticatedUserAction: AuthenticatedUserAction,
  editorService: EditorService,
  workspaceServiceLive: WorkspaceServiceLive,
  editorUserService: EditorUserService,
  editorUserListService: BookmarkService,
  oIDCAuthService: TokenAuthService,
  formService: FormService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {
  val logger = Logger(this.getClass)

  object queryService extends QueryService

  implicit val s = monix.execution.Scheduler.Implicits.global

  def postCreation(editorUser: EditorUser, token: AccessToken): Task[Either[APIEditorError, EditorUser]] =
    editorUserListService.createBookmarkListFolder(editorUser, "My Bookmarks", token, BOOKMARKFOLDER).flatMap {
      case Right(_) =>
        Task.pure(Right(editorUser))
      case Left(error) =>
        logger.info(s"Deleting editor user with id : ${editorUser.user.id}")
        editorUserService.deleteUser(editorUser, token).map {
          case Left(err) => Left(err)
          case Right(()) =>
            logger.info(s"User deleted : ${editorUser.user.id}")
            Left(error)
        }
    }

  def getUserProfile(): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val res = for {
      userProfile    <- editorUserService.getUserProfile(request.userToken)
      userWorkspaces <- workspaceServiceLive.retrieveWorkspaces(request.userToken)
    } yield (userProfile, userWorkspaces)
    val result = res.map {
      case (Right(user), Right(workspace)) =>
        val workspaces =
          (workspace \ "data").as[List[Map[String, String]]].map(w => w.getOrElse(SchemaFieldsConstants.NAME, ""))
        val r = (user \ "data")
          .as[Map[String, JsValue]]
          .updated(EditorConstants.METAEBRAINSWORKSPACES, Json.toJson(workspaces))
        Ok(Json.toJson(EditorResponseObject(Json.toJson(r))))
      case (Right(user), _) => Ok(user)
      case (Left(err), _)   => err.toResult
    }
    result.runToFuture
  }

  def updateBookmarks(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    (authenticatedUserAction andThen EditorUserAction.editorUserAction(editorUserService)).async { implicit request =>
      val bookmarkIds = for {
        json       <- request.body.asJson
        arrayOfIds <- json.asOpt[List[String]]
      } yield arrayOfIds.map(NexusInstanceReference.fromUrl)
      val instanceReference = NexusInstanceReference(org, domain, schema, version, id)
      val result = bookmarkIds match {
        case Some(ids) =>
          val futList = for {
            token      <- oIDCAuthService.getTechAccessToken()
            listResult <- editorUserListService.updateBookmarks(instanceReference, ids, request.editorUser, token)
          } yield listResult

          futList.map { listResponse =>
            if (listResponse.forall(_.isRight)) {
              Created("Bookmarks updated")
            } else {
              val errors = listResponse.filter(_.isLeft).mkString("\n")
              logger.error(s"Error while updating bookmark -$errors")
              InternalServerError(s"Could not update all the bookmarks - $errors")
            }
          }

        case None => Task.pure(BadRequest("Missing body content"))
      }
      result.runToFuture
    }

  def retrieveBookmarks: Action[AnyContent] =
    (authenticatedUserAction andThen EditorUserAction.editorUserAction(editorUserService)).async { implicit request =>
      import BookmarkService.JsEither._
      val instanceList = for {
        json      <- request.body.asJson
        instances <- json.asOpt[List[String]]
      } yield instances.map(l => NexusInstanceReference.fromUrl(l))
      val result = instanceList match {
        case Some(l) =>
          oIDCAuthService.getTechAccessToken().flatMap { token =>
            editorUserListService.retrieveBookmarkLists(l, request.editorUser, token).map { res =>
              val json = res.map(el => Json.obj("id" -> el._1.toString, "bookmarkLists" -> el._2))
              Ok(Json.toJson(EditorResponseObject(Json.toJson(json))))
            }
          }
        case None => Task.pure(BadRequest("Missing body content"))
      }
      result.runToFuture
    }
}
