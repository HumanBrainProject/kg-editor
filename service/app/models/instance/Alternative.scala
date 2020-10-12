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

package models.instance

import constants.EditorConstants
import helpers.DocumentId
import models.user.User
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, JsValue, Json, Reads}

final case class Alternative(value: JsValue, selected: Boolean, users: List[User])

object Alternative {

  def normalizeAlternative(alternative: Alternative, apiInstancesPrefix: String) : Alternative =
    alternative.value.asOpt[List[JsValue]] match {
      case Some(v) =>
        val list: List[JsValue] = v.map(i =>
          (i \ "@id").asOpt[String] match {
            case Some(x) => Json.obj("@id" -> DocumentId.getIdFromPath(x, apiInstancesPrefix))
            case _ => i
          })
        Alternative(Json.toJson(list), alternative.selected, alternative.users)
      case _ => alternative
    }

  implicit val alternativeReads: Reads[Alternative] = (
    (JsPath \ EditorConstants.VOCAB_VALUE).read[JsValue] and
      (JsPath \ EditorConstants.VOCAB_SELECTED).read[Boolean] and
      (JsPath \ EditorConstants.VOCAB_USER).read[List[User]]
    ) (Alternative.apply _)

  implicit val alternativeWrites = Json.writes[Alternative]
}
