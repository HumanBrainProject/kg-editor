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
package constants

object EditorConstants {
  val CORE_NAMESPACE = "https://core.kg.ebrains.eu/"
  val EDITOR_NAMESPACE = "https://editor.kg.ebrains.eu/"
  val CORE_META = s"${CORE_NAMESPACE}vocab/meta/"
  val EDITOR_META = s"${EDITOR_NAMESPACE}vocab/meta/"

  val VOCAB_EMBEDDED_PROPERTIES = s"${CORE_META}embeddedProperties"
  val VOCAB_OCCURRENCES = s"${CORE_META}occurrences"
  val VOCAB_SPACES = s"${CORE_META}spaces"
  val VOCAB_SPACE = s"${CORE_META}space"
  val VOCAB_ALTERNATIVES = s"${CORE_META}alternative"
  val VOCAB_VALUE = s"${CORE_META}value"
  val VOCAB_SELECTED = s"${CORE_META}selected"
  val VOCAB_USER = s"${CORE_META}user"
  val VOCAB_PERMISSIONS = s"${CORE_META}permissions"
  val VOCAB_COLOR = s"${CORE_META}color"
  val VOCAB_PROPERTY_UPDATES = s"${CORE_META}propertyUpdates"
  val VOCAB_PROPERTIES = s"${CORE_META}properties"
  val VOCAB_LABEL_PROPERTY = s"${CORE_META}type/labelProperty"
  val VOCAB_PICTURE = s"${CORE_META}picture"
  val VOCAB_WORKSPACES = s"${CORE_META}workspaces"
  val VOCAB_SEARCHABLE = s"${CORE_META}property/searchable"
  val VOCAB_TARGET_TYPES = s"${CORE_META}targetTypes"
  val VOCAB_AUTO_RELEASE = s"${CORE_META}space/autorelease"
  val VOCAB_CLIENT_SPACE = s"${CORE_META}space/clientSpace"

  val VOCAB_WIDGET = s"${EDITOR_META}property/widget"
}
