package models

sealed trait AccessToken {
  val token: String
}

final case class BasicAccessToken(override val token: String) extends AccessToken
