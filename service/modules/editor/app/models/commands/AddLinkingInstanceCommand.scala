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
import models.errors.APIEditorError
import models.instance.{LinkingInstance, NexusInstance, NexusInstanceReference, NexusLink}
import models.user.User
import models.{AccessToken, NexusPath}
import monix.eval.Task
import play.api.Logger
import services.EditorService

final case class AddLinkingInstanceCommand(
  targetId: NexusLink,
  currentInstanceRef: NexusInstanceReference,
  linkingInstanceType: String,
  linkingInstancePath: NexusPath,
  editorService: EditorService,
  baseUrl: String,
  user: Option[User],
  token: AccessToken
) extends Command {
  val log = Logger(this.getClass)
  override def execute(): Task[Either[APIEditorError, Unit]] = {
    val linkingInstance = LinkingInstance(
      s"$baseUrl/v0/data/${currentInstanceRef.toString}",
      s"$baseUrl/v0/data/${targetId.ref.toString}",
      linkingInstanceType
    )
    editorService
      .insertInstance(NexusInstance(None, linkingInstancePath, linkingInstance.toNexusFormat), user, token)
      .map {
        case Right(i) =>
          log.debug(
            s"Added linking instance with id ${linkingInstancePath
              .toString()}/${i.id}, from ${targetId.ref.toString} - to ${currentInstanceRef.toString}"
          )
          Right(())
        case Left(err) =>
          log.error(s"Could not add linking instance with to ${currentInstanceRef.toString}")
          Left(err)
      }
  }
}
