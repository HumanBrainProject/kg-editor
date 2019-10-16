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

import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

final case class StructureOfField(
  fullyQualifiedName: String,
  name: String,
  label: String,
  labelTooltip: Option[String],
  markdown: Option[Boolean],
  allowCustomValues: Option[Boolean],
  canBe: Option[List[String]],
  numOfOccurrences: Option[Int],
  `type`: String,
  searchable: Boolean
)

object StructureOfField {

  implicit val structureOfFieldReads: Reads[StructureOfField] = (
    (JsPath \ "fullyQualifiedName").read[String] and
    (JsPath \ "name").read[String] and
    (JsPath \ "label").read[String] and
    (JsPath \ "labelTooltip").readNullable[String] and
    (JsPath \ "markdown").readNullable[Boolean] and
    (JsPath \ "allowCustomValues").readNullable[Boolean] and
    (JsPath \ "canBe").readNullable[List[String]] and
    (JsPath \ "numOfOccurrences").readNullable[Int] and
    (JsPath \ "widget").read[String] and
    (JsPath \ "searchable").read[Boolean]
  )(StructureOfField.apply _)

  implicit val structureOfFieldWrites = Json.writes[StructureOfField]
}
