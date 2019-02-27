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
import cats.data.EitherT
import constants.SchemaFieldsConstants
import helpers._
import javax.inject.{Inject, Singleton}
import models._
import models.instance._
import play.api.Logger
import play.api.libs.json.Reads._
import play.api.libs.json._
import play.api.mvc._
import services._
import services.specification.FormService

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class NexusEditorController @Inject()(
  cc: ControllerComponents,
  authenticatedUserAction: AuthenticatedUserAction,
  editorService: EditorService,
  oIDCAuthService: OIDCAuthService,
  config: ConfigurationService,
  nexusService: NexusService,
  iAMAuthService: IAMAuthService,
  formService: FormService,
  metadataService: MetadataService,
  reverseLinkService: ReverseLinkService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  val logger = Logger(this.getClass)

  /**
    * Return a instance by its nexus ID
    * The response is sent with a json object "back_link" with the path of the schema of the instance
    * if the schema exists returns e.g myorg/mydomain/myschema otherwise returns an empty string
    *
    * @param org The organization of the instance
    * @param domain The domain of the instance
    * @param schema The schema of the instance
    * @param version The version of the schema
    * @param id The id of the instance
    * @return An error message with a back_link or a form configuration populated with the instance information
    */

  def getInstance(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val nexusInstanceReference = NexusInstanceReference(org, domain, schema, version, id)
      editorService.retrieveInstance(nexusInstanceReference, request.userToken, formService.queryRegistry).flatMap {
        case Left(error) =>
          logger.error(
            s"Error: Could not fetch instance : ${nexusInstanceReference.nexusPath.toString()}/$id - ${error.content}"
          )
          Future(error.toResult)
        case Right(instance) =>
          FormService
            .getFormStructure(nexusInstanceReference.nexusPath, instance.content, formService.formRegistry) match {
            case JsNull =>
              Future(NotImplemented("Form not implemented"))
            case instanceForm =>
              metadataService.getMetadata(nexusInstanceReference, instance).map {
                case Right(metadata) =>
                  Ok(
                    Json.toJson(
                      EditorResponseObject(instanceForm.as[JsObject] ++ Json.obj("metadata" -> Json.toJson(metadata)))
                    )
                  )
                case Left(error) =>
                  logger.error(error.toString)
                  Ok(Json.toJson(EditorResponseObject(instanceForm.as[JsObject])))
              }
          }
      }
    }

  def deleteInstance(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    authenticatedUserAction.async { implicit request =>
      val token = OIDCHelper.getTokenFromRequest(request)
      val nexusInstanceReference = NexusInstanceReference(org, domain, schema, version, id)
      editorService.deleteInstance(nexusInstanceReference, token).map {
        case Right(()) => Ok("Instance has been deleted")
        case Left(err) => err.toResult
      }
    }

  def getInstancesByIds(allFields: Boolean): Action[AnyContent] = authenticatedUserAction.async { implicit request =>
    val listOfIds = for {
      bodyContent <- request.body.asJson
      ids         <- bodyContent.asOpt[List[String]]
    } yield ids.map(NexusInstanceReference.fromUrl)

    listOfIds match {
      case Some(ids) =>
        if (allFields) {
          editorService.retrieveInstancesByIds(ids, formService.queryRegistry, request.userToken).map {
            case Left(err) => err.toResult
            case Right(ls) =>
              Ok(Json.toJson(EditorResponseObject(Json.toJson(ls.groupBy(_.id().get).map {
                case (k, v) =>
                  FormService
                    .getFormStructure(v.head.nexusPath, v.head.content, formService.formRegistry)
                    .as[JsObject]
              }))))
          }
        } else {
          editorService.retrievePreviewInstancesByIds(ids, formService.queryRegistry, request.userToken).map {
            case Left(err)                        => err.toResult
            case Right(ls: List[PreviewInstance]) => Ok(Json.toJson(EditorResponseObject(Json.toJson(ls))))
          }
        }
      case None => Future(BadRequest("Missing body content"))
    }
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
      editorService.retrieveInstance(nexusInstanceRef, request.userToken, formService.queryRegistry).flatMap[Result] {
        case Left(error) =>
          Future.successful(
            error.toResult
          )
        case Right(originalInstance) =>
          val nbRevision = (originalInstance.content \ "nxv:rev").as[JsNumber]
          Future.successful(Ok(Json.obj("available_revisions" -> nbRevision, "path" -> id)))
      }
    }

  def getSpecificReconciledInstance(
    org: String,
    domain: String,
    schema: String,
    version: String,
    id: String,
    revision: Int
  ): Action[AnyContent] = Action.async { implicit request =>
//    val token = request.headers.get("Authorization").getOrElse("")
//    val nexusPath = NexusPath(org, domain, schema, version)
//    editorService.retrieveInstance(nexusPath, id, token, List(("fields", "all"),("deprecated", "false"),("rev", revision.toString))).map {
//      case Right(instance) =>
//        val json = instance.content
//        val nexusId = NexusInstance.getIdForEditor((json \ "http://hbp.eu/reconciled#original_parent" \ "@id").as[String], config.reconciledPrefix)
//        val datatype = nexusId.splitAt(nexusId.lastIndexOf("/"))
//        val originalDatatype = NexusPath(datatype._1.split("/").toList)
//        FormService.getFormStructure(originalDatatype, json, config.reconciledPrefix, formService.formRegistry) match {
//          case JsNull =>
//            NotImplemented(
//              NavigationHelper.errorMessageWithBackLink(
//                "Form not implemented",
//                NavigationHelper.generateBackLink(nexusPath, config.reconciledPrefix, formService)
//              )
//            )
//          case instanceContent => Ok(
//            NavigationHelper.resultWithBackLink(
//              EditorResponseObject(instanceContent),
//              nexusPath,
//              config.reconciledPrefix,
//              formService
//            )
//          )
//        }
//      case Left(response) =>
//        EditorResponseHelper.errorResultWithBackLink(response.status, response.headers, response.body, nexusPath, config.reconciledPrefix, formService)
//    }
//
    ???
  }

  /**
    * Entry point when updating an instance
    * @param org The organization of the instance
    * @param domain The domain of the instance
    * @param schema The schema of the instance
    * @param version The version of the schema
    * @param id The id of the instance
    * @return A result with the instance updated or an error message
    */
  def updateInstance(org: String, domain: String, schema: String, version: String, id: String): Action[AnyContent] =
    (authenticatedUserAction andThen EditorUserAction.editorUserWriteAction(org, config.editorPrefix, iAMAuthService))
      .async { implicit request =>
        val instanceRef = NexusInstanceReference(org, domain, schema, version, id)
        editorService
          .updateInstanceFromForm(instanceRef, request.body.asJson, request.user, request.userToken, reverseLinkService)
          .map {
            case Right(()) =>
              Ok(Json.toJson(EditorResponseObject.empty))
            case Left(error) =>
              logger.error(error.content.mkString("\n"))
              error.toResult
          }
      }

  /**
    * Creation of a new instance in the editor
    * @param org The organization of the instance
    * @param domain The domain of the instance
    * @param schema The schema of the instance
    * @param version The version of the schema
    * @return 201 Created
    */
  def createInstance(
    org: String,
    domain: String,
    schema: String,
    version: String
  ): Action[AnyContent] =
    (authenticatedUserAction andThen EditorUserAction.editorUserWriteAction(org, config.editorPrefix, iAMAuthService))
      .async { implicit request =>
        val instancePath = NexusPath(org, domain, schema, version)
        editorService
          .insertInstance(NexusInstance(None, instancePath, Json.obj()), Some(request.user), request.userToken)
          .flatMap[Result] {
            case Left(error) => Future(error.toResult)
            case Right(ref) =>
              request.body.asJson match {
                case Some(content) =>
                  val nonEmptyInstance = FormService.buildNewInstanceFromForm(
                    ref,
                    config.nexusEndpoint,
                    content.as[JsObject],
                    formService.formRegistry
                  )
                  editorService.updateInstance(nonEmptyInstance, ref, request.userToken, request.user.id).map[Result] {
                    case Left(error) => error.toResult
                    case Right(())   => Created(Json.toJson(EditorResponseObject(Json.toJson(ref))))
                  }
                case None => Future(Created(Json.toJson(EditorResponseObject(Json.toJson(ref)))))
              }
          }
      }

  /**
    * Returns an empty form for a specific instance type
    * @param org The organization of the instance
    * @param domain The domain of the instance
    * @param schema The schema of the instance
    * @param version The version of the schema
    * @return 200
    */
  def getEmptyForm(org: String, domain: String, schema: String, version: String): Action[AnyContent] =
    authenticatedUserAction { implicit request =>
      val nexusPath = NexusPath(org, domain, schema, version)
      val form = FormService.getFormStructure(nexusPath, JsNull, formService.formRegistry)
      Ok(form)
    }

}