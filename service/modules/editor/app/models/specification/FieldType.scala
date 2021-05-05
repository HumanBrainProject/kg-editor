/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

package models.specification

import play.api.libs.json.{JsValue, Json, Writes}

trait FieldType {
  val t: String
}

object FieldType {

  def unapply(f: FieldType): Option[String] = Some(f.t)

  def apply(s: String): FieldType = s match {
    case "DropdownSelect" => DropdownSelect
    case "KgTable" => KgTable
    case "InputText" => InputText
    case "TextArea" => TextArea
    case fieldType => GenericType(fieldType)
  }

  implicit object FieldType extends Writes[FieldType] {
    def writes(f: FieldType): JsValue = Json.toJson(f.t)
  }

}

final case class GenericType(fieldType: String) extends FieldType {
  override val t: String = fieldType
  val zero = ""
}

case object DropdownSelect extends FieldType {
  override val t: String = "DropdownSelect"
  val zero = List()
}

case object KgTable extends FieldType {
  override val t: String = "KgTable"
  val zero = List()
}

case object InputText extends FieldType {
  override val t: String = "InputText"
  val zero = ""
}

case object InputTextMultiple extends FieldType {
  override val t: String = "InputTextMultiple"
  val zero = ""
}

case object TextArea extends FieldType {
  override val t: String = "TextArea"
  val zero = ""
}
