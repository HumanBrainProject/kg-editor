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
package models.editorUserList

import constants.EditorConstants
import models.specification.UIInfo

final case class BookmarkList(
  id: String,
  name: String,
  editable: Option[Boolean],
  UIInfo: Option[UIInfo],
  color: Option[String]
)

object BookmarkList {

  import play.api.libs.functional.syntax._
  import play.api.libs.json._

  implicit val userListReads: Reads[BookmarkList] = (
    (JsPath \ "id").read[String].map(id => s"${EditorConstants.bookmarkListPath.toString()}/${id.split("/").last}") and
    (JsPath \ "name").read[String] and
    (JsPath \ "editable").readNullable[Boolean] and
    (JsPath \ "uiSpec").readNullable[UIInfo] and
    (JsPath \ "color").readNullable[String]
  )(BookmarkList.apply _)

  implicit val userListWrites: Writes[BookmarkList] = (
    (JsPath \ "id").write[String] and
    (JsPath \ "name").write[String] and
    (JsPath \ "editable").writeNullable[Boolean] and
    (JsPath \ "uiSpec").writeNullable[UIInfo] and
    (JsPath \ "color").writeNullable[String]
  )(unlift(BookmarkList.unapply))
}