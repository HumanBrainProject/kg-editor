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
package editor.services

import akka.actor.ActorSystem
import constants.EditorConstants
import helpers.ConfigMock
import helpers.ConfigMock._
import mockws.{MockWS, MockWSHelpers}
import models.BasicAccessToken
import models.instance.NexusInstanceReference
import models.user.{EditorUser, IDMUser}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatestplus.play.PlaySpec
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import play.api.Application
import play.api.cache.AsyncCacheApi
import play.api.libs.json.Json
import play.api.mvc.Results._
import play.api.test.Helpers._
import play.api.test.Injecting
import services._

import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration

class EditorUserServiceSpec
    extends PlaySpec
    with GuiceOneAppPerSuite
    with MockWSHelpers
    with MockitoSugar
    with Injecting {

  override def fakeApplication(): Application = ConfigMock.fakeApplicationConfig.build()
  implicit val scheduler = monix.execution.Scheduler.Implicits.global
  "getUser" should {
    "return an editor user" in {
      val fakeEndpoint = s"${kgQueryEndpoint}/query/"

      val id = "1"
      val idUser = "nexusUUID1"
      val nexusIdUser = s"${EditorConstants.editorUserPath.toString()}/$idUser"
      val nexusUser = new IDMUser(
        id,
        "",
        "",
        "",
        "",
        Some(""),
        None
      )
      val user = EditorUser(NexusInstanceReference.fromUrl(nexusIdUser), nexusUser)
      val endpointResponse = Json.parse(
        s"""
          |{
          |    "nexusId": "$nexusIdUser",
          |    "userId": "$id"
          |}
        """.stripMargin
      )
      implicit val ws = MockWS {
        case (GET, fakeEndpoint) =>
          Action {
            Ok(Json.obj("results" -> Json.toJson(List(endpointResponse))))
          }
      }
      val oidcService = mock[TokenAuthService]
      val clientCred = mock[CredentialsService]
      val configService = mock[ConfigurationService]
      val cache = mock[AsyncCacheApi]
      val actorSystem = mock[ActorSystem]
      when(cache.get[EditorUser](id)).thenReturn(Future(None))
      val service =
        new EditorUserService(configService, ws, cache)(
          oidcService,
          clientCred,
          actorSystem
        )

      val res = service.getUser(nexusUser, BasicAccessToken("token")).runSyncUnsafe(FiniteDuration(10, "s"))

      res.isRight mustBe true
      res mustBe Right(Some(user))
    }
    "return an error if the query fails" in {
      val fakeEndpoint = s"${kgQueryEndpoint}/query/"

      val id = "1"
      val idUser = "nexusUUID1"
      val nexusIdUser = s"${EditorConstants.editorUserPath.toString()}/$idUser"
      val nexusUser = new IDMUser(
        id,
        "",
        "",
        "",
        "",
        Some(""),
        None
      )

      implicit val ws = MockWS {
        case (GET, fakeEndpoint) =>
          Action {
            NotFound("User not found")
          }
      }
      val oidcService = mock[TokenAuthService]
      val configService = mock[ConfigurationService]
      val clientCred = mock[CredentialsService]
      val cache = mock[AsyncCacheApi]
      val actorSystem = mock[ActorSystem]
      when(cache.get[EditorUser](id)).thenReturn(Future(None))
      val service =
        new EditorUserService(configService, ws, cache)(
          oidcService,
          clientCred,
          actorSystem
        )
      val res = service.getUser(nexusUser, BasicAccessToken("token")).runSyncUnsafe(FiniteDuration(10, "s"))
      res.isLeft mustBe true
    }
  }

}
