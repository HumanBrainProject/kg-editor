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

final case class StructureOfInstance(
  types: Map[String, InstanceType],
  labelField: List[String],
  promotedFields: List[String],
  fields: Map[String, StructureOfField]
) {

  def add(typeInfo: StructureOfType): StructureOfInstance = {
    val pf = InstanceHelper.getPromotedFields(typeInfo.fields)
    val f = typeInfo.fields.foldLeft(fields) {
      case (map, (name, value)) => map.updated(name, value)
    }
    StructureOfInstance(
      types.updated(typeInfo.name, InstanceType(typeInfo.name, typeInfo.label, typeInfo.color)),
      (labelField ::: typeInfo.labelField).distinct,
      (promotedFields ::: pf).distinct,
      f
    )
  }

}

object StructureOfInstance {

  def apply(instanceTypes: List[String], typeInfoMap: Map[String, StructureOfType]): StructureOfInstance =
    instanceTypes
      .foldLeft(StructureOfInstance(Map(), List(), List(), Map())) {
        case (acc, typeName) =>
          typeInfoMap.get(typeName) match {
            case Some(typeInfo) => acc add typeInfo
            case _              => acc
          }
      }

}