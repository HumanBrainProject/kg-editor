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

sealed trait Cache {

  override def toString: String = this match {
    case UserInfoCache   => Cache.USER_CACHE
    case EditorUserCache => Cache.EDITOR_CACHE
    case MetadataCache   => Cache.METADATA_CACHE
  }
}

object Cache {
  val USER_CACHE = "userinfo-cache"
  val EDITOR_CACHE = "editor-userinfo-cache"
  val METADATA_CACHE = "editor-metadata-cache"

  def fromString(s: String): Option[Cache] = s match {
    case USER_CACHE     => Some(UserInfoCache)
    case EDITOR_CACHE   => Some(EditorUserCache)
    case METADATA_CACHE => Some(MetadataCache)
    case _              => None
  }
}

object UserInfoCache extends Cache
object EditorUserCache extends Cache
object MetadataCache extends Cache
