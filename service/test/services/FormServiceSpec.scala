///*
// *   Copyright (c) 2018, EPFL/Human Brain Project PCO
// *
// *   Licensed under the Apache License, Version 2.0 (the "License");
// *   you may not use this file except in compliance with the License.
// *   You may obtain a copy of the License at
// *
// *       http://www.apache.org/licenses/LICENSE-2.0
// *
// *   Unless required by applicable law or agreed to in writing, software
// *   distributed under the License is distributed on an "AS IS" BASIS,
// *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// *   See the License for the specific language governing permissions and
// *   limitations under the License.
// */
//package services
//
//import mockws.MockWSHelpers
//import models._
//import models.specification._
//import org.scalatest.Matchers._
//import org.scalatest.mockito.MockitoSugar
//import org.scalatestplus.play.PlaySpec
//import play.api.libs.json.{JsObject, JsString, Json}
//import services.specification.{FormOp}
//
//class FormServiceSpec extends PlaySpec with MockWSHelpers with MockitoSugar {
//
//  "getFormStructure" should {
//    "return a form with the instance content" in {
//      val originalDatatype = NexusPath("minds/core/activity/v0.0.4")
//      val id = "123"
//      val revision = 2
//      val formRegistry = FormRegistry(
//        Map(
//          originalDatatype -> UISpec(
//            "Activity",
//            List(
//              EditorFieldSpecification(
//                "http://schema.org/name",
//                "Name",
//                None,
//                InputText,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                Some(Json.obj("foo" -> "bar"))
//              ),
//              EditorFieldSpecification(
//                "http://hbp.eu/minds#methods",
//                "Methods",
//                Some("minds/experiment/method/v0.0.4"),
//                DropdownSelect,
//                None,
//                Some(JsString("id")),
//                Some("label"),
//                Some(JsString("id")),
//                Some(true),
//                Some(true),
//                None
//              )
//            ),
//            Some(
//              UIInfo(
//                "http://schema.org/name",
//                List("http://schema.org/name", "http://schema.org/description"),
//                None
//              )
//            )
//          )
//        )
//      )
//      val data = Json.parse(s"""{
//           |    "@context": "https://nexus-dev.humanbrainproject.org/v0/contexts/nexus/core/resource/v0.3.0",
//           |    "@id": "https://nexus-dev.humanbrainproject.org/v0/data/${originalDatatype.toString()}/$id",
//           |    "https://schema.hbp.eu/relativeUrl": "${originalDatatype.toString()}/$id",
//           |    "@type": "http://hbp.eu/minds#Activity",
//           |    "http://hbp.eu/internal#hashcode": "bd374187e78489b9b201bb885490c073",
//           |    "http://hbp.eu/minds#created_at": "2018-03-26T15:21:58.362242+00:00",
//           |    "http://hbp.eu/minds#methods": {
//           |        "https://schema.hbp.eu/relativeUrl": "minds/experiment/method/v0.0.4/5481f012-fa64-4b0a-8614-648f09002519"
//           |    },
//           |    "http://schema.org/name": "365.A.e.#2"
//           |    }
//           |    """.stripMargin)
//
//      val res = FormOp.getFormStructure(originalDatatype, data.as[JsObject], formRegistry)
//      val expected = Json.parse("""
//          | {
//          |  "fields": {
//          |    "id": {
//          |      "value": {
//          |        "path": "minds/core/activity/v0.0.4"
//          |      },
//          |      "nexus_id": "minds/core/activity/v0.0.4/123"
//          |    },
//          |    "http://schema.org/name": {
//          |      "label": "Name",
//          |      "type": "InputText",
//          |      "value": "365.A.e.#2",
//          |      "foo": "bar"
//          |    },
//          |    "http://hbp.eu/minds#methods": {
//          |      "label": "Methods",
//          |      "type": "DropdownSelect",
//          |      "isLink": true,
//          |      "allowCustomValues": true,
//          |      "value": [
//          |        {
//          |          "id": "minds/experiment/method/v0.0.4/5481f012-fa64-4b0a-8614-648f09002519"
//          |        }
//          |      ]
//          |    }
//          |  },
//          |  "label": "Activity",
//          |  "editable": true,
//          |  "ui_info": {
//          |    "labelField": "http://schema.org/name",
//          |    "promotedFields": [
//          |      "http://schema.org/name",
//          |      "http://schema.org/description"
//          |    ]
//          |  },
//          |  "alternatives": {}
//          |}
//        """.stripMargin)
//      val mapRes = res.as[JsObject].values
//      val mapExpected = expected.as[JsObject].values
//      mapRes should contain theSameElementsAs (mapExpected)
//    }
//  }
//
//  "extractRegistries" should {
//    "populate the registry from a json object" in {
//      val registry =
//        Json.parse("""
//            |{
//            |  "_rev": "_XxTeP7K--_",
//            |  "uiSpec": {
//            |    "minds": {
//            |      "core": {
//            |        "dataset": {
//            |          "v1.0.0": {
//            |            "label": "Dataset",
//            |            "ui_info": {
//            |              "promote": true,
//            |              "labelField": "http://schema.org/name",
//            |              "promotedFields": [
//            |                "http://schema.org/name",
//            |                "http://schema.org/description"
//            |              ]
//            |            },
//            |            "fields": [
//            |            {
//            |                "key": "https://schema.hbp.eu/minds/embargo_status",
//            |                "isLink": true,
//            |                "label": "Embargo Status",
//            |                "type": "DropdownSelect",
//            |                "allowCustomValues": true
//            |              },
//            |            { "key": "http://schema.org/datalink",
//            |                "label": "Data link",
//            |                "type": "InputText"
//            |              }
//            |            ]
//            |          }
//            |        }
//            |      },
//            |      "experiment": {
//            |        "protocol": {
//            |          "v1.0.0": {
//            |            "label": "Protocol",
//            |            "ui_info": {
//            |              "labelField": "http://schema.org/name",
//            |              "promotedFields": [
//            |                "http://schema.org/name"
//            |              ]
//            |            },
//            |            "fields": [{
//            |               "key": "http://schema.org/name",
//            |                "label": "Name",
//            |                "type": "InputText"
//            |              }
//            |            ]
//            |          }
//            |        }
//            |      }
//            |    }
//            |  },
//            |  "_id": "editor_specifications/minds",
//            |  "_key": "minds"
//            |}
//          """.stripMargin)
//      val res = FormService.extractRegistries(List(registry.as[JsObject]))
//
//      val expected = FormRegistry(
//        Map(
//          NexusPath("minds", "core", "dataset", "v1.0.0") -> UISpec(
//            "Dataset",
//            List(
//              EditorFieldSpecification(
//                "https://schema.hbp.eu/minds/embargo_status",
//                "Embargo Status",
//                Some("minds/core/embargostatus/v1.0.0"),
//                DropdownSelect,
//                Some(true),
//                Some(JsString("id")),
//                Some("name"),
//                Some(JsString("id")),
//                Some(true),
//                Some(true),
//                None
//              ),
//              EditorFieldSpecification(
//                "http://schema.org/datalink",
//                "Data link",
//                None,
//                InputText,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None
//              )
//            ),
//            Some(
//              UIInfo(
//                "http://schema.org/name",
//                List("http://schema.org/name", "http://schema.org/description"),
//                Some(true)
//              )
//            )
//          ),
//          NexusPath("minds", "experiment", "protocol", "v1.0.0") -> UISpec(
//            "Protocol",
//            List(
//              EditorFieldSpecification(
//                "http://schema.org/name",
//                "Name",
//                None,
//                InputText,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None,
//                None
//              )
//            ),
//            Some(
//              UIInfo(
//                "http://schema.org/name",
//                List("http://schema.org/name"),
//                None
//              )
//            )
//          )
//        )
//      )
//
//      res.formRegistry.registry(NexusPath("minds", "core", "dataset", "v1.0.0")) mustBe expected.registry(
//        NexusPath("minds", "core", "dataset", "v1.0.0")
//      )
//      res.formRegistry.registry(NexusPath("minds", "experiment", "protocol", "v1.0.0")) mustBe expected.registry(
//        NexusPath("minds", "experiment", "protocol", "v1.0.0")
//      )
//
//    }
//  }
//
//}
