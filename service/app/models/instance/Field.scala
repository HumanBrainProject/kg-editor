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
import play.api.libs.json._
import play.api.libs.json.Reads._

final case class Field(data: JsValue, fieldsInfo: StructureOfField)

object Field {
  type Link = Map[String, JsValue]
  type ListOfLinks = List[Link]

  def normalizeFieldValue(value: JsValue, fieldInfo: StructureOfField): JsValue =
    if (fieldInfo.isLink) {
      value.asOpt[ListOfLinks] match {
        case Some(valueArray) => Json.toJson(InstanceHelper.normalizeIdOfArray(valueArray))
        case None =>
          value.asOpt[Link] match {
            case Some(valueObj) => Json.toJson(InstanceHelper.normalizeIdOfField(valueObj))
            case None           => value
          }
      }
    } else {
      value
    }

  def getValue(data: JsValue, fieldInfo: StructureOfField): JsValue = {
    val name = fieldInfo.fullyQualifiedName
    (data \ name).asOpt[JsValue] match {
      case Some(value) => {
        normalizeFieldValue(value, fieldInfo)
      }
      case None => JsNull
    }
  }

  implicit val fieldWrites: Writes[Field] = new Writes[Field] {

    def writes(f: Field): JsValue =
      Json.toJson(f.fieldsInfo).as[JsObject] ++ Json.obj("value" -> Json.toJson(getValue(f.data, f.fieldsInfo)))

  }

}
