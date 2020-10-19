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
import models.instance._
import models.permissions.Permissions
import play.api.libs.json.{JsObject, JsString, JsValue, _}
import play.api.mvc.AnyContent

object InstanceHelper {

  def extractTypesFromCoreInstances(coreInstances: Map[String, CoreData]): List[String] =
    coreInstances.foldLeft(List[String]()) {
      case (acc, (_, coreInstance)) =>
        coreInstance.data match {
          case Some(d) =>
            (d \ "@type").asOpt[List[String]] match {
              case Some(values) => (acc ::: values).distinct
              case _ => acc
            }
          case _ => acc
        }
    }

  def extractTypesFromCoreInstancesList(list: List[JsObject]): List[String] =
    list.foldLeft(List[String]()) {
      case (acc, data) =>
        (data \ "@type").asOpt[List[String]] match {
          case Some(values) => (acc ::: values).distinct
          case _ => acc
        }
    }

  def toCoreData(data: JsObject): Map[String, CoreData] =
    (data \ "data")
      .asOpt[Map[String, JsObject]] match {
      case Some(value) =>
        value.foldLeft(Map[String, CoreData]()) {
          case (map, (id, value)) =>
            map.updated(id, value.as[CoreData])
        }
      case _ => Map()
    }

  def toOptionalList[T](list: List[T]): Option[List[T]] =
    if (list.nonEmpty) {
      Some(list)
    } else {
      None
    }

  def extractPayloadAsList(request: UserRequest[AnyContent]): Option[List[String]] =
    for {
      bodyContent <- request.body.asJson
      res <- bodyContent.asOpt[List[String]]
    } yield res

  def getTypeInfoMap(list: List[StructureOfType]): Map[String, StructureOfType] =
    list.foldLeft(Map[String, StructureOfType]()) {
      case (map, typeInfo) => map.updated(typeInfo.name, typeInfo)
    }

  def getFields(data: JsObject, fieldsInfo: Map[String, StructureOfField], apiInstancesPrefix: String): Map[String, Field] =
    fieldsInfo.foldLeft(Map[String, Field]()) {
      case (map, (fieldName, fieldInfo)) => map.updated(fieldName, Field(data, fieldInfo, apiInstancesPrefix))
    }

  def filterFieldNames(fields: List[String], filter: List[String]): List[String] = fields.filterNot(filter.toSet)

  def filterFieldNames(fields: List[String], filter: String): List[String] = filterFieldNames(fields, List(filter))

  def filterFieldNames(fields: List[String], filter: Option[String]): List[String] =
    filter match {
      case Some(f) => filterFieldNames(fields, List(f))
      case None => fields
    }

  def getId(data: JsObject, apiInstancesPrefix: String): Option[String] =
    (data \ "@id").asOpt[String] match {
      case Some(i) => Some(DocumentId.getIdFromPath(i, apiInstancesPrefix))
      case None => None
    }

