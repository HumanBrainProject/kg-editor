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

import com.google.inject.Inject
import play.api.Configuration

import scala.concurrent.duration.FiniteDuration

trait ConfigurationService {
  val refreshTokenFile: String
  val oidcEndpoint: String
  val oidcTokenEndpoint: String
  val cacheExpiration: FiniteDuration

  val nexusEndpoint: String
  val editorPrefix: String

  val kgCoreEndpoint: String
  val kgCoreApiVersion: String
  val kgQueryEndpoint: String
  val iamEndpoint: String
  val authEndpoint: String
  val idmApiEndpoint: String
  val editorSubSpace: String
  val clientSecret: String
}

class ConfigurationServiceLive @Inject()(config: Configuration) extends ConfigurationService {

  val refreshTokenFile: String = config.get[String]("auth.refreshTokenFile")
  val oidcEndpoint = s"${config.get[String]("auth.endpoint")}/oidc"
  val oidcTokenEndpoint = s"$oidcEndpoint/token"
  val cacheExpiration: FiniteDuration = config.get[FiniteDuration]("cache.expiration")

  val nexusEndpoint: String =
    config.getOptional[String]("nexus.endpoint").getOrElse("https://nexus-dev.humanbrainproject.org")
  val editorPrefix: String = config.getOptional[String]("nexus.editor.prefix").getOrElse("editor")

  val kgCoreEndpoint
    : String = config.getOptional[String]("kgcore.endpoint").getOrElse("http://localhost:8000") // TODO: change the port from mock to real data
  val kgCoreApiVersion: String = config.get[String]("kgcore.apiVersion")
  val kgQueryEndpoint: String = config.getOptional[String]("kgquery.endpoint").getOrElse("http://localhost:8600")
  val iamEndpoint = config.get[String]("nexus.iam")
  val authEndpoint = config.get[String]("auth.endpoint")
  val idmApiEndpoint = s"$authEndpoint/idm/v1/api"
  val editorSubSpace = config.getOptional[String]("editor.subspace").getOrElse("editor")
  val clientSecret = config.get[String]("client.secret")
}
