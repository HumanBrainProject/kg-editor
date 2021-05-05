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
package constants

import models.NexusPath

object EditorConstants {
  val EDITORNAMESPACE = "https://schema.hbp.eu/hbpkg/"
  val EDITORVOCAB = "https://schema.hbp.eu/editor/"
  val INFERENCESPACE = "https://schema.hbp.eu/inference/"
  val BASENAMESPACE = "https://schema.hbp.eu/"
  val BOOKMARKLIST = "bookmarkList"
  val BOOKMARKINSTANCELINK = "bookmarkInstanceLink"
  val BOOKMARKLISTFOLDER = "bookmarkListFolder"
  val USER = "user"
  val USERID = "userId"
  val FOLDERTYPE = "folderType"
  val ALTERNATIVES = "alternatives"

  // META
  val META = "https://schema.hbp.eu/meta/editor/"
  val METAIDENTIFIER = s"${META}identifier"

  val RELATIVEURL = "relativeUrl"

  val bookmarkListFolderPath = NexusPath("hbpkg", "core", "bookmarklistfolder", "v0.0.1")
  val bookmarkListPath = NexusPath("hbpkg", "core", "bookmarklist", "v0.0.1")
  val bookmarkPath = NexusPath("hbpkg", "core", "bookmark", "v0.0.1")

  val editorUserPath = NexusPath("hbpkg", "core", "user", "v0.0.1")

  val editorVocab = "https://schema.hbp.eu/editor/"

  val context: String =
    s"""
       |{
       |    "@vocab": "https://schema.hbp.eu/graphQuery/",
       |    "schema": "http://schema.org/",
       |    "hbpkg": "$EDITORNAMESPACE",
       |    "base":"$BASENAMESPACE",
       |    "nexus": "https://nexus-dev.humanbrainproject.org/vocabs/nexus/core/terms/v0.1.0/",
       |    "nexus_instance": "https://nexus-dev.humanbrainproject.org/v0/schemas/",
       |    "this": "$editorVocab",
       |    "searchui": "https://schema.hbp.eu/search_ui/",
       |    "fieldname": {
       |      "@id": "fieldname",
       |      "@type": "@id"
       |    },
       |    "merge": {
       |      "@id": "merge",
       |      "@type": "@id"
       |    },
       |    "relative_path": {
       |      "@id": "relative_path",
       |      "@type": "@id"
       |    },
       |    "root_schema": {
       |      "@id": "root_schema",
       |      "@type": "@id"
       |    }
       |  }
    """.stripMargin
}
