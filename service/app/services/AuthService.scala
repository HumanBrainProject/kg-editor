package services

import com.google.inject.Inject
import models.errors.APIEditorError
import monix.eval.Task
import play.api.http.Status.OK
import play.api.libs.json.JsObject
import play.api.libs.ws.WSClient

class AuthService @Inject()(
                             wSClient: WSClient,
                             config: ConfigurationService
                           ) {

  def getLogin(
                redirectUri: String
              ): Task[Either[APIEditorError, JsObject]] = {
    val q = wSClient
      .url(s"${config.kgAuthEndpoint}/login")
      .addQueryStringParameters("redirectUri" -> redirectUri.toString)
    val r = Task.deferFuture(q.get())
    r.map { res =>
      res.status match {
        case OK =>
          Right(res.json.as[JsObject])
        case _ => Left(APIEditorError(res.status, res.body))
      }
    }
  }

}