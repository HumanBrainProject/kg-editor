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

package models.workspace

import constants.{EditorConstants, SchemaFieldsConstants}
import models.permissions.Permissions
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.libs.json.{JsPath, Json, Reads}

final case class Workspace(
                       id: String,
                       name: Option[String],
                       autorelease: Option[Boolean],
                       clientSpace: Option[Boolean],
                       internalSpace: Option[Boolean],
                       permissions: Permissions)

object Workspace {

  def apply(
             id: String,
             name: Option[String],
             autorelease: Option[Boolean],
             clientSpace: Option[Boolean],
             internalSpace: Option[Boolean],
             permissions: Option[List[String]]
           ): Workspace = Workspace(id, name, autorelease, clientSpace, internalSpace, Permissions(permissions));

  implicit val workspaceReads: Reads[Workspace] = (
    (JsPath \ SchemaFieldsConstants.IDENTIFIER).read[String] and
      (JsPath \ SchemaFieldsConstants.NAME).readNullable[String] and
      (JsPath \ EditorConstants.VOCAB_AUTO_RELEASE).readNullable[Boolean] and
      (JsPath \ EditorConstants.VOCAB_CLIENT_SPACE).readNullable[Boolean] and
      (JsPath \ EditorConstants.VOCAB_INTERNAL_SPACE).readNullable[Boolean] and
      (JsPath \ EditorConstants.VOCAB_PERMISSIONS).readNullable[List[String]]
    )(Workspace.apply(_, _, _, _, _, _))

  implicit val workspaceWrites = Json.writes[Workspace]
}
