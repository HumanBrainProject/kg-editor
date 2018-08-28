
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

package editor.helper


import common.helpers.JsFlattener
import common.models.NexusPath
import editor.helpers.{FormHelper, NavigationHelper}
import editor.models.{InMemoryKnowledge, IncomingLinksInstances, Instance}
import authentication.models.UserInfo
import nexus.helpers.NexusHelper
import org.joda.time.DateTime
import org.json4s.native.{JsonMethods, JsonParser}
import org.json4s.{Diff, JsonAST}
import play.api.Logger
import play.api.libs.json.Reads.of
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.{AnyContent, Request}
import play.api.http.Status._

import scala.collection.immutable.SortedSet
import scala.concurrent.{ExecutionContext, Future}

object InstanceHelper {
    val logger = Logger(this.getClass)

  type UpdateInfo = (String, Int, String)

  def consolidateFromManualSpace(
                                  nexusEndpoint: String,
                                  manualSpace:String,
                                  originalInstance: Instance,
                                  editorInstances: List[Instance],
                                  updateToBeStoredInManual: JsObject,
                                  user: UserInfo
                                ): (Instance, Option[List[UpdateInfo]]) = {
    logger.debug(s"Result from incoming links $editorInstances")
    val updatesByPriority = buildManualUpdatesFieldsFrequency(
      editorInstances.filter( item => (item.content \ "http://hbp.eu/manual#updater_id").as[String] != user.id
      ), updateToBeStoredInManual)
    val result = Instance(reconcilationLogic(updatesByPriority, originalInstance.content))
    val manualUpdateDetailsOpt = if(editorInstances.isEmpty){
      logger.debug("creating new editor instace")
      None
    }else{
      //Call reconcile API
      logger.debug(s"Reconciled instance $result")
      val manualUpdateDetails = editorInstances.map(manualEntity => manualEntity.extractUpdateInfo())
      Some(manualUpdateDetails)
    }
    (result, manualUpdateDetailsOpt)
  }


  def buildDiffEntity(consolidatedResponse: Instance, newValue: String, originalInstanceContent: JsValue): JsObject = {
    val consolidatedJson = JsonParser.parse(cleanInstanceManual(consolidatedResponse.content).toString())
    val newJson = JsonParser.parse(newValue)
    val Diff(changed, added, deleted) = consolidatedJson.diff(newJson)
    val diff: JsonAST.JValue = (deleted, changed) match {
      case (JsonAST.JNothing, JsonAST.JNothing) =>
        consolidatedJson
      case (JsonAST.JNothing, _) =>
        changed.merge(added)
      case _ =>
        /* fields deletion. Deletion are allowed on manual space ONLY
         * final diff is then an addition/update from original view
         * this allows partially defined form (some field are then not updatable)
         */
        val Diff(changedFromOrg, addedFromOrg, deletedFromOrg) = JsonParser.parse(originalInstanceContent.toString()).diff(newJson)
        if (deletedFromOrg != JsonAST.JNothing) {
          logger.debug(s"""PARTIAL FORM DEFINITION - missing fields from form: ${deletedFromOrg.toString}""")
        }
        changedFromOrg.merge(addedFromOrg)
    }
    val rendered = Json.parse(JsonMethods.compact(JsonMethods.render(diff))).as[JsObject]
    val newValues = Json.parse(newValue)
    val diffWithCompleteArray = rendered.value.map{
      case (k, v) =>
        val value = ( newValues \ k).asOpt[JsValue]
        if(v.asOpt[JsArray].isDefined && value.isDefined){
          k -> value.get
        }else{
          k -> v
        }
    }
    Json.toJson(diffWithCompleteArray).as[JsObject]
  }

  def buildInstanceFromForm(original: JsObject, formContent: JsObject, nexusEndpoint: String): JsObject = {
//    val flattened = JsFlattener(formContent)
//    applyChanges(original, flattened)
    val cleanForm = FormHelper.removeKey(formContent.as[JsValue])
    val formWithID = cleanForm.toString().replaceAll(""""id":"""", s""""@id":"${nexusEndpoint}/v0/data/""")
    val res= original.deepMerge(Json.parse(formWithID).as[JsObject])
    res
  }

  def buildNewInstanceFromForm(nexusEndpoint: String, instancePath: NexusPath, formRegistry: JsObject, newInstance: JsObject): JsObject = {

    def addNexusEndpointToLinks(item: JsValue): JsObject = {
      val id = (item.as[JsObject] \ "id" ).as[String]
      if(!id.startsWith("http://")){
        Json.obj("@id" ->  JsString(s"$nexusEndpoint/v0/data/$id"))
      }else{
        Json.obj("@id" ->  JsString(id))
      }
    }

    val fields = (formRegistry \ instancePath.org \ instancePath.domain \ instancePath.schema \ instancePath.version \ "fields").as[JsObject].value
    val m = newInstance.value.map{ case (k, v) =>
      val key = FormHelper.unescapeSlash(k)
      val formObjectType = (fields(key) \ "type").as[String]
      formObjectType match {
        case "DropdownSelect" =>
          val arr: IndexedSeq[JsValue] = v.as[JsArray].value.map{ item =>
            addNexusEndpointToLinks(item)
          }
          key -> Json.toJson(arr)
        case _ =>
          if( (fields(key) \ "isLink").asOpt[Boolean].getOrElse(false)){
            key -> addNexusEndpointToLinks(v)
          } else{
            key -> v
          }
      }
    }
    Json.toJson(m).as[JsObject]
  }

