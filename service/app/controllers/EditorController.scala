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
import models.instance.InstanceProtocol._
import models._
import models.instance._
import monix.eval.Task
import play.api.Logger
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json._
import play.api.mvc.{Action, _}
import services._
import services.specification.{FormOp, FormService}

import scala.concurrent.ExecutionContext

@Singleton
class EditorController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  editorService: EditorService,
  TokenAuthService: TokenAuthService,
  config: ConfigurationService,
  formService: FormService,
  reverseLinkService: ReverseLinkService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def getInstance(id: String, metadata: Boolean, returnPermissions: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .getInstance(id, request.userToken, metadata, returnPermissions)
        .flatMap {
          case Right(value) =>
            val instance = (value \ "data").as[JsObject]
            normalizeInstance(instance, request.userToken)
          case _ =>
            Task.pure(InternalServerError("Something went wrong while fetching the instance! Please try again!"))
        }
        .runToFuture
    }

  def deleteInstance(id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .deleteInstance(id, request.userToken)
        .map {
          case Right(()) => Ok("Instance has been deleted")
          case Left(err) => err.toResult
        }
        .runToFuture
    }

  def getInstanceScope(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceReference = NexusInstanceReference(org, domain, schema, version, id)
      editorService
        .getInstanceScope(nexusInstanceReference, request.userToken)
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

  def addUserToInstanceScope(
    org: String,
    domain: String,
    schema: String,
    version: String,
    id: String,
    user: String
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceReference = NexusInstanceReference(org, domain, schema, version, id)
      editorService
        .addUserToInstanceScope(nexusInstanceReference, user, request.userToken)
        .map {
          case Left(err) => err.toResult
          case Right(()) =>
            Ok(s"user ${user} has been added to instance ${org}/${domain}/${schema}/${version}/${id}' scope")
        }
        .runToFuture
    }

  def removeUserOfInstanceScope(
    org: String,
    domain: String,
    schema: String,
    version: String,
    id: String,
    user: String
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceReference = NexusInstanceReference(org, domain, schema, version, id)
      editorService
        .removeUserOfInstanceScope(nexusInstanceReference, user, request.userToken)
        .map {
          case Left(err) => err.toResult
          case Right(()) =>
            Ok(s"user ${user} has been removed from instance ${org}/${domain}/${schema}/${version}/${id}' scope")
        }
        .runToFuture
    }

  def getWorkspaceTypes(workspace: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val result = editorService
        .retrieveWorkspaceTypes(workspace, request.userToken)
        .map {
          case Left(err) => err.toResult
          case Right(value) =>
            val res = (value \ "data").as[List[StructureOfType]]
            Ok(Json.toJson(EditorResponseObject(Json.toJson(res))))
        }
      result.runToFuture
    }

  def getInstancesList(stage: String, metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(stage, metadata, true, true, generateInstanceView = InstanceHelper.getInstanceView).runToFuture
    }

  def getInstancesSummary(stage: String, metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(stage, metadata, false, true, generateInstanceView = InstanceHelper.getInstanceSummaryView).runToFuture
    }

  def getInstancesLabel(stage: String, metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(stage, metadata, false, false, generateInstanceView = InstanceHelper.getInstanceLabelView).runToFuture
    }

  def getInstances(
    stage: String,
    metadata: Boolean,
    returnAlternatives: Boolean,
    returnPermissions: Boolean,
    generateInstanceView: (JsObject, Map[String, StructureOfType]) => Option[Instance]
  )(implicit request: UserRequest[AnyContent]): Task[Result] =
    InstanceHelper.extractPayloadAsList(request) match {
      case Some(ids) =>
        editorService
          .retrieveInstances(ids, request.userToken, stage, metadata, returnAlternatives, returnPermissions)
          .flatMap {
            case Right(instancesResult) =>
              val instances = InstanceHelper.extractDataAsList(instancesResult)
              val typesToRetrieve = InstanceHelper.toTypeList(instances)
              editorService
                .retrieveTypesList(typesToRetrieve, request.userToken)
                .map {
                  case Right(typesWithFields) =>
                    implicit val writer = InstanceProtocol.instanceWrites
                    (typesWithFields \ "data").asOpt[List[StructureOfType]] match {
                      case Some(typeInfoList) =>
                        Ok(
                          Json.toJson(
                            EditorResponseObject(
                              Json.toJson(
                                InstanceHelper.generateInstanceListView(instances, typeInfoList, generateInstanceView)
                              )
                            )
                          )
                        )
                      case _ => InternalServerError("Something went wrong with types list! Please try again!")
                    }

                  case _ => InternalServerError("Something went wrong with types! Please try again!")
                }
            case _ => Task.pure(InternalServerError("Something went wrong with instances! Please try again!"))
          }
      case None => Task.pure(BadRequest("Wrong body content!"))
    }

  def filterBookmarkInstances(
    bookmarkId: String,
    workspace: String,
    from: Option[Int],
    size: Option[Int],
    search: String
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .getBookmarkInstances(bookmarkId, workspace, from, size, search, request.userToken)
        .map {
          case Right(value) => Ok(value)
          case Left(error)  => error.toResult
        }
        .runToFuture
    }

  def searchInstances(
    workspace: String,
    typeId: Option[String],
    from: Option[Int],
    size: Option[Int],
    search: String
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .doSearchInstances(workspace, typeId, from, size, search, request.userToken)
        .map {
          case Right(value) => Ok(value)
          case Left(error)  => error.toResult
        }
        .runToFuture
    }

  def getInstanceGraph(id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .retrieveInstanceGraph(id, request.userToken)
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

  def getInstanceRelease(
    org: String,
    domain: String,
    datatype: String,
    version: String,
    id: String
  ): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val nexusInstanceReference = NexusInstanceReference(org, domain, datatype, version, id)
    editorService
      .retrieveInstanceRelease(nexusInstanceReference, request.userToken)
      .map {
        case Left(err)    => err.toResult
        case Right(value) => Ok(value)
      }
      .runToFuture
  }

  def postReleaseInstance(releaseTreeScope: String): Action[AnyContent] = authenticatedUserAction.async {
    implicit request =>
      val listOfIds = for {
        bodyContent <- request.body.asJson
        ids         <- bodyContent.asOpt[List[String]]
      } yield ids
      listOfIds match {
        case Some(ids) =>
          editorService
            .retrieveReleaseStatus(ids, releaseTreeScope, request.userToken)
            .map {
              case Left(err)    => err.toResult
              case Right(value) => Ok(Json.toJson(EditorResponseObject(value)))
            }
            .runToFuture
        case None => Task.pure(BadRequest("Missing body content")).runToFuture
      }

  }

  def putInstanceRelease(
    org: String,
    domain: String,
    datatype: String,
    version: String,
    id: String
  ): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val nexusInstanceReference = NexusInstanceReference(org, domain, datatype, version, id)
    editorService
      .releaseInstance(nexusInstanceReference, request.userToken)
      .map {
        case Left(err) => err.toResult
        case Right(()) => Ok("Instance has been released")
      }
      .runToFuture
  }

  def deleteInstanceRelease(
    org: String,
    domain: String,
    datatype: String,
    version: String,
    id: String
  ): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val nexusInstanceReference = NexusInstanceReference(org, domain, datatype, version, id)
    editorService
      .unreleaseInstance(nexusInstanceReference, request.userToken)
      .map {
        case Left(err) => err.toResult
        case Right(()) => Ok("Instance has been unreleased")
      }
      .runToFuture
  }

  def getQuery(): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    editorService
      .retrieveQuery(request.userToken)
      .map {
        case Left(err)    => err.toResult
        case Right(value) => Ok(value)
      }
      .runToFuture
  }

  def deleteQuery(org: String, domain: String, schema: String, version: String, queryId: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val instancePath = NexusPath(org, domain, schema, version)
      editorService
        .deleteQuery(instancePath, queryId, request.userToken)
        .map {
          case Right(()) => Ok("Deleted specification from database")
          case Left(err) => err.toResult
        }
        .runToFuture
    }

  def saveQuery(org: String, domain: String, schema: String, version: String, queryId: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val bodyContent = request.body.asJson
      val instancePath = NexusPath(org, domain, schema, version)
      bodyContent match {
        case Some(content) =>
          editorService
            .saveQuery(instancePath, queryId, content.as[JsObject], request.userToken)
            .map {
              case Right(()) => Ok("Saved specification to database")
              case Left(err) => err.toResult
            }
            .runToFuture
        case None => Task.pure(BadRequest("Missing body content")).runToFuture
      }
    }

  def getSuggestions(
    org: String,
    domain: String,
    schema: String,
    version: String,
    field: String,
    fieldType: String,
    size: Int,
    start: Int,
    search: String
  ): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val bodyContent = request.body.asJson
    val instancePath = NexusPath(org, domain, schema, version)
    bodyContent match {
      case Some(content) =>
        editorService
          .retrieveSuggestions(
            instancePath,
            field,
            fieldType,
            size,
            start,
            search,
            content.as[JsObject],
            request.userToken
          )
          .map {
            case Right(value) => Ok(value)
            case Left(err)    => err.toResult
          }
          .runToFuture
      case None => Task.pure(BadRequest("Missing body content")).runToFuture
    }
  }

  def performQuery(
    org: String,
    domain: String,
    schema: String,
    version: String,
    vocab: Option[String],
    size: Int,
    start: Int,
    databaseScope: Option[String]
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val bodyContent = request.body.asJson
      val instancePath = NexusPath(org, domain, schema, version)
      bodyContent match {
        case Some(content) =>
          editorService
            .doQuery(instancePath, vocab, size, start, databaseScope, content.as[JsObject], request.userToken)
            .map {
              case Right(value) => Ok(value)
              case Left(err)    => err.toResult
            }
            .runToFuture
        case None => Task.pure(BadRequest("Missing body content")).runToFuture
      }
    }

  class MapWrites[T]()(implicit writes: Writes[T]) extends Writes[Map[NexusPath, T]] {

    def writes(map: Map[NexusPath, T]): JsValue =
      Json.obj(map.map {
        case (s, o) =>
          val ret: (String, JsValueWrapper) = s.toString -> Json.toJson(o)
          ret
      }.toSeq: _*)
  }

  def getUiDirectivesMessages(): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    formService
      .getRegistries()
      .map { registries =>
        val instancesWithMessages = registries.formRegistry.registry
          .foldLeft(Map[NexusPath, JsObject]()) {
            case (acc, (k, v)) =>
              val m = for {
                directive <- v.uiDirective
                messages  <- (directive \ "messages").asOpt[JsObject]
              } yield messages
              m match {
                case Some(message) => acc.updated(k, message)
                case None          => acc
              }
          }

        Ok(Json.toJson(EditorResponseObject(Json.toJson(instancesWithMessages)(new MapWrites[JsObject]()))))
      }
      .runToFuture
  }

  def getInstanceNumberOfAvailableRevisions(
    org: String,
    domain: String,
    datatype: String,
    version: String,
    id: String
  ): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceRef = NexusInstanceReference(org, domain, datatype, version, id)
      formService
        .getRegistries()
        .flatMap { registries =>
          editorService
            .retrieveInstance(nexusInstanceRef, request.userToken, registries.queryRegistry)
            .flatMap[Result] {
              case Left(error) =>
                Task.pure(error.toResult)
              case Right(originalInstance) =>
                val nbRevision = (originalInstance.content \ "nxv:rev").as[JsNumber]
                Task.pure(Ok(Json.obj("available_revisions" -> nbRevision, "path" -> id)))
            }
        }
        .runToFuture
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
              .updateInstanceNew(id, body.as[JsObject], request.userToken)
              .flatMap {
                case Right(value) =>
                  val instance = (value \ "data").as[JsObject]
                  normalizeInstance(instance, request.userToken)
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
          .insertInstanceNew(id, workspace, body.as[JsObject], request.userToken)
          .flatMap {
            case Right(value) =>
              val instance = (value \ "data").as[JsObject]
              normalizeInstance(instance, request.userToken)
            case _ =>
              Task.pure(
                InternalServerError("Something went wrong with the insertion of the instance! Please try again!")
              )
          }
      case None => Task.pure(BadRequest("Missing body content"))
    }
  }

  private def normalizeInstance(instance: JsObject, token: AccessToken): Task[Result] = {
    val typesToRetrieve = InstanceHelper.getTypes(instance)
    typesToRetrieve match {
      case Some(t) =>
        editorService
          .retrieveTypesList(t, token)
          .map {
            case Right(typesWithFields) =>
              implicit val writer = InstanceProtocol.instanceWrites
              (typesWithFields \ "data").asOpt[List[StructureOfType]] match {
                case Some(typeInfoList) =>
                  val typeInfoMap = InstanceHelper.getTypeInfoMap(typeInfoList)
                  val instanceRes = InstanceHelper.getInstanceView(instance, typeInfoMap)
                  instanceRes match {
                    case Some(r) =>
                      Ok(Json.toJson(EditorResponseObject(Json.toJson(r))))
                    case _ =>
                      InternalServerError("Something went wrong retrieving the instance! Please try again!")
                  }
                case _ => InternalServerError("Something went wrong with types list! Please try again!")
              }
            case _ => InternalServerError("Something went wrong with types! Please try again!")
          }
      case _ =>
        Task.pure(InternalServerError("Something went wrong while extracting the types! Please try again!"))
    }
  }
}
