package com.doga.receta.api.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.doga.receta.api.config.MedsProperties;
import com.doga.receta.api.dto.MedicationDto;
import com.doga.receta.api.dto.OpenFdaResponse;

@Service
public class MedicationService {

    private final RestClient client;

    public MedicationService(MedsProperties props) {
        this.client = RestClient.builder()
                .baseUrl(props.baseUrl()) // https://api.fda.gov/drug
                .build();
    }

    /**
     * Recomendación por síntoma/diagnóstico usando OpenFDA.
     * Busca coincidencias en indications_and_usage.
     */
    public List<MedicationDto> searchByDiagnosis(String diagnosis) {
        String diag = diagnosis == null ? "" : diagnosis.trim();
        if (diag.isBlank()) return List.of();

        String q = "indications_and_usage:\"" + diag.replace("\"", "") + "\"";

        try {
            OpenFdaResponse resp = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/label.json")
                            .queryParam("search", q)
                            .queryParam("limit", 10)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(OpenFdaResponse.class);

            return mapToDtos(resp);

        } catch (Exception e) {
            System.out.println("[OpenFDA ERROR searchByDiagnosis] " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Búsqueda por nombre comercial (brand_name) en OpenFDA.
     * Esto lo usan algunos controllers existentes.
     */
    public List<MedicationDto> searchByName(String name) {
        String n = name == null ? "" : name.trim();
        if (n.isBlank()) return List.of();

        String q = "openfda.brand_name:\"" + n.replace("\"", "") + "\"";

        try {
            OpenFdaResponse resp = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/label.json")
                            .queryParam("search", q)
                            .queryParam("limit", 10)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(OpenFdaResponse.class);

            return mapToDtos(resp);

        } catch (Exception e) {
            System.out.println("[OpenFDA ERROR searchByName] " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return List.of();
        }
    }

    private List<MedicationDto> mapToDtos(OpenFdaResponse resp) {
        if (resp == null || resp.results() == null) return List.of();

        List<MedicationDto> out = new ArrayList<>();

        for (var r : resp.results()) {
            if (r == null) continue;

            var fda = r.openfda();
            if (fda == null) continue;

            String brand = (fda.brand_name() != null && !fda.brand_name().isEmpty())
                    ? fda.brand_name().get(0)
                    : null;

            String generic = (fda.generic_name() != null && !fda.generic_name().isEmpty())
                    ? fda.generic_name().get(0)
                    : null;

            String nameOut = (brand != null && !brand.isBlank()) ? brand : generic;
            if (nameOut == null || nameOut.isBlank()) continue;

            out.add(new MedicationDto(nameOut, generic));
        }

        return out;
    }
}