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

final case class InstanceLabelView(
  id: String,
  workspace: Option[String],
  types: List[InstanceType],
  name: String,
  error: Option[CoreDataError]
) extends Instance

object InstanceLabelView {

  def generateInstanceView(id: String, data: JsObject, typeInfoMap: Map[String, StructureOfType]): InstanceLabelView = {
    val res = for {
      resolvedId <- InstanceHelper.getId(data)
      types      <- InstanceHelper.getTypes(data)
    } yield (resolvedId, types)
    res match {
      case Some((instanceId, instanceTypes)) =>
        val structure = StructureOfInstance(instanceTypes, typeInfoMap)
        InstanceLabelView(
          instanceId,
          (data \ EditorConstants.VOCABEBRAINSSPACES).asOpt[String],
          structure.types.values.toList,
          InstanceHelper.getName(data, structure.labelField),
          None
        )
      case _ => generateInstanceError(id, CoreDataError(NOT_IMPLEMENTED, "Instance is not supported"))
    }
  }

  def generateInstanceError(id: String, error: CoreDataError): InstanceLabelView =
    InstanceLabelView(id, None, List(), "", Some(error))

  def apply(id: String, coreInstance: CoreData, typeInfoMap: Map[String, StructureOfType]): InstanceLabelView =
    coreInstance match {
      case CoreData(Some(data), None) => generateInstanceView(id, data, typeInfoMap)
      case CoreData(_, Some(error))   => generateInstanceError(id, error)
      case _                          => generateInstanceError(id, CoreDataError(NOT_IMPLEMENTED, "Instance is not supported"))
    }

  implicit val instanceLabelViewWrites = Json.writes[InstanceLabelView]
}
