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

package authentication.helpers

import common.helpers.ESHelper
import common.helpers.ESHelper.filterNexusGroups
import authentication.models.UserInfo
import play.api.mvc.{AnyContent, Request}

object OIDCHelper {
  /**
    * Retrieve the user's token from a request
    * @param request the request
    * @return A String containing the token or an empty String
    */
  def getTokenFromRequest(request: Request[AnyContent]): String = {
    request.headers.toMap.getOrElse("Authorization", Seq("")).head
  }

  /**
    * If the user is allowed, return the ES index requested by the user,
    * or else return the public index
    *
    * @param userInfo The user's info
    * @param hints The requested ES index
    * @return The requested ES index or the public index
    */
  def getESIndex(userInfo: UserInfo, hints:String): String = {
    val groups = filterNexusGroups(userInfo.groups)
    val h = hints.trim
    if (groups.contains(h)) {
      ESHelper.transformToIndex(h)
    } else {
      ESHelper.publicIndex
    }
  }
}