  def md5HashString(s: String): String = {
    import java.security.MessageDigest
    import java.math.BigInteger
    val md = MessageDigest.getInstance("MD5")
    val digest = md.digest(s.getBytes)
    val bigInt = new BigInteger(1,digest)
    val hashedString = bigInt.toString(16)
    hashedString
  }

  def buildManualUpdatesFieldsFrequency(manualUpdates: List[Instance], currentUpdate: JsObject): Map[String, SortedSet[(JsValue, Int)]] = {
    val cleanMap: List[Map[String, JsValue]] = currentUpdate.as[Map[String, JsValue]] +: cleanListManualData(manualUpdates)
    buildMapOfSortedManualUpdates(cleanMap)
  }

  // build reconciled view from updates statistics
  def reconcilationLogic(frequencies: Map[String, SortedSet[(JsValue, Int)]], origin: JsObject): JsObject = {
    // simple logic: keep the most frequent
    val transformations = frequencies.filterKeys(key => !key.startsWith("http://hbp.eu/manual#")).map {
      case (pathString, freqs) => (JsFlattener.buildJsPathFromString(pathString), freqs.last._1)
    }.toSeq
    applyChanges(origin, transformations)
  }

  // apply a set of transformation to an instance
  def applyChanges(instance: JsObject, changes: Seq[(JsPath, JsValue)]): JsObject = {
    val obj = changes.foldLeft(instance) {
      case (res, (path, value)) =>
        val updatedJson = updateJson(res, path, value)
        updatedJson
    }
    obj
  }

  // return an updated JsObject or the src object in case of failure
  def updateJson(instance: JsObject, path: JsPath, newValue: JsValue): JsObject = {
    val simpleUpdateTransformer = path.json.update(
      of[JsValue].map { js =>
          newValue
        }
    )
    instance.transform(simpleUpdateTransformer) match {
      case s: JsSuccess[JsObject] => s.get
      case e: JsError => logger.error(s"Could not apply json update - ${JsError.toJson(e).toString()}")
        throw new Exception("Could not apply update")
    }
  }

  def buildMapOfSortedManualUpdates(manualUpdates: List[Map[String, JsValue]]): Map[String, SortedSet[(JsValue, Int)]] = {
    implicit val order = Ordering.fromLessThan[(JsValue, Int)](_._2 < _._2)
    // For each update
    val tempMap = manualUpdates.foldLeft(Map.empty[String, List[JsValue]]) {
      case (merged, m) =>
        val tempRes: Map[String, List[JsValue]] = m.foldLeft(merged) { case (acc, (k, v)) =>
          acc.get(k) match {
            case Some(existing) => acc.updated(k, v :: existing)
            case None => acc.updated(k, List(v))
          }
        }
        tempRes
    }
    val sortedSet = tempMap
      .filter(e => e._1 != "@type" &&
        e._1 != "http://hbp.eu/manual#parent" &&
        e._1 != "http://hbp.eu/manual#origin" &&
        e._1 != "http://hbp.eu/manual#updater_id")
      .map { el =>
        val e = el._2.groupBy(identity).mapValues(_.size)
        el._1 -> SortedSet(e.toList: _*)
      }
    sortedSet
  }


  def merge[K, V](maps: Seq[Map[K, V]])(f: (K, V, V) => V): Map[K, V] = {
    maps.foldLeft(Map.empty[K, V]) { case (merged, m) =>
      m.foldLeft(merged) { case (acc, (k, v)) =>
        acc.get(k) match {
          case Some(existing) => acc.updated(k, f(k, existing, v))
          case None => acc.updated(k, v)
        }
      }
    }
  }

  def cleanListManualData(manualUpdates: List[Instance]): List[Map[String, JsValue]] = {
    manualUpdates.map(el => cleanManualDataFromNexus(el.content))
  }

  def cleanManualDataFromNexus(jsObject: JsObject): Map[String, JsValue] = {
    cleanManualData(jsObject).fields.toMap
  }

  def cleanManualData(jsObject: JsObject): JsObject = {
    jsObject - ("@context") - ("@id") - ("@type") - ("links") - ("nxv:rev") - ("nxv:deprecated")
  }

