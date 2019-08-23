package services

import com.google.inject.Inject
import play.api.libs.ws.WSClient

class AuthService @Inject()(
 WSClient: WSClient,
 config: ConfigurationService
){

}