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
import sbt._
import Keys._
import play.sbt.PlayImport._
import play.sbt.routes.RoutesKeys.routesGenerator
import play.routes.compiler.InjectedRoutesGenerator

object Common {

  val scalacOptionsAll = Seq(
    "-encoding",
    "UTF-8",
    "-unchecked",
    "-deprecation",
    "-Xfuture",
    "-Ywarn-dead-code",
    "-Ywarn-numeric-widen",
    "-Ywarn-value-discard",
    "-Ywarn-unused",
    "-Yno-adapted-args",
    "-Ypartial-unification"
  )

  val baseDependencies = Seq(
    "de.leanovate.play-mockws" %% "play-mockws" % "2.6.2" % Test,
    "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test,
    "org.mockito" % "mockito-core" % "2.19.0" % Test,
    "org.webjars" % "swagger-ui" % "3.18.1",
    "com.iheart" %% "play-swagger" % "0.7.4",
    "org.typelevel" %% "cats-core" % "1.4.0",
    "io.monix" %% "monix" % "3.0.0-RC2"
  )

  val settings: Seq[Setting[_]] = Seq(
    organization := "eu.humanbrainproject",
    version := "1.0.0-SNAPSHOT",
    scalaVersion := "2.12.7",
    libraryDependencies ++= baseDependencies,
    scalacOptions ++= scalacOptionsAll
  )

  val playDependencies = Seq(
    "com.typesafe.play" %% "play-iteratees" % "2.6.1",
    guice,
    ws
  )

  val playSettings = settings ++ Seq(
    resolvers ++= Seq(
      "Typesafe Simple Repository" at "https://repo.typesafe.com/typesafe/simple/maven-releases/",
      Resolver.jcenterRepo
    ),
    routesGenerator := InjectedRoutesGenerator,
    libraryDependencies ++= playDependencies
  )
}