  def cleanUpInstanceForSave(instance: Instance): JsObject = {
    val jsonObj = instance.content
    cleanManualData(jsonObj)
  }

  def removeNexusFields(jsObject: JsObject): JsObject = {
    jsObject - ("@context") - ("@type") - ("links") - ("nxv:deprecated")
  }

  def prepareManualEntityForStorage(manualEntity: JsObject, userInfo: UserInfo): JsObject = {
    manualEntity.+("http://hbp.eu/manual#updater_id", JsString(userInfo.id))
      .+("http://hbp.eu/manual#update_timestamp", JsNumber(new DateTime().getMillis))
      .-("@context")
      .-("@id")
      .-("links")
      .-("nxv:rev")
      .-("nxv:deprecated")
  }



  def cleanInstanceManual(jsObject: JsObject): JsObject = {
    jsObject.-("http://hbp.eu/manual#parent")
      .-("http://hbp.eu/manual#origin")
      .-("http://hbp.eu/manual#updater_id")
  }

  def formatInstanceList(jsArray: JsArray, reconciledSuffix:String): JsValue = {

    val arr = jsArray.value.map { el =>
      val url = (el \ "instance" \ "value").as[String]
      val name = (el \ "name" \ "value").as[JsString]
      val description: JsString = if ((el \ "description").isDefined) {
        (el \ "description" \ "value").as[JsString]
      } else {
        JsString("")
      }
      val pathString = url.split("v0/data/").tail.head
      val id = url.split("/").last
      val formattedId = NexusPath(pathString)
        .originalPath(reconciledSuffix)
        .toString() + "/" + id
      Json.obj("id" -> formattedId, "description" -> description, "label" -> name)
    }
    Json.toJson(arr)
  }

  def formatFromNexusToOption(jsObject: JsObject, reconciledSuffix: String): JsObject = {
    val id = (jsObject \ "@id").as[String]
    val name = (jsObject \ "http://schema.org/name").as[JsString]
    val description: JsString = if ((jsObject \ "http://schema.org/description").isDefined) {
      (jsObject \ "http://schema.org/description").as[JsString]
    } else { JsString("") }
    Json.obj("id" -> Instance.getIdForEditor(id, reconciledSuffix), "description" -> description, "label" -> name)
  }

  def toReconcileFormat(jsValue: JsValue, privateSpace: String): JsObject = {
    Json.obj("src" -> privateSpace, "content" -> jsValue.as[JsObject].-("@context"))
  }

  //TODO make it dynamic :D
  def getPriority(id: String): Int = {
    if (id contains "manual/poc") {
      3
    } else {
      1
    }
  }

  def getCurrentInstanceDisplayed(currentReconciledInstances: Seq[Instance], originalInstance: Instance): Instance = {
    if (currentReconciledInstances.nonEmpty) {
      val sorted = currentReconciledInstances.sortWith { (left, right) =>
        (left.content \ "http://hbp.eu/reconciled#update_timestamp").as[Long] >
          (right.content \ "http://hbp.eu/reconciled#update_timestamp").as[Long]
      }
      sorted.head
    } else{
      originalInstance
    }
  }

  def generateAlternatives(manualUpdates: List[JsObject]): JsValue = {
    // Alternatives are added per user
    // So for each key we have a list of object containing the user id and the value
    val alternatives: Map[String, Seq[(String, JsValue)]] = manualUpdates
      .map { instance =>
        val dataMap: Map[String, JsValue] = instance
          .-("http://hbp.eu/manual#parent")
          .-("http://hbp.eu/manual#origin").as[Map[String, JsValue]]
        val userId: String = dataMap("http://hbp.eu/manual#updater_id").as[String]
        dataMap.map { case (k, v) => k -> ( userId, v) }
      }.foldLeft(Map.empty[String, Seq[(String, JsValue)]]) { case (map, instance) =>
      //Grouping per field in order to have a map with the field and the list of different alternatives on this field
      val tmp: List[(String, Seq[(String, JsValue)])] = instance.map { case (k, v) => (k, Seq(v)) }.toList ++ map.toList
      tmp.groupBy(_._1).map { case (k, v) => k -> v.flatMap(_._2) }
    }

    val perValue = alternatives.map{
      case (k,v) =>
        val tempMap = v.foldLeft(Map.empty[JsValue, Seq[String]]){case (map, tuple) =>
          val temp: Seq[String] = map.getOrElse(tuple._2, Seq.empty[String])
          map.updated(tuple._2, tuple._1 +: temp)
        }
        k ->  tempMap.toList.sortWith( (el1, el2) => el1._2.length > el2._2.length).map( el =>
          Json.obj("value" -> el._1, "updater_id" -> el._2)
        )
    }
    Json.toJson(
      perValue.-("@type")
        .-("http://hbp.eu/manual#update_timestamp")
        .-("http://hbp.eu/manual#updater_id")
    )
  }



}