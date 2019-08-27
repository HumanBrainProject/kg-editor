/*
 *   Copyright (c) 2018, EPFL/Human Brain Project PCO
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
package services

import com.google.inject.{Inject, Singleton}
import play.api.Configuration

import scala.concurrent.duration.FiniteDuration

@Singleton
class ConfigurationService @Inject()(configuration: Configuration) {
  val refreshTokenFile: String = configuration.get[String]("auth.refreshTokenFile")
  val oidcEndpoint = s"${configuration.get[String]("auth.endpoint")}/oidc"
  val oidcTokenEndpoint = s"$oidcEndpoint/token"
  val cacheExpiration: FiniteDuration = configuration.get[FiniteDuration]("cache.expiration")

  val nexusEndpoint: String =
    configuration.getOptional[String]("nexus.endpoint").getOrElse("https://nexus-dev.humanbrainproject.org")
  val editorPrefix: String = configuration.getOptional[String]("nexus.editor.prefix").getOrElse("editor")

  val kgAuthEndpoint: String = configuration.getOptional[String]("kgauth.endpoint").getOrElse("http://localhost:8120")
  val kgQueryEndpoint: String = configuration.getOptional[String]("kgquery.endpoint").getOrElse("http://localhost:8600") /* KG-CORE: http://localhost:8190 */
  val iamEndpoint = configuration.get[String]("nexus.iam")
  val authEndpoint = configuration.get[String]("auth.endpoint")
  val idmApiEndpoint = s"$authEndpoint/idm/v1/api"
  val editorSubSpace = configuration.getOptional[String]("editor.subspace").getOrElse("editor")

}
