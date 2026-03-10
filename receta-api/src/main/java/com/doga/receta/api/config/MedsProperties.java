package com.doga.receta.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external.meds")
public record MedsProperties(String baseUrl) {}