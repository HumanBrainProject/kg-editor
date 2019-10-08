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
import play.api.libs.json.{JsObject, JsPath, JsValue, Json, Reads, Writes}

final case class InstanceSummaryView(
  id: String,
  workspace: String,
  types: List[InstanceType],
  name: Option[String],
  fields: Map[String, Field],
  permissions: Map[String, Boolean]
) extends Instance

object InstanceSummaryView {

  implicit val fieldWriter = Field.fieldWrites

  def apply(data: JsObject, typeInfoMap: Map[String, StructureOfType]): Option[InstanceSummaryView] = {
    val res = for {
      id    <- InstanceHelper.getId(data)
      types <- InstanceHelper.getTypes(data)
    } yield (id, types)
    res match {
      case Some((instanceId, instanceTypes)) =>
        val structure = StructureOfInstance(instanceTypes, typeInfoMap)
        val filteredPromotedFieldsList = InstanceHelper.filterFieldNames(structure.promotedFields, structure.labelField)
        val filteredFields = InstanceHelper.filterStructureOfFields(structure.fields, filteredPromotedFieldsList)
        Some(
          InstanceSummaryView(
            instanceId,
            InstanceHelper.getWorkspace(data),
            structure.types.values.toList,
            InstanceHelper.getName(data, structure.labelField.headOption),
            InstanceHelper.getFields(data, filteredFields),
            InstanceHelper.getPermissions(data)
          )
        )
      case _ => None
    }
  }

  implicit val instanceSummaryViewWrites = Json.writes[InstanceSummaryView]
}
