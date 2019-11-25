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

import javax.inject.{Inject, Singleton}
import models.AuthenticatedUserAction
import play.api.Logger
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.ScopeServiceLive

import scala.concurrent.ExecutionContext

@Singleton
class ScopeController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  scopeServiceLive: ScopeServiceLive
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getInstanceScope(id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      scopeServiceLive
        .getInstanceScope(id, request.userToken)
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

  def addUserToInstanceScope(id: String, user: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      scopeServiceLive
        .addUserToInstanceScope(id, user, request.userToken)
        .map {
          case Left(err) => err.toResult
          case Right(()) =>
            Ok(s"user ${user} has been added to instance ${id}' scope")
        }
        .runToFuture
    }

  def removeUserOfInstanceScope(id: String, user: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      scopeServiceLive
        .removeUserOfInstanceScope(id, user, request.userToken)
        .map {
          case Left(err) => err.toResult
          case Right(()) =>
            Ok(s"user ${user} has been removed from instance ${id}' scope")
        }
        .runToFuture
    }

}
