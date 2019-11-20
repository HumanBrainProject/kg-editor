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
import monix.eval.Task
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{Action, _}
import services._

import scala.concurrent.ExecutionContext

@Singleton
class ReleaseController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  releaseServiceLive: ReleaseServiceLive
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def postReleaseInstance(releaseTreeScope: String): Action[AnyContent] = authenticatedUserAction.async {
    implicit request =>
      val listOfIds = for {
        bodyContent <- request.body.asJson
        ids         <- bodyContent.asOpt[List[String]]
      } yield ids
      listOfIds match {
        case Some(ids) =>
          releaseServiceLive
            .retrieveReleaseStatus(ids, releaseTreeScope, request.userToken)
            .map {
              case Left(err)    => err.toResult
              case Right(value) => Ok(Json.toJson(EditorResponseObject(value)))
            }
            .runToFuture
        case None => Task.pure(BadRequest("Missing body content")).runToFuture
      }

  }

  def getInstanceRelease(id: String): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    releaseServiceLive
      .retrieveInstanceRelease(id, request.userToken)
      .map {
        case Left(err)    => err.toResult
        case Right(value) => Ok(value)
      }
      .runToFuture
  }

  def putInstanceRelease(id: String): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    releaseServiceLive
      .releaseInstance(id, request.userToken)
      .map {
        case Left(err) => err.toResult
        case Right(()) => Ok("Instance has been released")
      }
      .runToFuture
  }

  def deleteInstanceRelease(id: String): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    releaseServiceLive
      .unreleaseInstance(id, request.userToken)
      .map {
        case Left(err) => err.toResult
        case Right(()) => Ok("Instance has been unreleased")
      }
      .runToFuture
  }

}
