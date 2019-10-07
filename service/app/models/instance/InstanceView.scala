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

final case class InstanceView(
  id: String,
  workspace: String,
  `type`: List[String],
  typeLabels: Option[List[String]],
  typeColors: Option[List[String]],
  promotedFields: Option[List[String]],
  name: Option[String],
  fields: Map[String, Field]
) extends Instance

object InstanceView {

  def apply(data: JsObject, typeInfoMap: Map[String, StructureOfType]): Option[InstanceView] = {
    val res = for {
      id    <- InstanceHelper.getId(data)
      types <- InstanceHelper.getTypes(data)
    } yield (id, types)
    res match {
      case Some((instanceId, instanceTypes)) =>
        val structure = StructureOfInstance(instanceTypes, typeInfoMap)
        Some(
          InstanceView(
            instanceId,
            "minds", //TODO: replace by real workspace
            structure.typeName,
            InstanceHelper.toOptionalList(structure.typeLabel),
            InstanceHelper.toOptionalList(structure.typeColor),
            InstanceHelper.toOptionalList(structure.promotedFields),
            InstanceHelper.getName(data, structure.labelField.headOption),
            InstanceHelper.getFields(data, structure.fields)
          )
        )
      case _ => None
    }
  }

  implicit val instanceViewWrites = Json.writes[InstanceView]
}
