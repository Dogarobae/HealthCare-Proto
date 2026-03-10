package com.doga.receta.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.doga.receta.api.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}