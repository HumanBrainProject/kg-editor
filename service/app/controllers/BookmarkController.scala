package controllers

import com.google.inject.Inject
import models.AuthenticatedUserAction
import play.api.Logger
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}
import services.bookmark.BookmarkService
import services.{ConfigurationService, TokenAuthService}
import scala.concurrent.ExecutionContext

class BookmarkController @Inject()(
  cc: ControllerComponents,
  config: ConfigurationService,
  authenticatedUserAction: AuthenticatedUserAction,
  bookmarkService: BookmarkService,
  oIDCAuthService: TokenAuthService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {
  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getBookmarks: Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      bookmarkService
        .getBookmarks(request.userToken)
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

}
