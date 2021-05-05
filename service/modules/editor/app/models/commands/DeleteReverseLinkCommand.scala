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
package models.commands
import helpers.ReverseLinkOP
import models.AccessToken
import models.errors.APIEditorError
import models.instance.{EditorInstance, NexusInstance, NexusInstanceReference, NexusLink}
import models.user.User
import monix.eval.Task
import play.api.http.Status.INTERNAL_SERVER_ERROR
import play.api.libs.json.Json
import services.EditorService

final case class DeleteReverseLinkCommand(
  reverseInstanceLink: NexusLink,
  reverseInstance: NexusInstance,
  targetField: String,
  currentInstanceRef: NexusInstanceReference,
  editorService: EditorService,
  baseUrl: String,
  token: AccessToken,
  user: User
) extends Command {
  override def execute(): Task[Either[APIEditorError, Unit]] = {
    val diffToSave = reverseInstance.content.value.get(targetField) match {
      case Some(fieldValue) => ReverseLinkOP.removeLink(fieldValue, currentInstanceRef, targetField)
      case None             =>
        //The field does not exists we do nothing
        Right(None)
    }
    diffToSave match {
      case Right(Some(l)) =>
        val reverseLinkInstance = EditorInstance(
          NexusInstance(
            Some(reverseInstanceLink.ref.id),
            reverseInstanceLink.ref.nexusPath,
            Json.obj(targetField -> Json.toJson(l.map(_.toJson(baseUrl))))
          )
        )
        editorService.updateInstance(reverseLinkInstance, reverseInstanceLink.ref, token, user.id)
      case Right(None) => Task.pure(Right(()))
      case Left(s)     => Task.pure(Left(APIEditorError(INTERNAL_SERVER_ERROR, s)))
    }
  }
}