  def getTypes(coreInstance: CoreData): Option[List[String]] =
    coreInstance match {
      case CoreData(Some(data), None) => getTypes(data)
      case _ => None
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

  def getPromotedFields(fields: Option[Map[String, StructureOfField]], labelField: Option[String]): Option[List[String]] = {
    fields match {
      case Some(f) => Some(f.values
        .foldLeft(List[(String, Boolean)]()) {
          case (acc, field) =>
            field.searchable match {
              case Some(f) =>
                if (f) {
                  labelField match {
                    case Some(l) => acc :+ ((field.fullyQualifiedName, l.equals(field.fullyQualifiedName)))
                    case _ => acc :+ ((field.fullyQualifiedName, false))
                  }
                } else {
                  acc
                }
              case _ => acc
            }
        }
        .sortWith((t1, t2) => {
          if ((t1._2 && t2._2) || (!t1._2 && !t2._2)) {
            t1._1.compareTo(t2._1) > 0
          } else {
            t1._2
          }
        })
        .map(i => i._1))
      case _ => None
    }
  }

  def getPermissions(data: JsObject): Permissions = Permissions((data \ EditorConstants.VOCAB_PERMISSIONS).asOpt[List[String]])

  def getAlternatives(data: JsObject, apiInstancesPrefix: String): Map[String, List[Alternative]] =
    (data \ s"${EditorConstants.VOCAB_ALTERNATIVES}").asOpt[Map[String, JsValue]] match {
      case Some(alternatives) =>
        alternatives
          .filter(x => !x._1.equals(EditorConstants.VOCAB_SPACE)) //TODO: Remove space from kg core
          .foldLeft(Map[String, List[Alternative]]()) {
            case (acc, (k, v)) =>
              val l =  v.as[List[Alternative]].map(a => Alternative.normalizeAlternative(a, apiInstancesPrefix))
              acc.updated(k, l)
          }
      case None => Map()
    }

  def getUser(data: JsObject, apiInstancesPrefix: String): Option[String] =
    (data \ s"${EditorConstants.VOCAB_USER}").asOpt[Map[String, JsValue]] match {
      case Some(user) =>
        user.get("@id") match {
          case Some(i) => Some(DocumentId.getIdFromPath(i.as[String], apiInstancesPrefix))
          case None => None
        }
      case None => None
    }

  def getName(data: JsObject, name: Option[String]): String =
    name match {
      case Some(n) =>
        (data \ n).asOpt[String] match {
          case Some(value) => value
          case _ => ""
        }
      case _ => ""
    }

  def filterStructureOfFields(
                               fieldsInfo: Map[String, StructureOfField],
                               filter: List[String]
                             ): Map[String, StructureOfField] =
    filter.foldLeft(Map[String, StructureOfField]()) {
      case (map, name) => {
        fieldsInfo.get(name) match {
          case Some(info) => map.updated(name, info)
          case _ => map
        }
      }
    }

  def normalizeIdOfField(field: Link, apiInstancesPrefix: String): Link =
    field.get("@id") match {
      case Some(id) =>
        val normalizedId = DocumentId.getIdFromPath(id.as[String], apiInstancesPrefix)
        field.updated("@id", JsString(normalizedId))
      case None => field
    }

  def normalizeIdOfArray(fieldArray: ListOfLinks, apiInstancesPrefix: String): ListOfLinks =
    fieldArray.map(field => normalizeIdOfField(field, apiInstancesPrefix))

  def getInstanceView(id: String, data: CoreData, typeInfoMap: Map[String, StructureOfType], apiInstancesPrefix: String): InstanceView =
    InstanceView(id, data, typeInfoMap, apiInstancesPrefix)

  def getInstanceSummaryView(id: String, data: CoreData, typeInfoMap: Map[String, StructureOfType], apiInstancesPrefix: String): InstanceSummaryView =
    InstanceSummaryView(id, data, typeInfoMap, apiInstancesPrefix)

  def getInstanceLabelView(id: String, data: CoreData, typeInfoMap: Map[String, StructureOfType], apiInstancesPrefix: String): InstanceLabelView =
    InstanceLabelView(id, data, typeInfoMap, apiInstancesPrefix)

  def generateInstancesView(
                             coreInstances: Map[String, CoreData],
                             typeInfoList: List[StructureOfType],
                             generateInstanceView: (String, CoreData, Map[String, StructureOfType], String) => Instance,
                             apiInstancesPrefix: String
                           ): Map[String, Instance] = {
    val typeInfoMap = getTypeInfoMap(typeInfoList)
    coreInstances.foldLeft(Map[String, Instance]()) {
      case (map, (id, coreInstance)) => map.updated(id, generateInstanceView(id, coreInstance, typeInfoMap, apiInstancesPrefix))
    }
  }

  def generateInstancesSummaryView(
                                    coreInstancesList: List[JsObject],
                                    typeInfoList: List[StructureOfType],
                                    apiInstancesPrefix: String
                                  ): List[Instance] = {
    val typeInfoMap = getTypeInfoMap(typeInfoList)
    coreInstancesList.foldLeft(List[Instance]()) {
      case (acc, data) => acc :+ InstanceSummaryView(data, typeInfoMap, apiInstancesPrefix)
    }
  }
}
