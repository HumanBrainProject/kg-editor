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

import helpers.InstanceHelper
import play.api.libs.json.{JsObject, Json}

final case class InstanceLabelView(
  id: Option[String],
  `type`: List[String],
  typeLabels: Option[List[String]],
  typeColors: Option[List[String]],
  name: Option[String]
) extends Instance

object InstanceLabelView {

  def apply(
    data: JsObject,
    instanceTypes: List[String],
    typeInfoMap: Map[String, StructureOfType]
  ): InstanceLabelView = {
    val structure = StructureOfInstance(instanceTypes, typeInfoMap)
    InstanceLabelView(
      InstanceHelper.getId(data),
      structure.typeName,
      InstanceHelper.toOptionalList(structure.typeLabel),
      InstanceHelper.toOptionalList(structure.typeColor),
      InstanceHelper.getName(data, structure.labelField.headOption)
    )
  }
  implicit val instanceLabelViewWrites = Json.writes[InstanceLabelView]
}
