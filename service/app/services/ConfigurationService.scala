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

trait ConfigurationService {
  val kgCoreEndpoint: String
  val kgCoreApiVersion: String
  val kgApiInstancesPrefix: String
  val clientSecret: String
}

class ConfigurationServiceLive @Inject()(config: Configuration) extends ConfigurationService {
  val kgCoreEndpoint
    : String = config.getOptional[String]("kgcore.endpoint").getOrElse("http://localhost:7130")
  val kgCoreApiVersion: String = config.get[String]("kgcore.apiVersion")
  val kgApiInstancesPrefix: String = config.getOptional[String]("kgcore.apiInstancesPrefix").getOrElse("https://kg.ebrains.eu/api/instances/")
  val clientSecret: String = config.get[String]("client.secret")
}
