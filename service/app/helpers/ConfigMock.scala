package helpers

import play.api.inject.guice.GuiceApplicationBuilder

import scala.concurrent.duration.FiniteDuration

object ConfigMock {
  val nexusEndpoint: String = "http://www.nexus.com"
  val nexusIam = "nexus-iam.com"
  val authEndpoint = "auth.com"
  val refreshTokenFile = "/opt/tokenfolder"
  val kgCoreEndpoint = "kgcoreEndpoint"
  val kgQueryEndpoint = "kgqueryEndpoint"
  val editorSubspace = "editor"
  val cacheExpiration = FiniteDuration(10, "min")

  val fakeApplicationConfig = GuiceApplicationBuilder().configure(
    "play.http.filters"     -> "play.api.http.NoHttpFilters",
    "nexus.endpoint"        -> nexusEndpoint,
    "nexus.iam"             -> nexusIam,
    "auth.endpoint"         -> authEndpoint,
    "auth.refreshTokenFile" -> refreshTokenFile,
    "kgcore.endpoint" -> kgCoreEndpoint,
    "kgquery.endpoint" -> kgQueryEndpoint,
    "editor.subspace" -> editorSubspace,
    "cache.expiration" -> cacheExpiration.toMillis
  )
}
