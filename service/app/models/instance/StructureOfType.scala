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

final case class StructureOfType(
  fieldType: String,
  labelField: String,
  label: String,
  color: String,
  promotedFields: Option[List[String]],
  fields: Map[String, StructureOfField]
)

object StructureOfType {

  import models.instance.StructureOfField._

  implicit val structureOfTypeReads: Reads[StructureOfType] = (
    (JsPath \ "type").read[String] and
    (JsPath \ "labelField").read[String] and
    (JsPath \ "label").read[String] and
    (JsPath \ "color").read[String] and
    (JsPath \ "promotedFields").readNullable[List[String]] and
    (JsPath \ "fields").read[List[StructureOfField]].map(t => t.map(f => f.fullyQualifiedName -> f).toMap)
  )(StructureOfType.apply _)
}
