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

import constants.{EditorConstants, SchemaFieldsConstants}
import play.api.libs.json.{JsPath, JsValue, Json, Reads, Writes}
import play.api.libs.functional.syntax._

final case class InstanceType(name: String, label: String, color: Option[String])

object InstanceType {

  implicit val instanceTypeReads: Reads[InstanceType] = (
    (JsPath \ SchemaFieldsConstants.IDENTIFIER).read[String] and
    (JsPath \ SchemaFieldsConstants.NAME).read[String] and
    (JsPath \ EditorConstants.VOCAB_COLOR).readNullable[String]
  )(InstanceType.apply _)

  implicit val instanceTypeWrites: Writes[InstanceType] = new Writes[InstanceType] {

    def writes(v: InstanceType): JsValue =
      Json.obj("name" -> Json.toJson(v.name), "label" -> Json.toJson(v.label), "color" -> Json.toJson(v.color))
  }
}
