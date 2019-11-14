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

package helpers

import constants.EditorConstants
import models.UserRequest
import models.instance.Field.{Link, ListOfLinks}
import models.instance.{
  Field,
  Instance,
  InstanceLabelView,
  InstanceSummaryView,
  InstanceView,
  StructureOfField,
  StructureOfType
}
import play.api.libs.json.{JsObject, JsString, JsValue}
import play.api.mvc.AnyContent

object InstanceHelper {

  def toTypeList(list: List[JsObject]): List[String] =
    list
      .foldLeft(List[List[String]]()) {
        case (res, data) =>
          (data \ "@type").asOpt[List[String]] match {
            case Some(values) => res :+ values
            case _            => res
          }
      }
      .flatten
      .distinct

  def toOptionalList[T](list: List[T]): Option[List[T]] =
    if (list.nonEmpty) {
      Some(list)
    } else {
      None
    }

  def extractDataAsList(data: JsObject): List[JsObject] =
    (data \ "data").asOpt[List[JsObject]] match {
      case Some(list) => list
      case _          => List()
    }

  def extractPayloadAsList(request: UserRequest[AnyContent]): Option[List[String]] =
    for {
      bodyContent <- request.body.asJson
      res         <- bodyContent.asOpt[List[String]]
    } yield res

  def getTypeInfoMap(list: List[StructureOfType]): Map[String, StructureOfType] =
    list.foldLeft(Map[String, StructureOfType]()) {
      case (map, typeInfo) => map.updated(typeInfo.name, typeInfo)
    }

  def getFields(data: JsObject, fieldsInfo: Map[String, StructureOfField]): Map[String, Field] =
    fieldsInfo.foldLeft(Map[String, Field]()) {
      case (map, (fieldName, fieldInfo)) => map.updated(fieldName, Field(data, fieldInfo))
    }

  def filterFieldNames(fields: List[String], filter: List[String]): List[String] = fields.filterNot(filter.toSet)

  def filterFieldNames(fields: List[String], filter: String): List[String] = filterFieldNames(fields, List(filter))

  def filterFieldNames(fields: List[String], filter: Option[String]): List[String] =
    filter match {
      case Some(f) => filterFieldNames(fields, List(f))
      case None    => fields
    }

  def getId(data: JsObject): Option[String] =
    (data \ "@id").asOpt[String] match {
      case Some(i) => DocumentId.getIdFromPath(i)
      case None    => None
    }

  def getWorkspace(data: JsObject): String =
    (data \ EditorConstants.VOCABEBRAINSSPACES).asOpt[String] match {
      case Some(i) => i
      case None    => ""
    }

  def getTypes(data: JsObject): Option[List[String]] =
    (data \ "@type").asOpt[List[String]] match {
      case Some(types) =>
        if (types.nonEmpty) {
          Some(types)
        } else {
          None
        }
      case None => None
    }

  def getPromotedFields(fields: Map[String, StructureOfField]): List[String] =
    fields.values.foldLeft(List[String]()) {
      case (acc, field) =>
        field.searchable match {
          case Some(f) =>
            if (f) {
              acc :+ field.fullyQualifiedName
            } else {
              acc
            }
          case _ => acc
        }

    }

  def getPermissions(data: JsObject): List[String] =
    (data \ s"${EditorConstants.VOCABEBRAINSPERMISSIONS}").asOpt[List[String]] match {
      case Some(permissions) => permissions
      case None              => List()
    }

  def getAlternatives(data: JsObject): Map[String, JsValue] =
    (data \ s"${EditorConstants.VOCABEBRAINSALTERNATIVES}").asOpt[Map[String, JsValue]] match {
      case Some(alternatives) => alternatives
      case None               => Map()
    }

  def getUser(data: JsObject): Option[String] =
    (data \ s"${EditorConstants.VOCABEBRAINSUSER}").asOpt[Map[String, JsValue]] match {
      case Some(user) =>
        user.get("@id") match {
          case Some(i) => DocumentId.getIdFromPath(i.as[String])
          case None    => None
        }
      case None => None
    }

  def getName(data: JsObject, names: List[String]): String =
    names.foldLeft("") {
      case (acc, name) => {
        if (acc.isEmpty) {
          (data \ name).asOpt[String] match {
            case Some(value) => value
            case _           => acc
          }
        } else {
          acc
        }
      }
    }

  def filterStructureOfFields(
    fieldsInfo: Map[String, StructureOfField],
    filter: List[String]
  ): Map[String, StructureOfField] =
    filter.foldLeft(Map[String, StructureOfField]()) {
      case (map, name) => {
        fieldsInfo.get(name) match {
          case Some(info) => map.updated(name, info)
          case _          => map
        }
      }
    }

  def normalizeIdOfField(field: Link): Link =
    field.get("@id") match {
      case Some(id) =>
        val normalizedId = DocumentId.getIdFromPath(id.as[String])
        normalizedId match {
          case Some(id) => field.updated("id", JsString(id)).filter(value => !value._1.equals("@id"))
          case None     => field
        }
      case None => field
    }

  def normalizeIdOfArray(fieldArray: ListOfLinks): ListOfLinks =
    fieldArray.map(field => normalizeIdOfField(field))

  def getInstanceView(data: JsObject, typeInfoMap: Map[String, StructureOfType]): Option[Instance] =
    InstanceView(data, typeInfoMap)

  def getInstanceSummaryView(data: JsObject, typeInfoMap: Map[String, StructureOfType]): Option[Instance] =
    InstanceSummaryView(data, typeInfoMap)

  def getInstanceLabelView(data: JsObject, typeInfoMap: Map[String, StructureOfType]): Option[Instance] =
    InstanceLabelView(data, typeInfoMap)

  def generateInstanceListView(
    dataList: List[JsObject],
    typeInfoList: List[StructureOfType],
    generateInstanceView: (JsObject, Map[String, StructureOfType]) => Option[Instance]
  ): List[Instance] = {
    val typeInfoMap = getTypeInfoMap(typeInfoList)
    dataList.foldLeft(List[Instance]()) {
      case (instances, data) =>
        generateInstanceView(data, typeInfoMap) match {
          case Some(instance) => instances :+ instance
          case _              => instances
        }
    }
  }
}
