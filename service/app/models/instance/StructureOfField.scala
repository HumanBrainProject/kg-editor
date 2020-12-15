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

import constants.{EditorConstants, SchemaFieldsConstants}
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json._

final case class StructureOfField(
  fullyQualifiedName: String,
  name: Option[String],
  label: Option[String],
  labelTooltip: Option[String],
  markdown: Option[Boolean],
  allowCustomValues: Option[Boolean],
  numOfOccurrences: Option[Int],
  widget: Option[String],
  searchable: Option[Boolean],
  fields: Option[List[StructureOfField]],
  order: Option[Int]
)

object StructureOfField {

  implicit val structureOfFieldReads: Reads[StructureOfField] = (
    (JsPath \ SchemaFieldsConstants.IDENTIFIER).read[String] and
    (JsPath \ SchemaFieldsConstants.NAME).readNullable[String] and
    (JsPath \ SchemaFieldsConstants.NAME).readNullable[String].map {
      case Some(v) => Some(v.capitalize)
      case _       => None
    } and
    (JsPath \ EditorConstants.VOCAB_LABEL_TOOLTIP).readNullable[String] and
    (JsPath \ "markdown").readNullable[Boolean] and
    (JsPath \ "allowCustomValues").readNullable[Boolean] and
    (JsPath \ EditorConstants.VOCAB_OCCURRENCES).readNullable[Int] and
    (JsPath \ EditorConstants.VOCAB_WIDGET)
      .readNullable[String] and //TODO: Create internal mapping and generate the widget type when one is not provided
    (JsPath \ EditorConstants.VOCAB_SEARCHABLE).readNullable[Boolean] and
    (JsPath \ EditorConstants.VOCAB_EMBEDDED_PROPERTIES)
      .lazyReadNullable(Reads.list[StructureOfField](structureOfFieldReads)) and
      (JsPath \ EditorConstants.VOCAB_ORDER).readNullable[Int]
  )(StructureOfField.apply _)

  implicit val structureOfFieldWrites = Json.writes[StructureOfField]
}
