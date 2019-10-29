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
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

final case class StructureOfType(`type`: InstanceType, labelField: String, fields: Map[String, StructureOfField])

object StructureOfType {

  import models.instance.StructureOfField._

  val valuesToRemove = List("@id", "@type", "http://schema.org/identifier")

  implicit val structureOfTypeReads: Reads[StructureOfType] = (
    JsPath.read[InstanceType] and
    (JsPath \ EditorConstants.METAEBRAINSLABELFIELD)
      .readNullable[Map[String, String]]
      .map {
        case Some(v) => v.getOrElse("@id", "").toString
        case _       => ""
      } and
    (JsPath \ EditorConstants.METAEBRAINSPROPERTIES)
      .read[List[StructureOfField]]
      .map(
        t => t.filterNot(i => valuesToRemove.contains(i.fullyQualifiedName)).map(f => f.fullyQualifiedName -> f).toMap
      )
  )(StructureOfType.apply _)
}
