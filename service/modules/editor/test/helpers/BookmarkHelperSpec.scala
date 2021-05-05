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
package helpers

import models.instance.NexusInstanceReference
import org.scalatest.Matchers._
import org.scalatest._
import org.scalatestplus.play.PlaySpec
import org.scalatestplus.play.guice.GuiceOneAppPerSuite

class BookmarkHelperSpec extends PlaySpec with GuiceOneAppPerSuite {

  "bookmarkToAddAndDelete" should {
    "return the list of element to add correctly" in {
      val fromDB = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val fromUser = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2"),
        NexusInstanceReference("a", "b", "c", "d", "3"),
        NexusInstanceReference("a", "b", "c", "d", "4"),
        NexusInstanceReference("a", "b", "c", "d", "5")
      )

      val expectedAdd = List(
        NexusInstanceReference("a", "b", "c", "d", "3"),
        NexusInstanceReference("a", "b", "c", "d", "4"),
        NexusInstanceReference("a", "b", "c", "d", "5")
      )

      val (toAdd, toDelete) = BookmarkHelper.bookmarksToAddAndDelete(fromDB, fromUser)

      toAdd should contain theSameElementsAs expectedAdd
      toDelete mustBe List()
    }
    "return the list of element to delete correctly" in {
      val fromDB = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val fromUser = List()

      val expected = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val (toAdd, toDelete) = BookmarkHelper.bookmarksToAddAndDelete(fromDB, fromUser)

      toAdd mustBe List()
      toDelete should contain theSameElementsAs expected
    }

    "return an empty list when no changes are made" in {
      val fromDB = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val fromUser = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val expected = List()

      val (toAdd, toDelete) = BookmarkHelper.bookmarksToAddAndDelete(fromDB, fromUser)

      toAdd mustBe expected
      toDelete mustBe expected
    }

    "return a correct delete list if the user sends an empty list" in {
      val fromDB = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val fromUser = List()

      val expected = List(
        NexusInstanceReference("a", "b", "c", "d", "1"),
        NexusInstanceReference("a", "b", "c", "d", "2")
      )

      val (toAdd, toDelete) = BookmarkHelper.bookmarksToAddAndDelete(fromDB, fromUser)

      toAdd mustBe List()
      toDelete should contain theSameElementsAs expected
    }
  }

}
