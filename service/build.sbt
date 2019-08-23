


val baseDependencies = Seq(
  "de.leanovate.play-mockws" %% "play-mockws" % "2.6.2" % Test,
  "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test,
  "org.mockito" % "mockito-core" % "2.19.0" % Test,
  "com.github.stijndehaes" %% "play-prometheus-filters" % "0.3.2",
  "org.webjars" % "swagger-ui" % "3.18.1",
  "com.iheart" %% "play-swagger" % "0.7.4",
  "org.typelevel" %% "cats-core" % "1.4.0",
  "io.monix" %% "monix" % "3.0.0-RC2",
  "org.json4s" %% "json4s-native" % "3.6.0-M3",
  "org.gnieh" %% "diffson-play-json" % "3.1.0"
)



val playDependencies = Seq(
  "com.typesafe.play" %% "play-iteratees" % "2.6.1",
  guice,
  ws,
  ehcache
)


val settings: Seq[Setting[_]] = Seq(
  organization := "eu.humanbrainproject",
  name := """kg-service""",
  version := "1.0.0-SNAPSHOT",
  scalaVersion := "2.12.7",
  libraryDependencies ++= baseDependencies
)
val playSettings = settings ++ Seq(
  resolvers ++= Seq(
    "Typesafe Simple Repository" at "http://repo.typesafe.com/typesafe/simple/maven-releases/",
    Resolver.jcenterRepo
  ),
  routesGenerator := InjectedRoutesGenerator,
  libraryDependencies ++= playDependencies
)

lazy val kg_service = (project in file("."))
  .settings(playSettings)
  .enablePlugins(PlayScala)


sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false

scalacOptions += "-Ypartial-unification"