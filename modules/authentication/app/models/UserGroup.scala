/*
 *   Copyright (c) 2019, EPFL/Human Brain Project PCO
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
package models

import play.api.libs.json.{JsValue, Json}

case class UserGroup(name: String, displaySpec: Option[Map[String, JsValue]])

object UserGroup {
  import play.api.libs.json._
  import play.api.libs.functional.syntax._
  implicit val userGroupWrites: Writes[UserGroup] = (
    (JsPath \ "name").write[String] and
    (JsPath \ "spec").writeNullable[Map[String, JsValue]]
  )(unlift(UserGroup.unapply))

}

object MindsGroupSpec {
  val group = List("curated", "public")

  val v: Map[String, JsValue] = Map(
    "order" -> Json.toJson(List("Dataset", "Person", "Project", "Species", "Sample", "Subject"))
  )
}