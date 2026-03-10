import { useMemo, useState } from "react";
import AdminAuthModal from "./AdminAuthModal";
import { getAdminAuth, setAdminAuth } from "../auth/adminSession";

export default function RegisterProblem({
  onRecommend,
  onCreated,
  onRecLoading,
  onRecError,
  patients = [],
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(""); // opcional
  const [symptoms, setSymptoms] = useState("");

  const [showSug, setShowSug] = useState(true);
  const [loading, setLoading] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);

  const diagnosisList = useMemo(() => {
    const set = new Set();
    for (const p of patients) {
      const d = (p?.diagnosis || "").trim();
      if (d) set.add(d);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [patients]);

  const suggestions = useMemo(() => {
    const q = symptoms.trim().toLowerCase();
    if (!q) return [];
    return diagnosisList.filter((d) => d.toLowerCase().includes(q)).slice(0, 6);
  }, [symptoms, diagnosisList]);

  const pickSuggestion = (value) => {
    setSymptoms(value);
    setShowSug(false);
  };

  async function doRegister(authHeader) {
    const fullName = name.trim();
    const diagnosis = symptoms.trim();
    const ageNum = age ? Number(age) : null;

    if (!fullName || !diagnosis) return;

    setLoading(true);
    onRecError?.("");
    onRecLoading?.(true);

    try {
      // 1) crear paciente (ADMIN)
      const createRes = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          fullName,
          age: ageNum,
          diagnosis,
        }),
      });

      if (createRes.status === 401 || createRes.status === 403) {
        throw new Error("No autorizado (admin).");
      }
      if (!createRes.ok) throw new Error("Error creando paciente: " + createRes.status);

      await onCreated?.();

      // 2) recomendaciones (GET público)
      const recRes = await fetch(`/api/recommendations?query=${encodeURIComponent(diagnosis)}`);
      if (!recRes.ok) throw new Error("Error recomendaciones: " + recRes.status);
      const recData = await recRes.json();
      onRecommend(Array.isArray(recData) ? recData : []);
    } catch (e) {
      onRecommend([]);
      onRecError?.(e.message || "Error");
    } finally {
      onRecLoading?.(false);
      setLoading(false);
    }
  }

  const handleRegister = async () => {
    const auth = getAdminAuth();
    if (!auth) {
      setAdminOpen(true);
      return;
    }
    await doRegister(auth);
  };

  const confirmAdmin = async ({ username, password }) => {
    // guardamos en memoria 10 min
    setAdminAuth(username, password, 10);
    const auth = getAdminAuth();
    if (!auth) throw new Error("No se pudo guardar sesión admin");
    await doRegister(auth);
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <h3>Registrar Problemas del Paciente</h3>
        <span className="badge">UCA</span>
      </div>

      <label>Nombre del Paciente</label>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Juan Pérez" />

      <label>Edad (opcional)</label>
      <input
        className="input"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="Ej: 30"
        inputMode="numeric"
      />

      <label>Síntomas</label>
      <div className="autocomplete">
        <input
          className="input"
          value={symptoms}
          onChange={(e) => {
            setSymptoms(e.target.value);
            setShowSug(true);
          }}
          onFocus={() => setShowSug(true)}
          placeholder="Ej: fiebre, dolor de cabeza..."
        />

        {showSug && suggestions.length > 0 && (
          <div className="sugBox">
            {suggestions.map((s) => (
              <button key={s} type="button" className="sugItem" onClick={() => pickSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <button className="btnPrimary full" type="button" onClick={handleRegister} disabled={loading}>
        {loading ? "Guardando..." : "Registrar Problema"}
      </button>

      <p className="muted" style={{ marginTop: 10 }}>
        POST requiere admin. La sesión admin dura 10 min (solo memoria).
      </p>

      <AdminAuthModal
        open={adminOpen}
        title="Registrar requiere admin"
        confirmText="Registrar"
        onClose={() => setAdminOpen(false)}
        onConfirm={confirmAdmin}
      />
    </div>
  );
}