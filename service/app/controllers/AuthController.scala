package controllers

import javax.inject.Inject
import play.api.Logger
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.{ConfigurationService, AuthService}
import services.specification.FormService

import scala.concurrent.ExecutionContext

class AuthController @Inject()(
                                cc: ControllerComponents,
                                authService: AuthService,
                                config: ConfigurationService,
                                formService: FormService,
                              )(implicit ec: ExecutionContext)
  extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getLogin(redirectUri: String): Action[AnyContent] = Action.async { implicit request =>
    authService
      .getLogin(redirectUri)
      .map {
        case Left(err)    => err.toResult
        case Right(value) => Ok(value)
      }
      .runToFuture
  }

}
