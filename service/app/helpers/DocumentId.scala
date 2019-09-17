package helpers

object DocumentId {

  def getIdFromPath(fullPath: String): Option[String] =
    fullPath.split("/").lastOption

}
