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

import constants.SchemaFieldsConstants
import play.api.libs.json.{JsPath, Json, Reads}
import play.api.libs.functional.syntax._

final case class Type(`type`: String, label: String, labelField: String, color: Option[String])

object Type {
  implicit val typeReads: Reads[Type] = (
    (JsPath \ SchemaFieldsConstants.IDENTIFIER).read[String] and
    (JsPath \ SchemaFieldsConstants.NAME).read[String] and
    (JsPath \ "https://kg.ebrains.eu/meta/labelField") //TODO: Create vocabulary
      .readNullable[Map[String, String]]
      .map {
        case Some(v) => v.getOrElse("@id", "").toString
        case _       => ""
      } and
    (JsPath \ "https://kg.ebrains.eu/meta/color").readNullable[String] // TODO: Create vocabulary
  )(Type.apply _)

  implicit val typeWrites = Json.writes[Type]
}
