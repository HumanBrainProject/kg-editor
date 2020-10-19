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
package constants

object SchemaFieldsConstants {

  val SCHEMA_ORG = "http://schema.org/"
  val SCHEMA_HBP = "https://schema.hbp.eu/"

  val NATIVE_ID = s"${SCHEMA_HBP}users/nativeId"

  val IDENTIFIER = s"${SCHEMA_ORG}identifier"
  val ALTERNATENAME = s"${SCHEMA_ORG}alternateName"
  val NAME = s"${SCHEMA_ORG}name"
  val GIVEN_NAME = s"${SCHEMA_ORG}givenName"
  val FAMILY_NAME = s"${SCHEMA_ORG}familyName"
  val EMAIL = s"${SCHEMA_ORG}email"
  val PICTURE = s"${SCHEMA_ORG}picture"
  val CURATOR = s"${SCHEMA_HBP}curator"
}
