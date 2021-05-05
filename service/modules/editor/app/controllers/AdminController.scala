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
package controllers

import com.google.inject.Inject
import models.{Cache, EditorUserCache, MetadataCache, UserInfoCache}
import monix.eval.Task
import play.api.Logger
import play.api.cache.AsyncCacheApi
import play.api.mvc._
import play.cache.NamedCache
import services.CacheService
import services.specification.FormService

class AdminController @Inject()(
  cc: ControllerComponents,
  @NamedCache("editor-userinfo-cache") editorCache: AsyncCacheApi,
  @NamedCache("userinfo-cache") userCache: AsyncCacheApi,
  @NamedCache("editor-metadata-cache") metadataCache: AsyncCacheApi,
  formService: FormService
) extends AbstractController(cc) {
  val log = Logger(this.getClass)
  object cacheService extends CacheService
  implicit val scheduler = monix.execution.Scheduler.Implicits.global

  def clearCache(name: String): Action[AnyContent] = Action.async { implicit request =>
    Cache
      .fromString(name)
      .fold(Task.pure(NotFound("Cache not found"))) {
        case EditorUserCache => cacheService.clearCache(editorCache).map(_ => Ok("Cache cleared"))
        case UserInfoCache   => cacheService.clearCache(userCache).map(_ => Ok("Cache cleared"))
        case MetadataCache   => cacheService.clearCache(metadataCache).map(_ => Ok("Cache cleared"))
      }
      .runToFuture
  }

  def deleteAndReloadSpecs: Action[AnyContent] = Action.async { implicit request =>
    formService
      .flushSpec()
      .map { _ =>
        Ok("Specification reloaded")
      }
      .runToFuture
  }

}
