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

import actions.EditorUserAction
import javax.inject.{Inject, Singleton}
import helpers.InstanceHelper
import models.instance.InstanceProtocol._
import models.{instance, _}
import models.instance._
import models.specification.{FormRegistry, UISpec}
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
  iAMAuthService: IAMAuthService,
  formService: FormService,
  metadataService: MetadataService,
  reverseLinkService: ReverseLinkService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  implicit val s = monix.execution.Scheduler.Implicits.global

  def deleteInstance(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceReference = NexusInstanceReference(org, domain, schema, version, id)
      editorService
        .deleteInstance(nexusInstanceReference, request.userToken)
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

  private def getMetaDataByIds(
    ls: Seq[NexusInstance],
    formRegistry: FormRegistry[UISpec]
  ): List[Task[Option[JsObject]]] =
    ls.groupBy(_.id().get)
      .map {
        case (_, v) =>
          val formService: Task[Option[JsObject]] =
            FormOp.getFormStructure(v.head.nexusPath, v.head.content, formRegistry) match {
              case JsNull =>
                Task.pure(None)
              case instanceForm =>
                metadataService.getMetadata(v.head).map {
                  case Right(metadata) =>
                    Some(instanceForm.as[JsObject] ++ Json.obj("metadata" -> Json.toJson(metadata)))
                  case Left(_) =>
                    Some(instanceForm.as[JsObject])
                }
            }
          formService
      }
      .toList

  def getWorkspaceTypes(workspace: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val result = editorService
        .retrieveWorkspaceTypes(workspace)
        .map {
          case Left(err) => err.toResult
          case Right(value) =>
            val res = (value \ "data").as[List[Type]]
            Ok(Json.toJson(EditorResponseObject(Json.toJson(res))))
        }
      result.runToFuture
    }

  def getClientToken: Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      editorService
        .retrieveClientToken()
        .map {
          case Left(err)    => err.toResult
          case Right(value) => Ok(value)
        }
        .runToFuture
    }

  def getInstancesList(databaseScope: Option[String], metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(databaseScope, metadata, generateInstanceView = InstanceHelper.getInstanceView).runToFuture
    }

  def getInstancesSummary(databaseScope: Option[String], metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(databaseScope, metadata, generateInstanceView = InstanceHelper.getInstanceSummaryView).runToFuture
    }

  def getInstancesLabel(databaseScope: Option[String], metadata: Boolean): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      getInstances(databaseScope, metadata, generateInstanceView = InstanceHelper.getInstanceLabelView).runToFuture
    }

  def getInstances(
    databaseScope: Option[String],
    metadata: Boolean,
    generateInstanceView: (JsObject, Map[String, StructureOfType]) => Option[Instance]
  )(implicit request: UserRequest[AnyContent]): Task[Result] =
    InstanceHelper.extractPayloadAsList(request) match {
      case Some(ids) =>
        editorService
          .retrieveInstances(ids, request.userToken, databaseScope, metadata)
          .flatMap {
            case Right(instancesResult) =>
              val instances = InstanceHelper.extractDataAsList(instancesResult)
              val typesToRetrieve = InstanceHelper.toTypeList(instances)
              editorService
                .retrieveTypesList(typesToRetrieve.distinct, request.userToken, withFields = true)
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
                      case _ => InternalServerError("Something went wrong! Please try again!")
                    }

                  case _ => InternalServerError("Something went wrong! Please try again!")
                }
            case _ => Task.pure(InternalServerError("Something went wrong! Please try again!"))
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

  def getInstanceGraph(org: String, domain: String, datatype: String, version: String, id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceReference = NexusInstanceReference(org, domain, datatype, version, id)
      editorService
        .retrieveInstanceGraph(nexusInstanceReference, request.userToken)
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
    * @param org     The organization of the instance
    * @param domain  The domain of the instance
    * @param schema  The schema of the instance
    * @param version The version of the schema
    * @param id      The id of the instance
    * @return A result with the instance updated or an error message
    */
  def updateInstance(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    (authenticatedUserAction andThen EditorUserAction.editorUserWriteAction(org, config.editorPrefix, iAMAuthService))
      .async { implicit request =>
        val instanceRef = NexusInstanceReference(org, domain, schema, version, id)
        editorService
          .updateInstanceFromForm(instanceRef, request.body.asJson, request.user, request.userToken, reverseLinkService)
          .flatMap {
            case Right(()) =>
              formService.getRegistries().flatMap { registries =>
                editorService
                  .retrieveInstance(instanceRef, request.userToken, registries.queryRegistry)
                  .flatMap {
                    case Right(instance) =>
                      FormOp
                        .getFormStructure(instanceRef.nexusPath, instance.content, registries.formRegistry) match {
                        case JsNull =>
                          Task.pure(NotImplemented("Form not implemented"))
                        case instanceForm =>
                          val specFlush = formService.shouldReloadSpecification(instanceRef.nexusPath).flatMap {
                            shouldReload =>
                              if (shouldReload) {
                                formService.flushSpec()
                              } else {
                                Task.pure(())
                              }
                          }
                          specFlush.map { _ =>
                            Ok(Json.toJson(EditorResponseObject(instanceForm.as[JsObject])))
                          }
                      }
                    case Left(error) =>
                      logger.error(error.toString)
                      Task.pure(error.toResult)
                  }
              }
            case Left(error) =>
              logger.error(error.content.mkString("\n"))
              Task.pure(error.toResult)
          }
          .runToFuture
      }

  /**
    * Creation of a new instance in the editor
    *
    * @param org     The organization of the instance
    * @param domain  The domain of the instance
    * @param schema  The schema of the instance
    * @param version The version of the schema
    * @return 201 Created
    */
  def createInstance(org: String, domain: String, schema: String, version: String): Action[AnyContent] =
    (authenticatedUserAction andThen EditorUserAction.editorUserWriteAction(org, config.editorPrefix, iAMAuthService))
      .async { implicit request =>
        val instancePath = NexusPath(org, domain, schema, version)
        editorService
          .insertInstance(NexusInstance(None, instancePath, Json.obj()), Some(request.user), request.userToken)
          .flatMap[Result] {
            case Left(error) => Task.pure(error.toResult)
            case Right(ref) =>
              request.body.asJson match {
                case Some(content) =>
                  formService.getRegistries().flatMap { registries =>
                    val nonEmptyInstance = FormOp.buildNewInstanceFromForm(
                      ref,
                      config.nexusEndpoint,
                      content.as[JsObject],
                      registries.formRegistry
                    )
                    editorService
                      .updateInstance(nonEmptyInstance, ref, request.userToken, request.user.id)
                      .flatMap[Result] {
                        case Right(()) =>
                          val specFlush = formService.shouldReloadSpecification(instancePath).flatMap { shouldReload =>
                            if (shouldReload) {
                              formService.flushSpec()
                            } else {
                              Task.pure(())
                            }
                          }
                          specFlush.map { _ =>
                            Created(Json.toJson(EditorResponseObject(Json.toJson(ref))))
                          }
                        case Left(error) => Task.pure(error.toResult)
                      }
                  }
                case None => Task.pure(Created(Json.toJson(EditorResponseObject(Json.toJson(ref)))))
              }
          }
          .runToFuture
      }

  /**
    * Returns an empty form for a specific instance type
    *
    * @param org     The organization of the instance
    * @param domain  The domain of the instance
    * @param schema  The schema of the instance
    * @param version The version of the schema
    * @return 200
    */
  def getEmptyForm(org: String, domain: String, schema: String, version: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusPath = NexusPath(org, domain, schema, version)
      formService
        .getRegistries()
        .map { registries =>
          val form = FormOp.getFormStructure(nexusPath, JsNull, registries.formRegistry)
          Ok(form)
        }
        .runToFuture
    }

}
