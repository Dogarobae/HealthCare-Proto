package com.doga.receta.api.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doga.receta.api.dto.MedicationDto;
import com.doga.receta.api.entity.Patient;
import com.doga.receta.api.repository.PatientRepository;
import com.doga.receta.api.service.MedicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository repository;
    private final MedicationService medicationService;

    public PatientController(PatientRepository repository, MedicationService medicationService) {
        this.repository = repository;
        this.medicationService = medicationService;
    }

    @GetMapping
    public List<Patient> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Patient create(@Valid @RequestBody Patient patient) {
        return repository.save(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Long id, @Valid @RequestBody Patient body) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setFullName(body.getFullName());
                    existing.setAge(body.getAge());
                    existing.setDiagnosis(body.getDiagnosis());
                    return ResponseEntity.ok(repository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/suggest-meds")
    public List<MedicationDto> suggestMeds(@PathVariable Long id) {
        Patient patient = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return medicationService.searchByName(patient.getDiagnosis());
    }
}