package com.doga.receta.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.doga.receta.api.config.MedsProperties;

@SpringBootApplication
@EnableConfigurationProperties(MedsProperties.class)
public class RecetaApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecetaApiApplication.class, args);
    }
}