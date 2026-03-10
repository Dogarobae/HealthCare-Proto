import { useEffect, useState, useCallback } from "react";
import RegisterProblem from "../components/RegisterProblem";
import PatientTable from "../components/PatientTable";
import MedicationSuggestion from "../components/MedicationSuggestion";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState("");

  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");

  const reloadPatients = useCallback(async () => {
    setPatientsLoading(true);
    setPatientsError("");
    try {
      const r = await fetch("/api/patients");
      if (!r.ok) throw new Error("Error " + r.status);
      const data = await r.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      setPatients([]);
      setPatientsError(e.message || "Error cargando pacientes");
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadPatients();
  }, [reloadPatients]);

  return (
    <div className="dashboard">
      <header className="dashHeader">
        <div>
          <h1 className="dashTitle">Receta.ai 1.0</h1>
          <p className="dashSub">Gestión básica de pacientes y sugerencias de medicamentos (Fase Beta)</p>
        </div>
      </header>

      <div className="grid2">
        <RegisterProblem
          patients={patients}
          onCreated={reloadPatients}
          onRecommend={setRecommended}
          onRecLoading={setRecLoading}
          onRecError={setRecError}
        />

        <MedicationSuggestion items={recommended} loading={recLoading} error={recError} />
      </div>

      <div className="grid2">
        <PatientTable
          patients={patients}
          loading={patientsLoading}
          error={patientsError}
          onRefresh={reloadPatients}
        />
      </div>
    </div>
  );
}