package controllers

import javax.inject.Inject
import models.errors.APIEditorError
import play.api.Logger
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.{AuthService, ConfigurationService}
import services.specification.FormService
import play.api.mvc._

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

  def getLogin(redirect_uri: String): Action[AnyContent] = Action.async { implicit request =>
    authService
      .getLogin(redirect_uri)
      .map {
        case Left(err)    => err.toResult
        case Right(value) =>
          val location = value.header("Location")
          location match {
            case Some(value) =>
              Redirect(value, TEMPORARY_REDIRECT)
            case None => APIEditorError(INTERNAL_SERVER_ERROR, "No redirect").toResult
          }
      }
      .runToFuture
  }

}
