/*
 *   Copyright (c) 2020, EPFL/Human Brain Project PCO
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
package controllers

import mockws.MockWSHelpers
import org.scalatestplus.play._
import org.scalatestplus.play.guice._
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.test._

/**
  * Add your spec here.
  * You can mock out a whole application including requests, plugins etc.
  *
  * For more information, see https://www.playframework.com/documentation/latest/ScalaTestingWithScalaTest
  */
class OIDCControllerSpec extends PlaySpec with GuiceOneAppPerSuite with MockWSHelpers with Injecting {
  val userinfoEndpoint: String = "http://www.userinfo.com"

  override def fakeApplication() =
    GuiceApplicationBuilder()
      .configure(
        "play.http.filters" -> "play.api.http.NoHttpFilters",
        "auth.userinfo"     -> userinfoEndpoint
      )
      .build()

}
