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
  //TODO: Rerwrite the vocabulary to follow ebrains
  val BASENAMESPACE = "https://schema.hbp.eu/" //TODO: Deprecation warning! this will be deprecated, use EBRAINSNAMESPACE instead or update the value to ebrains one
  val EBRAINSNAMESPACE = "https://kg.ebrains.eu/"
  val EBRAINSVOCAB = s"${EBRAINSNAMESPACE}vocab/"

  // META
  val META = "https://schema.hbp.eu/meta/editor/"
  val METAIDENTIFIER = s"${META}identifier"
  val VOCABEBRAINSEMBEDDEDPROPERTIES = s"${EBRAINSVOCAB}meta/embeddedProperties"
  val VOCABMETAEBRAINSOCCURENCES = s"${EBRAINSVOCAB}meta/occurences"
  val VOCABEBRAINSSPACES = s"${EBRAINSVOCAB}meta/spaces"
  val VOCABEBRAINSSPACE = s"${EBRAINSVOCAB}meta/space"
  val VOCABEBRAINSALTERNATIVES = s"${EBRAINSVOCAB}meta/alternative"
  val VOCABEBRAINSVALUE = s"${EBRAINSVOCAB}meta/value"
  val VOCABEBRAINSSELECTED = s"${EBRAINSVOCAB}meta/selected"
  val VOCABEBRAINSUSER = s"${EBRAINSVOCAB}meta/user"
  val VOCABEBRAINSPERMISSIONS = s"${EBRAINSVOCAB}meta/permissions"
  val VOCABEBRAINSCOLOR = s"${EBRAINSVOCAB}meta/color"
  val VOCABEBRAINSWIDGET = s"${EBRAINSVOCAB}meta/property/widget"
  val VOCABEBRAINSPROPERTYUPDATES = s"${EBRAINSVOCAB}meta/propertyUpdates"

  val METAEBRAINS = "https://kg.ebrains.eu/meta/"
  val METAEBRAINSPROPERTIES = s"${EBRAINSVOCAB}meta/properties"
  val METAEBRAINSLABELPROPERTIES = s"${EBRAINSVOCAB}meta/labelProperties"
  val METAEBRAINSWORKSPACES = s"${METAEBRAINS}workspaces"
  val METAEBRAINSSEARCHABLE = s"${METAEBRAINS}property/searchable"
}
