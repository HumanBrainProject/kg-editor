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

package controllers

import com.google.inject.Inject
import models.AuthenticatedUserAction
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.ConfigurationServiceLive
//import services.bookmark.BookmarkServiceLive

import scala.concurrent.ExecutionContext

class BookmarkController @Inject()(
  cc: ControllerComponents,
  config: ConfigurationServiceLive,
  authenticatedUserAction: AuthenticatedUserAction
//  bookmarkServiceLive: BookmarkServiceLive,
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  implicit val s = monix.execution.Scheduler.Implicits.global

//  def getBookmarks(workspace: String): Action[AnyContent] =
//    authenticatedUserAction.async { implicit request =>
//      bookmarkServiceLive
//        .getBookmarks(workspace, request.userToken)
//        .map {
//          case Left(err)    => err.toResult
//          case Right(value) => Ok(value)
//        }
//        .runToFuture
//    }

//  def filterBookmarkInstances(
//                               bookmarkId: String,
//                               workspace: String,
//                               from: Option[Int],
//                               size: Option[Int],
//                               search: String
//                             ): Action[AnyContent] =
//    authenticatedUserAction.async { implicit request =>
//      editorService
//        .getBookmarkInstances(bookmarkId, workspace, from, size, search, request.userToken)
//        .map {
//          case Right(value) => Ok(value)
//          case Left(error)  => error.toResult
//        }
//        .runToFuture
//    }

}
