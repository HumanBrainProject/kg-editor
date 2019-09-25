package helpers

import play.api.libs.json.{JsArray, JsObject, JsString, JsValue, Json}

object InstanceHelper {

  def transformCanBe(canBe: List[String]): Boolean = if (canBe.nonEmpty) true else false

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
    fieldInfo.get("isLink") match {
      case Some(link) =>
        if (link.as[Boolean]) {
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

  def normalizeId(id: JsValue): Option[JsValue] =
    id.asOpt[String] match {
      case Some(i) =>
        DocumentId.getIdFromPath(i) match {
          case Some(res) => Some(JsString(res))
          case None      => None
        }
      case None => None
    }

  def normalizeType(instanceType: JsValue): Option[JsValue] =
    instanceType.asOpt[List[String]] match {
      case Some(res) => Some(Json.toJson(res))
      case None      => None
    }

  def normalizeInstance(instance: JsObject, fieldsInfo: Map[String, Map[String, JsValue]]): Map[String, JsValue] = {
    val normalizedInstance =
      List[(String, String, (JsValue) => Option[JsValue])](("@id", "id", normalizeId), ("@type", "type", normalizeType))
        .foldLeft(Map[String, JsValue]()) {
          case (map, (in: String, out: String, normalizeFunction: Function1[JsValue, Option[JsValue]])) =>
            normalizeFunction((instance \ in).as[JsValue]) match {
              case Some(v) => map.updated(out, Json.toJson(v))
              case None    => map
            }
        }
    val normalizedFields = fieldsInfo.foldLeft(Map[String, Map[String, JsValue]]()) {
      case (map, (fieldName, fieldInfo)) =>
        (instance \ fieldName).asOpt[JsValue] match {
          case Some(value) => map.updated(fieldName, fieldInfo.updated("value", normalizeFieldValue(value, fieldInfo)))
          case None        => map
        }
    }
    normalizedInstance.updated("fields", Json.toJson(normalizedFields))
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
  def getReconciledFields(
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
  def getFieldsInfoMapByType(fieldsInfo: List[JsObject]): Map[String, Map[String, Map[String, JsValue]]] =
    fieldsInfo.foldLeft(Map[String, Map[String, Map[String, JsValue]]]()) {
      case (map, typeInfo) =>
        val res = for {
          typeOpt   <- (typeInfo \ "type").asOpt[String]
          fieldsOpt <- (typeInfo \ "fields").asOpt[List[Map[String, JsValue]]]
        } yield (typeOpt, fieldsOpt)
        res match {
          case Some((typeValue, fieldsJs)) => {
            val fields = fieldsJs.foldLeft(Map[String, Map[String, JsValue]]()) {
              case (fieldsMap, field) =>
                field.get("fullyQualifiedName") match {
                  case Some(fieldType) =>
                    fieldsMap.updated(fieldType.as[String], generateProperties(field))
                  case _ => fieldsMap
                }
            }
            map.updated(typeValue, fields)
          }
          case _ => map
        }
    }

  def generateProperties(field: Map[String, JsValue]): Map[String, JsValue] =
    List[(String, String, Option[Function1[List[String], Boolean]])](
      ("canBe", "isLink", Some(transformCanBe)),
      ("widget", "widget", None),
      ("markdown", "markdown", None),
      ("label", "label", None)
    ).foldLeft(Map[String, JsValue]()) {
      case (map, (in: String, out: String, callback: Option[Function1[List[String], Boolean]])) =>
        callback match {
          case Some(c) =>
            field.get(in) match {
              case Some(v) => map.updated(out, Json.toJson(c(v.as[List[String]])))
              case None    => map
            }
          case None =>
            field.get(in) match {
              case Some(res) => map.updated(out, res)
              case None      => map
            }
        }
    }

  def normalizeInstancesData(data: JsValue, fieldsInfoJs: JsValue): List[Map[String, JsValue]] = {
    val fieldsInfo = getFieldsInfoMapByType((fieldsInfoJs \ "data").as[List[JsObject]])
    (data \ "data").as[List[JsObject]].foldLeft(List[Map[String, JsValue]]()) {
      case (list, instance) =>
        (instance \ "@type").asOpt[List[String]] match {
          case Some(instanceTypes) =>
            val reconciledFields = getReconciledFields(instanceTypes, fieldsInfo)
            list :+ normalizeInstance(instance, reconciledFields)
          case _ => list
        }
    }
  }

  def normalizeInstanceSummaryData(instanceData: JsValue, typeInfoData: JsValue): List[Map[String, JsValue]] = {
    val typeInfos = (typeInfoData \ "data").as[List[JsObject]].foldLeft(Map[String, JsObject]()) {
      case (map, js) => map.updated((js \ "type").as[String], js)
    }
    (instanceData \ "data").as[JsArray].value.toList.map { instance =>
      val promotedFieldsList = (instance \ "@type").as[List[String]].flatMap { typeName =>
        val promotedFieldsListOpt = for {
          typeInfoRes <- typeInfos.get(typeName)
          promotedFieldsArray <- (typeInfoRes \ "promotedFields")
            .asOpt[List[String]]
        } yield promotedFieldsArray
        promotedFieldsListOpt.getOrElse(List())
      }
      val id = (instance \ "@id").as[String].split("/").lastOption
//      val name = (instance \ typ)
      val initMap = Map[String, JsValue]()
        .updated("type", (instance \ "@type").as[JsArray])
        .updated("id", JsString(id.getOrElse((instance \ "@id").as[String])))
//        .updated("name", ())
      promotedFieldsList.distinct.foldLeft(initMap) {
        case (map, promotedField) => {
          map.updated(promotedField, (instance \ promotedField).as[JsString])
        }
      }
    }
  }
}
