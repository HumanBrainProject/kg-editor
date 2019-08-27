val library = new {

  val Version = new {
    val cats = "2.0.0-RC1"
    val playScalaTest = "3.1.2"
    val mockitoCore = "2.19.0"
    val playMockWs = "2.6.2"
    val swaggerUi = "3.18.1"
    val monix = "3.0.0-RC2"
    val json4s = "3.6.0-M3"
    val diffPlayJson = "3.1.0"
    val playIteratee = "2.6.1"
    val playSwagger = "0.7.4"
  }

  val cats = "org.typelevel" %% "cats-core" % Version.cats
  val playScalaTest = "org.scalatestplus.play" %% "scalatestplus-play" % Version.playScalaTest
  val mockitoCore = "org.mockito" % "mockito-core" % Version.mockitoCore
  val playMockWs = "de.leanovate.play-mockws" %% "play-mockws" % Version.playMockWs
  val swaggerUi = "org.webjars" % "swagger-ui" % Version.swaggerUi
  val playSwagger = "com.iheart" %% "play-swagger" % Version.playSwagger
  val monix = "io.monix" %% "monix" % Version.monix
  val json4s = "org.json4s" %% "json4s-native" % Version.json4s
  val diffPlayJson = "org.gnieh" %% "diffson-play-json" % Version.diffPlayJson
  val playIteratee = "com.typesafe.play" %% "play-iteratees" % Version.playIteratee
}

val baseDependencies = Seq(
  library.playMockWs % Test,
  library.playScalaTest % Test,
  library.mockitoCore % Test,
  library.monix,
  library.playSwagger,
  library.cats,
  library.json4s,
  library.diffPlayJson,
  library.playIteratee,
  guice,
  ws,
  ehcache
)


val scalacOptionsCompile = Seq(
  "-Ypartial-unification",
)
val scalacOptionsAll = Seq(
  "-encoding", "UTF-8",
  "-unchecked",
  "-deprecation",
  "-Xfuture",
  "-Yno-adapted-args",
  "-Ywarn-dead-code",
  "-Ywarn-numeric-widen",
  "-Ywarn-value-discard",
  "-Ywarn-unused"
)
val settings: Seq[Setting[_]] = Seq(
  organization := "eu.humanbrainproject",
  name := """kg-service""",
  version := "1.0.0-SNAPSHOT",
  scalaVersion := "2.12.9",
  libraryDependencies ++= baseDependencies,
  resolvers ++= Seq(
    "Typesafe Simple Repository" at "http://repo.typesafe.com/typesafe/simple/maven-releases/",
    Resolver.jcenterRepo
  ),
  routesGenerator := InjectedRoutesGenerator,
  scalacOptions ++= scalacOptionsCompile ++scalacOptionsAll

)

lazy val kg_service = (project in file("."))
  .settings(settings)
  .enablePlugins(PlayScala)

sources in (Compile, doc) := Seq.empty

publishArtifact in (Compile, packageDoc) := false
