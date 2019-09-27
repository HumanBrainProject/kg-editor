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

import models.UserRequest
import play.api.libs.json.{JsNull, JsObject, JsString, JsValue, Json}
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

  /*
  {
    "http://schema.org/Dataset": {
      "http://schema.org/name": {
          type: "InputText",
          label: "Name"
      },
      "http://schema.org/description": {
          type: "InputText",
          label: "Description",
          markdown: true,
          link: false
      },
      "http://schema.org/contributor": {
          type: "DropDown",
          label: "Contributors",
          markdown: true,
          link: true
      }
    }
  }
   */
  def generateProperties(field: Map[String, JsValue]): Map[String, JsValue] =
    List[(String, String)](
      ("canBe", "canBe"),
      ("widget", "type"),
      ("markdown", "markdown"),
      ("label", "label"),
      ("allowCustomValues", "allowCustomValues"),
      ("labelTooltip", "labelTooltip")
    ).foldLeft(Map[String, JsValue]()) {
      case (map, (in: String, out: String)) =>
        field.get(in) match {
          case Some(res) => map.updated(out, res)
          case None      => map
        }
    }

  def reconcilePromotedFields(data: JsValue, typeInfoMap: Map[String, Map[String, JsValue]]): List[String] =
    (data \ "@type")
      .as[List[String]]
      .flatMap { typeName =>
        val promotedFieldsListOpt = for {
          typeInfo       <- typeInfoMap.get(typeName)
          promotedFields <- typeInfo.get("promotedFields")
          list           <- promotedFields.asOpt[List[String]]
        } yield list
        promotedFieldsListOpt.getOrElse(List())
      }
      .distinct

  def createInstance(list: List[(String, JsValue)]): Map[String, JsValue] =
    list.foldLeft(Map[String, JsValue]()) {
      case (map, (name, value)) => map.updated(name, value)
    }

  def getTypeInfoMap(list: List[JsObject]): Map[String, Map[String, JsValue]] =
    list.foldLeft(Map[String, Map[String, JsValue]]()) {
      case (map, typeInfo) =>
        val res = for {
          typeOpt        <- (typeInfo \ "type").asOpt[String]
          typeInfoMapOpt <- typeInfo.asOpt[Map[String, JsValue]]
        } yield (typeOpt, typeInfoMapOpt)
        res match {
          case Some((typeName, typeInfoMap)) => map.updated(typeName, typeInfoMap)
          case _                             => map
        }
    }

  def getFieldsInfoMapByType(typeInfoList: List[JsObject]): Map[String, Map[String, Map[String, JsValue]]] =
    typeInfoList.foldLeft(Map[String, Map[String, Map[String, JsValue]]]()) {
      case (map, typeInfo) =>
        val res = for {
          typeOpt   <- (typeInfo \ "type").asOpt[String]
          fieldsOpt <- (typeInfo \ "fields").asOpt[List[Map[String, JsValue]]]
        } yield (typeOpt, fieldsOpt)
        res match {
          case Some((typeName, fieldsJs)) => {
            val fields = fieldsJs.foldLeft(Map[String, Map[String, JsValue]]()) {
              case (fieldsMap, field) =>
                field.get("fullyQualifiedName") match {
                  case Some(fieldType) =>
                    fieldsMap.updated(fieldType.as[String], generateProperties(field))
                  case _ => fieldsMap
                }
            }
            map.updated(typeName, fields)
          }
          case _ => map
        }
    }

  def getFields(data: JsObject, fieldsInfo: Map[String, Map[String, JsValue]]): Map[String, Map[String, JsValue]] =
    fieldsInfo.foldLeft(Map[String, Map[String, JsValue]]()) {
      case (map, (fieldName, fieldInfo)) =>
        (data \ fieldName).asOpt[JsValue] match {
          case Some(value) => map.updated(fieldName, fieldInfo.updated("value", normalizeFieldValue(value, fieldInfo)))
          case None        => map
        }
    }

  /*
  {
    "http://schema.org/name": {
        type: "InputText",
        label: "Name"
    },
    "http://schema.org/description": {
        type: "InputText",
        label: "Description",
        markdown: true,
        link: false
    },
    "http://schema.org/contributor": {
        type: "DropDown",
        label: "Contributors",
        markdown: true,
        link: true
    }
  }
   */
  def getReconciledFieldsInfo(
    types: List[String],
    fieldsInfo: Map[String, Map[String, Map[String, JsValue]]]
  ): Map[String, Map[String, JsValue]] =
    types.foldLeft(Map[String, Map[String, JsValue]]()) {
      case (reconciledFieldsInfo, typeValue) => {
        fieldsInfo.get(typeValue) match {
          case Some(fieldsInfoRes) =>
            fieldsInfoRes.foldLeft(reconciledFieldsInfo) {
              case (map, (k, v)) => map.updated(k, v)
            }
          case None => reconciledFieldsInfo
        }
      }
    }

  def getReconciledTypeInfo(
    instanceTypes: List[String],
    typeInfoMap: Map[String, Map[String, JsValue]]
  ): Map[String, List[JsValue]] =
    instanceTypes
      .foldLeft(List[Map[String, JsValue]]()) {
        case (list, typeName) =>
          typeInfoMap.get(typeName) match {
            case Some(typeInfo) => (list :+ typeInfo).distinct
            case _              => list
          }
      }
      .foldLeft(Map[String, List[JsValue]]()) {
        case (map, typeInfo) =>
          typeInfo.foldLeft(map) {
            case (acc, (key, value)) =>
              acc.get(key) match {
                case Some(list) => acc.updated(key, list :+ value)
                case _          => acc.updated(key, List[JsValue](value))
              }
          }
      }

  def getId(data: JsObject): JsValue =
    (data \ "@id").asOpt[String] match {
      case Some(i) =>
        DocumentId.getIdFromPath(i) match {
          case Some(res) => JsString(res)
          case None      => JsNull
        }
      case None => JsNull
    }

  def getName(data: JsObject, name: Option[String]): JsValue =
    name match {
      case Some(n) =>
        (data \ n).asOpt[JsValue] match {
          case Some(value) => value
          case _           => JsNull
        }
      case _ => JsNull
    }

  def getLabelField(reconciledTypeInfo: Map[String, List[JsValue]]): Option[String] =
    reconciledTypeInfo.get("labelField") match {
      case Some(list) => Some(list.head.as[String])
      case _          => None
    }

  def filterFieldsInfo(
    fieldsInfo: Map[String, Map[String, JsValue]],
    filter: List[String]
  ): Map[String, Map[String, JsValue]] =
    filter.foldLeft(Map[String, Map[String, JsValue]]()) {
      case (map, name) => {
        fieldsInfo.get(name) match {
          case Some(info) => map.updated(name, info)
          case _          => map
        }
      }
    }

  def filterFields(fields: List[String], filter: List[String]): List[String] = fields.filterNot(filter.toSet)

  def filterFields(fields: List[String], filter: String): List[String] = filterFields(fields, List(filter))

  def filterFields(fields: List[String], filter: Option[String]): List[String] =
    filter match {
      case Some(f) => filterFields(fields, List(f))
      case None    => fields
    }

  def normalizeInstances(dataList: List[JsObject], typeInfoList: List[JsObject]): List[Map[String, JsValue]] = {
    val typeInfoMap = getTypeInfoMap(typeInfoList)
    val fieldsInfoMapByType = getFieldsInfoMapByType(typeInfoList)
    dataList.foldLeft(List[Map[String, JsValue]]()) {
      case (instances, data) =>
        (data \ "@type").asOpt[List[String]] match {
          case Some(instanceTypes) =>
            instances :+ normalizeInstance(data, instanceTypes, typeInfoMap, fieldsInfoMapByType)
          case _ => instances
        }
    }
  }

  def normalizeInstance(
    data: JsObject,
    instanceTypes: List[String],
    typeInfoMap: Map[String, Map[String, JsValue]],
    fieldsInfoMapByType: Map[String, Map[String, Map[String, JsValue]]]
  ): Map[String, JsValue] = {
    val reconciledFieldsInfo = getReconciledFieldsInfo(instanceTypes, fieldsInfoMapByType)
    val fields = getFields(data, reconciledFieldsInfo)
    val reconciledTypeInfo = getReconciledTypeInfo(instanceTypes, typeInfoMap)
    createInstance(
      List[(String, JsValue)](
        ("id", getId(data)),
        ("type", Json.toJson(instanceTypes)),
        ("typeLabel", Json.toJson(reconciledTypeInfo.get("label"))),
        ("color", Json.toJson(reconciledTypeInfo.get("color"))),
        ("fields", Json.toJson(fields))
      )
    )
  }

  def normalizeInstancesSummary(dataList: List[JsObject], typeInfoList: List[JsObject]): List[Map[String, JsValue]] = {
    val typeInfoMap = getTypeInfoMap(typeInfoList)
    val fieldsInfoMapByType = getFieldsInfoMapByType(typeInfoList)
    dataList.foldLeft(List[Map[String, JsValue]]()) {
      case (instances, data) =>
        (data \ "@type").asOpt[List[String]] match {
          case Some(instanceTypes) =>
            instances :+ normalizeInstanceSummary(data, instanceTypes, typeInfoMap, fieldsInfoMapByType)
          case _ => instances
        }
    }
  }

  def normalizeInstanceSummary(
    data: JsObject,
    instanceTypes: List[String],
    typeInfoMap: Map[String, Map[String, JsValue]],
    fieldsInfoMapByType: Map[String, Map[String, Map[String, JsValue]]]
  ): Map[String, JsValue] = {
    val reconciledFieldsInfo = getReconciledFieldsInfo(instanceTypes, fieldsInfoMapByType)
    val reconciledTypeInfo = getReconciledTypeInfo(instanceTypes, typeInfoMap)
    val labelField = getLabelField(reconciledTypeInfo)
    val promotedFieldsList = reconcilePromotedFields(data, typeInfoMap)
    val filteredPromotedFieldsList = filterFields(promotedFieldsList, labelField)
    val filteredFields = filterFieldsInfo(reconciledFieldsInfo, filteredPromotedFieldsList)
    val fields = getFields(data, filteredFields)
    createInstance(
      List[(String, JsValue)](
        ("id", getId(data)),
        ("type", Json.toJson(instanceTypes)),
        ("typeLabel", Json.toJson(reconciledTypeInfo.get("label"))),
        ("color", Json.toJson(reconciledTypeInfo.get("color"))),
        ("name", Json.toJson(getName(data, labelField))),
        ("fields", Json.toJson(fields))
      )
    )
  }

  def normalizeInstancesLabel(dataList: List[JsObject], typeInfoList: List[JsObject]): List[Map[String, JsValue]] = {
    val typeInfoMap = getTypeInfoMap(typeInfoList)
    dataList.foldLeft(List[Map[String, JsValue]]()) {
      case (instances, data) =>
        (data \ "@type").asOpt[List[String]] match {
          case Some(instanceTypes) => instances :+ normalizeInstanceLabel(data, instanceTypes, typeInfoMap)
          case _                   => instances
        }
    }
  }

  def normalizeInstanceLabel(
    data: JsObject,
    instanceTypes: List[String],
    typeInfoMap: Map[String, Map[String, JsValue]]
  ): Map[String, JsValue] = {
    val reconciledTypeInfo = getReconciledTypeInfo(instanceTypes, typeInfoMap)
    val labelField = getLabelField(reconciledTypeInfo)
    createInstance(
      List[(String, JsValue)](
        ("id", getId(data)),
        ("type", Json.toJson(instanceTypes)),
        ("typeLabel", Json.toJson(reconciledTypeInfo.get("label"))),
        ("color", Json.toJson(reconciledTypeInfo.get("color"))),
        ("name", Json.toJson(getName(data, labelField)))
      )
    )
  }

  def normalizeIdOfField(field: Map[String, JsValue]): Map[String, JsValue] =
    field.get("@id") match {
      case Some(id) =>
        val normalizedId = DocumentId.getIdFromPath(id.as[String])
        normalizedId match {
          case Some(id) => field.updated("id", JsString(id)).filter(value => !value._1.equals("@id"))
          case None     => field
        }
      case None => field
    }

  def normalizeIdOfArray(fieldArray: List[Map[String, JsValue]]): List[Map[String, JsValue]] =
    fieldArray.map(field => normalizeIdOfField(field))

  def normalizeFieldValue(value: JsValue, fieldInfo: Map[String, JsValue]): JsValue =
    fieldInfo.get("canBe") match {
      case Some(canBe) =>
        if (canBe.as[List[String]].nonEmpty) {
          value.asOpt[List[Map[String, JsValue]]] match {
            case Some(valueArray) => Json.toJson(normalizeIdOfArray(valueArray))
            case None =>
              value.asOpt[Map[String, JsValue]] match {
                case Some(valueObj) => Json.toJson(normalizeIdOfField(valueObj))
                case None           => value
              }
          }
        } else {
          value
        }
      case None => value
    }
}
