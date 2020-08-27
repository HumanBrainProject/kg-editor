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

package models.user

import constants.SchemaFieldsConstants
import play.api.libs.json.{JsPath, Json, Reads}
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._

final case class User(id: String, name: Option[String], username: Option[String])

object User {
  implicit val userReads: Reads[User] = (
    (JsPath \ SchemaFieldsConstants.IDENTIFIER)
      .read[List[String]]
      .map(i => i.head) and //We get the first element of the Id list
    (JsPath \ SchemaFieldsConstants.NAME).readNullable[String] and
    (JsPath \ SchemaFieldsConstants.ALTERNATENAME).readNullable[String]
  )(User.apply _)

  implicit val userWrites = Json.writes[User]
}
