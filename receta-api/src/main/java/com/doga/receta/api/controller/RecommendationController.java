package com.doga.receta.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.doga.receta.api.dto.MedicationDto;
import com.doga.receta.api.service.MedicationService;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final MedicationService medicationService;

    public RecommendationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @GetMapping
    public ResponseEntity<List<MedicationDto>> recommend(@RequestParam("query") String query) {
        return ResponseEntity.ok(medicationService.searchByDiagnosis(query));
    }
}