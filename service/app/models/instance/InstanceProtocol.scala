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

package models.instance

import play.api.libs.json.{JsValue, Json, Writes}

object InstanceProtocol {

  val instanceWrites: Writes[Instance] = new Writes[Instance] {

    def writes(v: Instance): JsValue =
      v match {
        case a: InstanceLabelView   => Json.toJson(a)
        case b: InstanceSummaryView => Json.toJson(b)
        case c: InstanceView        => Json.toJson(c)
      }
  }
}
