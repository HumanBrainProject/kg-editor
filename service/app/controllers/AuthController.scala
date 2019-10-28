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

import javax.inject.Inject
import models.errors.APIEditorError
import play.api.Logger
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.{AuthService, ConfigurationService}
import services.specification.FormService

import scala.concurrent.ExecutionContext

class AuthController @Inject()(
  cc: ControllerComponents,
  authService: AuthService,
  config: ConfigurationService,
  formService: FormService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getAuthEndpoint: Action[AnyContent] = Action.async { implicit request =>
    authService.getEndpoint.map {
      case Left(err)    => err.toResult
      case Right(value) => Ok(value)
    }.runToFuture
  }

}
