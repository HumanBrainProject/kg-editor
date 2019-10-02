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
  id: Option[String],
  typeNames: List[String],
  typeLabels: Option[List[String]],
  typeColors: Option[List[String]],
  name: Option[String],
  fields: Map[String, Field]
) extends Instance

object InstanceSummaryView {

  implicit val fieldWriter = Field.fieldWrites

  def apply(
    data: JsObject,
    instanceTypes: List[String],
    typeInfoMap: Map[String, StructureOfType]
  ): InstanceSummaryView = {
    val structure = StructureOfInstance(instanceTypes, typeInfoMap)
    val filteredPromotedFieldsList = InstanceHelper.filterFieldNames(structure.promotedFields, structure.labelField)
    val filteredFields = InstanceHelper.filterStructureOfFields(structure.fields, filteredPromotedFieldsList)
    InstanceSummaryView(
      InstanceHelper.getId(data),
      structure.typeName,
      InstanceHelper.toOptionalList(structure.typeLabel),
      InstanceHelper.toOptionalList(structure.typeColor),
      InstanceHelper.getName(data, structure.labelField.headOption),
      InstanceHelper.getFields(data, filteredFields)
    )
  }

  implicit val instanceSummaryViewWrites: Writes[InstanceSummaryView] = new Writes[InstanceSummaryView] {

    def writes(v: InstanceSummaryView): JsValue =
      Json.obj(
        "id"         -> Json.toJson(v.id),
        "type"       -> Json.toJson(v.typeNames),
        "typeLabels" -> Json.toJson(v.typeLabels),
        "typeColors" -> Json.toJson(v.typeColors),
        "name"       -> Json.toJson(v.name),
        "fields"     -> Json.toJson(v.fields)
      )
  }
}
