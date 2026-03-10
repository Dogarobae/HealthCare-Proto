import { useMemo, useState } from "react";

const SYMPTOMS = [
  "fever",
  "headache",
  "pain",
  "allergy",
  "cough",
  "sore throat",
  "nausea",
  "diarrhea",
  "back pain",
  "migraine",
];

export default function MedicationSearch() {
  const [symptom, setSymptom] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle|loading|done|error
  const [error, setError] = useState("");

  const suggestions = useMemo(() => {
    const q = symptom.trim().toLowerCase();
    if (!q) return [];
    return SYMPTOMS.filter((s) => s.includes(q)).slice(0, 6);
  }, [symptom]);

  const search = async (override) => {
    const q = (override ?? symptom).trim();
    if (!q) return;

    setStatus("loading");
    setError("");
    setItems([]);

    try {
      const res = await fetch(`/api/recommendations?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setStatus("done");

      // guardamos en historial (ver #2)
      saveHistory(q);
    } catch (e) {
      setStatus("error");
      setError(e.message || "Error");
    }
  };

  // ========== 2) Historial (localStorage) ==========
  const HISTORY_KEY = "receta_history";

  const history = useMemo(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [status]); // se refresca al buscar

  const saveHistory = (q) => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const prev = raw ? JSON.parse(raw) : [];
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 8);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setStatus((s) => (s === "idle" ? "idle" : "done")); // fuerza rerender ligero
  };

  return (
    <div style={{ maxWidth: 720, margin: "30px auto", fontFamily: "system-ui" }}>
      <h2>Recomendación por síntoma</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Ej: fever / headache / pain"
            style={{ width: "100%", padding: 10 }}
          />

          {/* Autocomplete */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 42,
                left: 0,
                right: 0,
                border: "1px solid #ddd",
                background: "white",
                borderRadius: 6,
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSymptom(s);
                    search(s);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => search()} disabled={status === "loading"} style={{ padding: "10px 16px" }}>
          {status === "loading" ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* Historial */}
      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ fontSize: 14, opacity: 0.8 }}>Historial:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {history.length === 0 && <span style={{ fontSize: 14, opacity: 0.6 }}>Vacío</span>}
          {history.map((h) => (
            <button
              key={h}
              onClick={() => {
                setSymptom(h);
                search(h);
              }}
              style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #ddd", background: "white" }}
            >
              {h}
            </button>
          ))}
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} style={{ marginLeft: "auto" }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Resultados */}
      <div style={{ marginTop: 16 }}>
        {status === "error" && <div style={{ color: "crimson" }}>Error: {error}</div>}
        {status === "done" && items.length === 0 && <div>No se encontraron medicamentos.</div>}

        {items.length > 0 && (
          <ul>
            {items.map((m, i) => (
              <li key={i}>
                <b>{m.name}</b> {(m.generic || m.function) ? `(${m.generic || m.function})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3) Dosis/advertencias (nota importante) */}
      <div style={{ marginTop: 14, fontSize: 13, opacity: 0.75 }}>
        Nota: para mostrar dosis/advertencias reales necesitamos que el backend incluya esos campos desde OpenFDA.
      </div>
    </div>
  );
}