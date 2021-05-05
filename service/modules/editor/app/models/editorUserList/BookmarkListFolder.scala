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

import models.instance.NexusInstanceReference

final case class BookmarkListFolder(
  id: Option[NexusInstanceReference],
  folderName: String,
  folderType: FolderType,
  userLists: List[BookmarkList]
)

object BookmarkListFolder {

  import play.api.libs.functional.syntax._
  import play.api.libs.json._
  implicit val bookmarkListFolderReads: Reads[BookmarkListFolder] = (
    (JsPath \ "id").read[String].map(s => Some(NexusInstanceReference.fromUrl(s))) and
    (JsPath \ "folderName").read[String] and
    JsPath.read[FolderType] and
    (JsPath \ "lists").read[List[BookmarkList]].or(Reads.pure(List[BookmarkList]()))
  )(BookmarkListFolder.apply _)

  implicit val bookmarkListFolderWrites: Writes[BookmarkListFolder] = (
    JsPath.writeNullable[NexusInstanceReference] and
    (JsPath \ "folderName").write[String] and
    JsPath.write[FolderType] and
    (JsPath \ "lists").write[List[BookmarkList]]
  )(unlift(BookmarkListFolder.unapply))

}
