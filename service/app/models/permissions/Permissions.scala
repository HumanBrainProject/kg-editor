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

package models.permissions

import play.api.libs.json.Json

final case class Permissions(
                              canCreate: Boolean,
                              canInviteForReview: Boolean,
                              canDelete: Boolean,
                              canInviteForSuggestion: Boolean,
                              canRead: Boolean,
                              canSuggest: Boolean,
                              canWrite: Boolean,
                              canRelease: Boolean
                            )

object Permissions {
  def apply(permissions: Option[List[String]]): Permissions = {
    permissions match {
      case Some(p) =>
        Permissions(
          p.contains("CREATE"),
          p.contains("INVITE_FOR_REVIEW"),
          p.contains("DELETE"),
          p.contains("INVITE_FOR_SUGGESTION"),
          p.contains("READ"),
          p.contains("SUGGEST"),
          p.contains("WRITE"),
          p.contains("RELEASE")
        )
      case _ =>
        Permissions(
          canCreate = false,
          canInviteForReview = false,
          canDelete = false,
          canInviteForSuggestion = false,
          canRead = false,
          canSuggest = false,
          canWrite = false,
          canRelease = false
        )
    }
  }
  implicit val permissionsWrites = Json.writes[Permissions]
}

