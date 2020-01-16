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

package services

import com.google.inject.Inject
import constants._
import helpers._
import models.errors.{APIEditorError, APIEditorMultiError}
import models.instance._
import models.specification.{FormRegistry, QuerySpec, UISpec}
import models.user.UNSAFE_User
import models.{AccessToken, NexusPath}
import monix.eval.Task
import org.joda.time.DateTime
import play.api.Logger
import play.api.http.Status._
import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import play.api.libs.ws.WSClient
import services.query.{QueryApiParameter, QueryService}
import services.specification.{FormOp}

class EditorService @Inject()(wSClient: WSClient, configuration: ConfigurationServiceLive) {

  val logger = Logger(this.getClass)

  object instanceAPIService extends InstanceAPIService

  object queryService extends QueryService

  def getInstance(
    id: String,
    token: AccessToken,
    metadata: Boolean,
    returnPermissions: Boolean,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .getInstance(wSClient, configuration.kgCoreEndpoint, id, token, metadata, returnPermissions, clientToken)
      .map {
        case Right(ref) => Right(ref)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }

  def retrieveInstanceGraph(
    id: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] = {
    val result = instanceAPIService
      .getGraph(wSClient, configuration.kgCoreEndpoint, id, token, clientToken)
    result.map {
      case Right(ref) => Right(ref)
      case Left(res)  => Left(APIEditorError(res.status, res.body))
    }
  }

  def doSearchInstances(
    typeId: String,
    from: Option[Int],
    size: Option[Int],
    searchByLabel: String,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .searchInstances(wSClient, configuration.kgCoreEndpoint, from, size, typeId, searchByLabel, token, clientToken)
      .map {
        case Right(res) => Right(res)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }

  def retrieveSuggestions(
    id: String,
    field: String,
    `type`: Option[String],
    size: Int,
    start: Int,
    search: String,
    payload: JsObject,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .postSuggestions(
        wSClient,
        configuration.kgCoreEndpoint,
        token,
        id,
        field,
        `type`,
        size,
        start,
        search,
        payload,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }

  def insertInstanceNew(
    id: Option[String],
    workspace: String,
    body: JsObject,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .postNew(wSClient, configuration.kgCoreEndpoint, id, workspace, body, token, clientToken)
      .map {
        case Right(ref) => Right(ref)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }

  //TODO: Deprecate this one and use insertInstanceNew
  def insertInstance(
    newInstance: NexusInstance,
    user: Option[UNSAFE_User],
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, NexusInstanceReference]] = {
    val modifiedContent =
      FormOp.removeClientKeysCorrectLinks(newInstance.content.as[JsValue], configuration.nexusEndpoint)
    instanceAPIService
      .post(
        wSClient,
        configuration.kgQueryEndpoint,
        newInstance.copy(content = modifiedContent),
        user.map(_.id),
        token,
        clientToken
      )
      .map {
        case Right(ref) => Right(ref)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }
  }

  /**
    * Updating an instance
    *
    * @param diffInstance           The diff of the current instance and its modification
    * @param nexusInstanceReference The reference of the instance to update
    * @param token                  the user token
    * @param userId                 the id of the user sending the update
    * @return The updated instance
    */
  def updateInstance(
    diffInstance: EditorInstance,
    nexusInstanceReference: NexusInstanceReference,
    token: AccessToken,
    userId: String,
    clientToken: String
  ): Task[Either[APIEditorError, Unit]] = {
    val contentWithUpdatedTimeStamp = diffInstance.nexusInstance.content.value
    val content =
      Json
        .toJson(
          contentWithUpdatedTimeStamp
            .updated(SchemaFieldsConstants.lastUpdate, Json.toJson(new DateTime().toDateTimeISO.toString))
        )
        .as[JsObject]
    instanceAPIService
      .put(
        wSClient,
        configuration.kgQueryEndpoint,
        nexusInstanceReference,
        diffInstance.copy(nexusInstance = diffInstance.nexusInstance.copy(content = content)),
        token,
        userId,
        clientToken
      )
      .map {
        case Left(res) => Left(APIEditorError(res.status, res.body))
        case Right(()) => Right(())
      }
  }

  def updateInstanceNew(
    id: String,
    body: JsObject,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .updateInstance(wSClient, configuration.kgCoreEndpoint, id, body, token, clientToken)
      .map {
        case Right(ref) => Right(ref)
        case Left(res)  => Left(APIEditorError(res.status, res.body))
      }

  /**
    * Return a instance by its nexus ID
    * Starting by checking if this instance is coming from a reconciled space.
    * Otherwise we try to return the instance from the original organization
    *
    * @param nexusInstanceReference The reference to the instace to retrieve
    * @param token                  The user access token
    * @return An error response or an the instance
    */
  def retrieveInstance(
    nexusInstanceReference: NexusInstanceReference,
    token: AccessToken,
    queryRegistry: FormRegistry[QuerySpec],
    databaseScope: Option[String] = None,
    clientToken: String
  ): Task[Either[APIEditorError, NexusInstance]] =
    queryRegistry.registry.get(nexusInstanceReference.nexusPath) match {
      case Some(querySpec) =>
        queryService
          .getInstancesWithId(
            wSClient,
            configuration.kgQueryEndpoint,
            nexusInstanceReference,
            querySpec,
            token,
            QueryApiParameter(vocab = Some(EditorConstants.EDITORVOCAB), databaseScope = databaseScope)
          )
          .map { res =>
            res.status match {
              case OK =>
                Right(
                  NexusInstance(
                    Some(nexusInstanceReference.id),
                    nexusInstanceReference.nexusPath,
                    res.json.as[JsObject]
                  )
                )
              case _ => Left(APIEditorError(res.status, res.body))
            }
          }
      case None =>
        instanceAPIService
          .get(wSClient, configuration.kgQueryEndpoint, nexusInstanceReference, token, clientToken)
          .map {
            case Left(res)       => Left(APIEditorError(res.status, res.body))
            case Right(instance) => Right(instance)
          }
    }

  def deleteLinkingInstance(
    from: NexusInstanceReference,
    to: NexusInstanceReference,
    linkingInstancePath: NexusPath,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorMultiError, Unit]] =
    instanceAPIService
      .getLinkingInstance(wSClient, configuration.kgQueryEndpoint, from, to, linkingInstancePath, token, clientToken)
      .flatMap {
        case Right(ls) =>
          Task
            .gather(
              ls.map(
                l =>
                  instanceAPIService
                    .delete(wSClient, configuration.kgQueryEndpoint, l, token, clientToken)
                    .map[Either[APIEditorError, Unit]] {
                      case Left(res) => Left(APIEditorError(res.status, res.body))
                      case Right(_)  => Right(())
                    }
              )
            )
            .map { f =>
              val errors = f.filter(_.isLeft)
              if (errors.isEmpty) {
                Right(())
              } else {
                Left(APIEditorMultiError(INTERNAL_SERVER_ERROR, errors.map(_.swap.toOption.get)))
              }
            }
        case Left(res) => Task.pure(Left(APIEditorMultiError.fromResponse(res.status, res.body)))
      }

  /**
    * Update the reverse instance
    *
    * @param instanceRef      The reference to the instance being updated
    * @param updateToBeStored The instance being updated
    * @param user             The current user
    * @param token            The user token
    * @return
    */
  def processInstanceUpdate(
    instanceRef: NexusInstanceReference,
    updateToBeStored: EditorInstance,
    user: UNSAFE_User,
    token: AccessToken,
    clientToken: String
  ): Task[Either[APIEditorMultiError, Unit]] =
    instanceAPIService
      .get(wSClient, configuration.kgQueryEndpoint, instanceRef, token, clientToken, Some(user.id))
      .flatMap {
        case Left(res) =>
          res.status match {
            case NOT_FOUND =>
              updateInstance(updateToBeStored, instanceRef, token, user.id, clientToken).map {
                case Left(err) => Left(APIEditorMultiError(err.status, List(err)))
                case Right(()) => Right(())
              }
            case _ =>
              Task.pure(Left(APIEditorMultiError.fromResponse(res.status, res.body)))
          }
        case Right(instance) =>
          val mergeInstanceWithPreviousUserUpdate = EditorInstance(
            InstanceOp
              .removeInternalFields(instance)
              .merge(updateToBeStored.nexusInstance)
          )
          updateInstance(mergeInstanceWithPreviousUserUpdate, instanceRef, token, user.id, clientToken).map {
            case Left(err) => Left(APIEditorMultiError(err.status, List(err)))
            case Right(()) => Right(())
          }
      }

  def retrieveInstances(
    instanceIds: List[String],
    token: AccessToken,
    stage: String,
    metadata: Boolean,
    returnAlternatives: Boolean,
    returnPermissions: Boolean,
    returnEmbedded: Boolean,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .getInstances(
        wSClient,
        configuration.kgCoreEndpoint,
        token,
        instanceIds,
        stage,
        metadata,
        returnAlternatives,
        returnPermissions,
        returnEmbedded,
        clientToken
      )
      .map {
        case Right(value) => Right(value)
        case Left(res)    => Left(APIEditorError(res.status, res.body))
      }

  def retrieveTypes(
    typeOfInstance: String,
    token: AccessToken,
    metadata: Boolean,
    clientToken: String
  ): Task[Either[APIEditorError, JsObject]] =
    instanceAPIService
      .getInstancesByType(wSClient, configuration.kgCoreEndpoint, token, typeOfInstance, metadata, clientToken)
      .map {
        case Right(value) => Right(value)
        case Left(res)    => Left(APIEditorError(res.status, res.body))
      }

  def deleteInstance(id: String, token: AccessToken, clientToken: String): Task[Either[APIEditorError, Unit]] =
    instanceAPIService.deleteEditorInstance(wSClient, configuration.kgCoreEndpoint, id, token, clientToken)

}

object EditorService {

  val atId = "@id"
  val relativeURL = s"${EditorConstants.BASENAMESPACE}${EditorConstants.RELATIVEURL}"
  val editorId = s"${EditorConstants.EDITORVOCAB}id"
  val simpleId = "id"

  def computeUpdateTobeStored(
    currentInstanceDisplayed: NexusInstance,
    updateFromUser: JsValue,
    nexusEndpoint: String
  ): EditorInstance = {
    val cleanedOriginalInstance =
      InstanceOp.removeInternalFields(currentInstanceDisplayed)
    val instanceUpdateFromUser =
      FormOp.buildInstanceFromForm(cleanedOriginalInstance, updateFromUser, nexusEndpoint)
    val currentInstanceWithSameFormatAsNewValue =
      FormOp.removeClientKeysCorrectLinks(cleanedOriginalInstance.content, nexusEndpoint)
    val diff = InstanceOp.buildDiffEntity(
      cleanedOriginalInstance.copy(content = currentInstanceWithSameFormatAsNewValue),
      instanceUpdateFromUser
    )
    InstanceOp.removeEmptyFieldsNotInOriginal(cleanedOriginalInstance, diff)
  }

}
