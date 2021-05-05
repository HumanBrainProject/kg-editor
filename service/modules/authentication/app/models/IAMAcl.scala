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

import play.api.libs.json.{JsPath, Reads}

final case class IAMAcl(path: String, identity: ACLIdentity, permissions: List[IAMPermission])

object IAMAcl {
  import play.api.libs.functional.syntax._
  implicit val readIAMACL: Reads[IAMAcl] = (
    (JsPath \ "path").read[String] and
    (JsPath \ "identity").read[ACLIdentity] and
    (JsPath \ "permissions").read[List[String]].map(xs => xs.map(x => IAMPermission.fromString(x)))
  )(IAMAcl.apply _)
}
