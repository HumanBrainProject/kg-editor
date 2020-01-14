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
package models

sealed trait Cache {

  override def toString: String = this match {
    case ServiceTokenCache => Cache.SERVICETOKEN_CACHE
    case UserInfoCache     => Cache.USER_CACHE
  }
}

object Cache {
  val SERVICETOKEN_CACHE = "servicetoken-cache"
  val USER_CACHE = "userinfo-cache"

  def fromString(s: String): Option[Cache] = s match {
    case SERVICETOKEN_CACHE => Some(ServiceTokenCache)
    case USER_CACHE         => Some(UserInfoCache)
    case _                  => None
  }
}

object ServiceTokenCache extends Cache
object UserInfoCache extends Cache
