/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

package models

import com.google.inject.Inject
import helpers.OIDCHelper
import monix.eval.Task
import monix.execution.Scheduler
import play.api.mvc.Results._
import play.api.mvc._
import services.IDMAPIService

import scala.concurrent.{ExecutionContext, Future}

/**
  * Cobbled this together from:
  * https://www.playframework.com/documentation/2.6.x/ScalaActionsComposition#Authentication
  */
class AuthenticatedUserAction @Inject()(val parser: BodyParsers.Default, authprovider: IDMAPIService)(
  implicit val executionContext: ExecutionContext
) extends ActionBuilder[UserRequest, AnyContent] {
  implicit val scheduler: Scheduler = monix.execution.Scheduler.Implicits.global

  /**
    * This action helps us identify a user. If the user is not logged in a 401 is returned
    * @param request The current request
    * @param block The play action the user wants to perform
    * @tparam A  The type of the request (AnyContent)
    * @return The play action with the user info or Unauthorized
    */
  override def invokeBlock[A](request: Request[A], block: (UserRequest[A]) => Future[Result]): Future[Result] = {
    val token = OIDCHelper.getTokenFromRequest[A](request)
    authprovider
      .getUserInfo(token)
      .flatMap { user =>
        if (user.isDefined) {
          Task.deferFuture(block(new UserRequest(user.get, request, token)))
        } else {
          Task.pure(Unauthorized("You must be logged in to execute this request"))
        }
      }
      .runToFuture
  }

}
