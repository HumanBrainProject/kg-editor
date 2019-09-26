package controllers

import com.google.inject.Inject
import models.AuthenticatedUserAction
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

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getBookmarks(workspace: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      bookmarkService
        .getBookmarks(workspace, request.userToken)
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

}
