package services

import com.google.inject.Inject
import models.errors.APIEditorError
import monix.eval.Task

import play.api.libs.ws.{WSClient, WSResponse}
import play.api.http.Status._

class AuthService @Inject()(wSClient: WSClient, config: ConfigurationService) {

  def getLogin(redirectUri: String): Task[Either[APIEditorError, WSResponse]] = {
    val q = wSClient
      .url(s"${config.kgCoreEndpoint}/users/login")
      .withFollowRedirects(false)
      .addQueryStringParameters("redirect_uri" -> redirectUri.toString)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case TEMPORARY_REDIRECT =>
          Right(res)
        case _ => Left(APIEditorError(res.status, res.body))
      }
    }
  }

}
