/*
 * Copyright 2020 EPFL/Human Brain Project PCO
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package eu.ebrains.kg.service.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class KGCoreResult<T> {

    public static class Single extends KGCoreResult<Map<String, Object>>{}

    public static class List extends KGCoreResult<java.util.List<Map<String, Object>>>{}

    private T data;
    private String message;
    private Error error;
    private Integer total;
    private Integer size;
    private Integer from;

    public KGCoreResult<T> setData(T data) {
        this.data = data;
        return this;
    }

    public KGCoreResult<T>  setMessage(String message) {
        this.message = message;
        return this;
    }

    public KGCoreResult<T>  setError(Error error) {
        this.error = error;
        return this;
    }

    public Integer getTotal() {
        return total;
    }

    @JsonProperty("totalResults")
    public KGCoreResult<T> setTotalResults(Integer total) {
        this.total = total;
        return this;
    }

    public Integer getSize() {
        return size;
    }

    public KGCoreResult<T> setSize(Integer size) {
        this.size = size;
        return this;
    }

    public Integer getFrom() {
        return from;
    }

    public KGCoreResult<T> setFrom(Integer from) {
        this.from = from;
        return this;
    }


    public T getData() {
        return data;
    }

    public Error getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }
}
