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
import helpers.InstanceHelper
import models.errors.CoreDataError
import play.api.http.Status.NOT_IMPLEMENTED
import play.api.libs.json.{JsObject, Json}

final case class InstanceSummaryView(
                                      id: String,
                                      workspace: Option[String],
                                      types: List[InstanceType],
                                      name: String,
                                      fields: Map[String, Field],
                                      permissions: Permissions,
                                      error: Option[CoreDataError]
) extends Instance

object InstanceSummaryView {

  implicit val fieldWriter = Field.fieldWrites

  def generateInstanceView(
    id: String,
    data: JsObject,
    typeInfoMap: Map[String, StructureOfType]
  ): InstanceSummaryView = {
    val res = for {
      resolvedId <- InstanceHelper.getId(data)
      types      <- InstanceHelper.getTypes(data)
    } yield (resolvedId, types)
    res match {
      case Some((instanceId, instanceTypes)) =>
        val structure = StructureOfInstance(instanceTypes, typeInfoMap)
        val filteredPromotedFieldsList = InstanceHelper.filterFieldNames(structure.promotedFields, structure.labelField)
        val filteredFields = InstanceHelper.filterStructureOfFields(structure.fields, filteredPromotedFieldsList)
        InstanceSummaryView(
          instanceId,
          (data \ EditorConstants.VOCAB_SPACE).asOpt[String],
          structure.types.values.toList,
          InstanceHelper.getName(data, structure.labelField),
          InstanceHelper.getFields(data, filteredFields),
          InstanceHelper.getPermissions(data),
          None
        )
      case _ => generateInstanceError(id, CoreDataError(NOT_IMPLEMENTED, "Instance is not supported"))
    }
  }

  def generateInstanceError(id: String, error: CoreDataError): InstanceSummaryView =
    InstanceSummaryView(id, None, List(), "", Map(), Permissions(None), Some(error))

  def apply(id: String, coreInstance: CoreData, typeInfoMap: Map[String, StructureOfType]): InstanceSummaryView =
    coreInstance match {
      case CoreData(Some(data), None) => generateInstanceView(id, data, typeInfoMap)
      case CoreData(_, Some(error))   => generateInstanceError(id, error)
      case _                          => generateInstanceError(id, CoreDataError(NOT_IMPLEMENTED, "Instance is not supported"))
    }

  def apply(data: JsObject, typeInfoMap: Map[String, StructureOfType]): InstanceSummaryView =
    generateInstanceView("", data, typeInfoMap)

  implicit val instanceSummaryViewWrites = Json.writes[InstanceSummaryView]
}
