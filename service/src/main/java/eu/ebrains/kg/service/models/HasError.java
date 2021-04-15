package eu.ebrains.kg.service.models;

public interface HasError {

    void setError(Error error);
    Error getError();

}
