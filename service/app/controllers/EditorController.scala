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

package controllers

import javax.inject.{Inject, Singleton}
import helpers.InstanceHelper
import models._
import models.instance._
import monix.eval.Task
import play.api.Logger
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json._
import play.api.mvc.{Action, _}
import services._

import scala.concurrent.ExecutionContext

@Singleton
class EditorController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  editorService: EditorService,
  workspaceServiceLive: WorkspaceServiceLive
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getInstance(id: String, metadata: Boolean, returnPermissions: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .getInstance(id, request.userToken, metadata, returnPermissions, request.clientToken)
        .flatMap {
          case Right(value) =>
            val coreInstance = value.as[CoreData]
            normalizeInstance(id, coreInstance, request.userToken, request.clientToken)
          case Left(err) => Task.pure(err.toResult)
        }
        .runToFuture
    }

  def deleteInstance(id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .deleteInstance(id, request.userToken, request.clientToken)
        .map {
          case Right(()) => Ok("Instance has been deleted")
          case Left(err) => err.toResult
        }
        .runToFuture
    }

  def getInstancesList(stage: String, metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(
        stage,
        metadata,
        returnAlternatives = true,
        returnPermissions = true,
        returnEmbedded = true,
        generateInstanceView = InstanceHelper.getInstanceView
      ).runToFuture
    }

  def getInstancesSummary(stage: String, metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(
        stage,
        metadata,
        returnAlternatives = false,
        returnPermissions = true,
        returnEmbedded = false,
        generateInstanceView = InstanceHelper.getInstanceSummaryView
      ).runToFuture
    }

  def getInstancesLabel(stage: String, metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(
        stage,
        metadata,
        returnAlternatives = false,
        returnPermissions = false,
        returnEmbedded = false,
        generateInstanceView = InstanceHelper.getInstanceLabelView
      ).runToFuture
    }

  def getInstances(
    stage: String,
    metadata: Boolean,
    returnAlternatives: Boolean,
    returnPermissions: Boolean,
    returnEmbedded: Boolean,
    generateInstanceView: (String, CoreData, Map[String, StructureOfType]) => Instance
  )(implicit request: UserRequest[AnyContent]): Task[Result] =
    InstanceHelper.extractPayloadAsList(request) match {
      case Some(ids) =>
        editorService
          .retrieveInstances(
            ids,
            request.userToken,
            stage,
            metadata,
            returnAlternatives,
            returnPermissions,
            returnEmbedded,
            request.clientToken
          )
          .flatMap {
            case Right(instancesResult) =>
              val coreInstances = InstanceHelper.toCoreData(instancesResult)
              val typesToRetrieve = InstanceHelper.extractTypesFromCoreInstances(coreInstances)
              workspaceServiceLive
                .retrieveTypesListByName(typesToRetrieve, request.userToken, request.clientToken)
                .map {
                  case Right(typesWithFields) =>
                    implicit val writer = InstanceProtocol.instanceWrites
                    val typeInfoList = extractTypeList(typesWithFields)
                    Ok(
                      Json.toJson(
                        EditorResponseObject(
                          Json.toJson(
                            InstanceHelper
                              .generateInstancesView(coreInstances, typeInfoList, generateInstanceView)
                          )
                        )
                      )
                    )
                  case _ => InternalServerError("Something went wrong with types! Please try again!")
                }
            case _ => Task.pure(InternalServerError("Something went wrong with instances! Please try again!"))
          }
      case None => Task.pure(BadRequest("Wrong body content!"))
    }

  def searchInstancesSummary(
    typeId: String,
    from: Option[Int],
    size: Option[Int],
    searchByLabel: String
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .doSearchInstances(typeId, from, size, searchByLabel, request.userToken, request.clientToken)
        .flatMap {
          case Right(instancesResult) =>
            (instancesResult \ "data").asOpt[List[JsObject]] match {
              case Some(coreInstancesList) =>
                val typesToRetrieve = InstanceHelper.extractTypesFromCoreInstancesList(coreInstancesList)
                workspaceServiceLive
                  .retrieveTypesListByName(typesToRetrieve, request.userToken, request.clientToken)
                  .map {
                    case Right(typesWithFields) =>
                      implicit val writer = InstanceProtocol.instanceWrites
                      val typeInfoList = extractTypeList(typesWithFields)
                      Ok(
                        Json.toJson(
                          EditorResponseWithCount(
                            Json.toJson(
                              InstanceHelper
                                .generateInstancesSummaryView(coreInstancesList, typeInfoList)
                            ),
                            (instancesResult \ "total").as[Long]
                          )
                        )
                      )
                    case _ => InternalServerError("Something went wrong with types! Please try again!")
                  }
              case _ => Task.pure(InternalServerError("Something went wrong with instances! Please try again!"))
            }
          case _ => Task.pure(InternalServerError("Something went wrong with instances! Please try again!"))
        }
        .runToFuture
    }

  def getInstanceGraph(id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .retrieveInstanceGraph(id, request.userToken, request.clientToken)
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

  def getSuggestions(
    id: String,
    field: String,
    `type`: Option[String],
    size: Int,
    start: Int,
    search: String
  ): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val bodyContent = request.body.asJson
    bodyContent match {
      case Some(content) =>
        editorService
          .retrieveSuggestions(
            id,
            field,
            `type`,
            size,
            start,
            search,
            content.as[JsObject],
            request.userToken,
            request.clientToken
          )
          .map {
            case Right(value) =>
              (value \ "data").asOpt[Map[String, JsObject]] match {
                case Some(data) =>
                  val types: Map[String, SuggestionType] = data.get("types") match {
                    case Some(t) => t.as[Map[String, SuggestionType]]
                    case None    => Map()
                  }
                  data.get("suggestions") match {
                    case Some(s) =>
                      val suggestions = (s \ "data").as[List[JsObject]].map { instance =>
                        val instanceType = (instance \ "type").as[String]
                        val t = types.get(instanceType)
                        instance ++ Json.obj("type" -> Json.toJson(t))
                      }
                      Ok(
                        Json.toJson(
                          EditorResponseObject(
                            Json.toJson(
                              Json.obj("suggestions" -> Json.toJson(suggestions), "types" -> Json.toJson(types))
                            )
                          )
                        )
                      )
                    case None =>
                      Ok(
                        Json.toJson(
                          EditorResponseObject(
                            Json.toJson(Json.obj("suggestions" -> JsArray(), "types" -> Json.toJson(types)))
                          )
                        )
                      )
                  }
                case None =>
                  Ok(
                    Json.toJson(
                      EditorResponseObject(Json.toJson(Json.obj("suggestions" -> JsArray(), "types" -> JsArray())))
                    )
                  )
              }
            case Left(err) => err.toResult
          }
          .runToFuture
      case None => Task.pure(BadRequest("Missing body content")).runToFuture
    }
  }

  /**
    * Entry point when updating an instance
    *
    * @param id The id of the instance
    * @return A result with the instance updated or an error message
    */
  def updateInstance(id: String): Action[AnyContent] =
    authenticatedUserAction
      .async { implicit request =>
        val bodyContent: Option[JsValue] = request.body.asJson
        (bodyContent match {
          case Some(body) =>
            editorService
              .updateInstance(id, body.as[JsObject], request.userToken, request.clientToken)
              .flatMap {
                case Right(value) =>
                  val coreInstance = value.as[CoreData]
                  normalizeInstance(id, coreInstance, request.userToken, request.clientToken)
                case _ =>
                  Task.pure(
                    InternalServerError("Something went wrong with the update of the instance! Please try again!")
                  )
              }
          case None => Task.pure(BadRequest("Missing body content"))
        }).runToFuture
      }

  def createInstanceWithoutId(workspace: String): Action[AnyContent] = authenticatedUserAction.async {
    implicit request =>
      createInstance(workspace, None).runToFuture
  }

  def createInstanceWithId(workspace: String, id: String): Action[AnyContent] = authenticatedUserAction.async {
    implicit request =>
      createInstance(workspace, Some(id)).runToFuture
  }

  /**
    * Creation of a new instance in the editor
    *
    * @param workspace The workspace that the instance belongs
    * @param id        The id of the instance
    * @return 200 Created
    */
  def createInstance(workspace: String, id: Option[String])(implicit request: UserRequest[AnyContent]): Task[Result] = {
    val bodyContent: Option[JsValue] = request.body.asJson
    bodyContent match {
      case Some(body) =>
        editorService
          .insertInstance(id, workspace, body.as[JsObject], request.userToken, request.clientToken)
          .flatMap {
            case Right(value) =>
              val instance = value.as[CoreData]
              id match {
                case Some(i) => normalizeInstance(i, instance, request.userToken, request.clientToken)
                case None    => normalizeInstance("", instance, request.userToken, request.clientToken)
              }
            case _ =>
              Task.pure(
                InternalServerError("Something went wrong with the insertion of the instance! Please try again!")
              )
          }
      case None => Task.pure(BadRequest("Missing body content"))
    }
  }

  private def normalizeInstance(
    id: String,
    coreInstance: CoreData,
    token: AccessToken,
    clientToken: String
  ): Task[Result] = {
    val typesToRetrieve = InstanceHelper.getTypes(coreInstance)
    typesToRetrieve match {
      case Some(t) =>
        workspaceServiceLive
          .retrieveTypesListByName(t, token, clientToken)
          .map {
            case Right(typesWithFields) =>
              implicit val writer = InstanceProtocol.instanceWrites
              val typeInfoList = extractTypeList(typesWithFields)
              val typeInfoMap = InstanceHelper.getTypeInfoMap(typeInfoList)
              val instanceView = InstanceHelper.getInstanceView(id, coreInstance, typeInfoMap)
              Ok(Json.toJson(EditorResponseObject(Json.toJson(instanceView))))
            case _ => InternalServerError("Something went wrong with types! Please try again!")
          }
      case _ =>
        Task.pure(InternalServerError("Something went wrong while extracting the types! Please try again!"))
    }
  }

  private def extractTypeList(typesWithFields: JsObject): List[StructureOfType] =
    InstanceHelper
      .toCoreData(typesWithFields)
      .foldLeft(List[StructureOfType]()) {
        case (acc, (id, data)) =>
          data.data match {
            case Some(d) =>
              d.asOpt[StructureOfType] match {
                case Some(t) => acc :+ t
                case _       => acc
              }
            case _ => acc
          }
      }
}
