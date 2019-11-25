/*
 *   Copyright (c) 2018, EPFL/Human Brain Project PCO
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
package services.bookmark

import models.errors.APIEditorError
import models._
import models.editorUserList.{BOOKMARKFOLDER, BookmarkList, BookmarkListFolder, FolderType}
import models.instance.{NexusInstanceReference, PreviewInstance}
import models.specification.{FormRegistry, UISpec}
import models.user.EditorUser
import monix.eval.Task

trait BookmarkServiceInterface {

  /**
    * Create a folder for bookmarklist
    * @param editorUser  the current user
    * @param name the name of the folder
    * @param folderType the type of the folder
    * @param token the token of the tech account
    * @return The created folder
    */
  def createBookmarkListFolder(
    editorUser: EditorUser,
    name: String,
    token: AccessToken,
    folderType: FolderType = BOOKMARKFOLDER
  ): Task[Either[APIEditorError, BookmarkListFolder]]

  def addInstanceToBookmarkLists(
    instanceReference: NexusInstanceReference,
    bookmarkListIds: List[NexusInstanceReference],
    token: AccessToken
  ): Task[List[Either[APIEditorError, Unit]]]

  def removeInstanceFromBookmarkLists(
    instanceRef: NexusInstanceReference,
    bookmarkListIds: List[NexusInstanceReference],
    token: AccessToken
  ): Task[List[Either[APIEditorError, Unit]]]

  def retrieveBookmarkLists(
    instanceIds: List[NexusInstanceReference],
    editorUser: EditorUser,
    token: AccessToken
  ): Task[List[(NexusInstanceReference, Either[APIEditorError, List[BookmarkList]])]]
}
