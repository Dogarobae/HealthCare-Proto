package com.doga.receta.api.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenFdaResponse(List<Result> results) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Result(OpenFda openfda) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OpenFda(List<String> brand_name, List<String> generic_name) {}
}