
name := """kg-service"""
organization := "eu.humanbrainproject"

version := "1.0-SNAPSHOT"

libraryDependencies += "org.json4s" %% "json4s-native" % "3.6.0-M3"
libraryDependencies += ehcache
libraryDependencies += "org.gnieh" %% "diffson-play-json" % "3.1.0"

lazy val kg_service = (project in file("."))
  .enablePlugins(PlayScala)

Common.settings

sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false

scalacOptions += "-Ypartial-unification"