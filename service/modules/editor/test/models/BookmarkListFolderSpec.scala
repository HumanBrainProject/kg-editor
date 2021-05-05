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
package models

import models.editorUserList.{BOOKMARKFOLDER, BookmarkList, BookmarkListFolder}
import models.instance.NexusInstanceReference
import org.scalatestplus.play.PlaySpec
import play.api.libs.json.{JsString, Json}

class BookmarkListFolderSpec extends PlaySpec {

  "toJson" should {
    "contain the correct fields" in {
      val folderId = NexusInstanceReference("org", "domain", "schema", "version", "folderId")
      val uFolder = BookmarkListFolder(
        Some(folderId),
        "name",
        BOOKMARKFOLDER,
        List(
          BookmarkList(
            "id",
            "myList",
            None,
            None,
            None
          ),
          BookmarkList(
            "id2",
            "my 2nd List",
            None,
            None,
            None
          )
        )
      )

      val expected = Json.obj(
        "id"         -> JsString(folderId.toString),
        "folderName" -> JsString("name"),
        "folderType" -> JsString("BOOKMARK"),
        "lists" -> Json.arr(
          Json.obj(
            "id"   -> "id",
            "name" -> "myList"
          ),
          Json.obj(
            "id"   -> "id2",
            "name" -> "my 2nd List"
          )
        )
      )

      Json.toJson(uFolder) mustBe expected
    }
  }

}
