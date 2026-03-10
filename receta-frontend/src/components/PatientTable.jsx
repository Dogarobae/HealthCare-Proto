import { useMemo, useState } from "react";
import AdminAuthModal from "./AdminAuthModal";
import { getAdminAuth, setAdminAuth } from "../auth/adminSession";

export default function PatientTable({ patients = [], loading = false, error = "", onRefresh }) {
  const [action, setAction] = useState(null); // { type, patient }
  const [adminOpen, setAdminOpen] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftAge, setDraftAge] = useState("");
  const [draftDiagnosis, setDraftDiagnosis] = useState("");

  const title = useMemo(() => {
    if (!action) return "";
    return action.type === "delete"
      ? `Eliminar paciente #${action.patient.id}`
      : `Editar paciente #${action.patient.id}`;
  }, [action]);

  const confirmText = action?.type === "delete" ? "Eliminar" : "Guardar";

  const openDelete = (patient) => {
    setAction({ type: "delete", patient });
    setAdminOpen(true);
  };

  const openEdit = (patient) => {
    setAction({ type: "edit", patient });
    setDraftName(patient.fullName || "");
    setDraftAge(patient.age != null ? String(patient.age) : "");
    setDraftDiagnosis(patient.diagnosis || "");
    setAdminOpen(true);
  };

  const close = () => {
    setAdminOpen(false);
    setAction(null);
  };

  async function doAction(authHeader) {
    if (!action) return;

    if (action.type === "delete") {
      const res = await fetch(`/api/patients/${action.patient.id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
      });
      if (res.status === 401 || res.status === 403) throw new Error("No autorizado (admin).");
      if (!res.ok) throw new Error("Error eliminando: " + res.status);
      await onRefresh?.();
      return;
    }

    if (action.type === "edit") {
      const fullName = draftName.trim();
      const diagnosis = draftDiagnosis.trim();
      const ageNum = draftAge ? Number(draftAge) : null;

      if (!fullName || !diagnosis) throw new Error("Nombre y síntomas son obligatorios.");

      const res = await fetch(`/api/patients/${action.patient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ fullName, age: ageNum, diagnosis }),
      });
      if (res.status === 401 || res.status === 403) throw new Error("No autorizado (admin).");
      if (!res.ok) throw new Error("Error editando: " + res.status);
      await onRefresh?.();
      return;
    }
  }

  const onConfirmAdmin = async ({ username, password }) => {
    // Cache de admin por 10 min
    setAdminAuth(username, password, 10);
    const auth = getAdminAuth();
    if (!auth) throw new Error("No se pudo iniciar sesión admin");
    await doAction(auth);
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <h3>Problemas Registrados</h3>
        <button className="btnOutline" type="button" onClick={onRefresh}>
          Refrescar
        </button>
      </div>

      {loading && <p className="muted">Cargando pacientes...</p>}
      {!loading && error && <div className="alert error">{error}</div>}

      {!loading && !error && patients.length === 0 && <p className="muted">Aún no hay pacientes registrados.</p>}

      {!loading && !error && patients.length > 0 && (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Síntomas</th>
                <th style={{ width: 210 }}></th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td>
                  <td>{p.fullName}</td>
                  <td className="muted">{p.age ?? "-"}</td>
                  <td className="muted">{p.diagnosis}</td>
                  <td className="actions">
                    <button className="btnOutline" type="button" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button className="btnDanger" type="button" onClick={() => openDelete(p)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* UI de edición inline (antes de confirmar admin) */}
      {adminOpen && action?.type === "edit" && (
        <div style={{ marginTop: 12 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Cambios a guardar (luego confirma admin):
          </div>
          <div className="grid2" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label>Nombre</label>
              <input className="input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            </div>
            <div>
              <label>Edad</label>
              <input className="input" value={draftAge} onChange={(e) => setDraftAge(e.target.value)} />
            </div>
          </div>
          <label>Síntomas</label>
          <input className="input" value={draftDiagnosis} onChange={(e) => setDraftDiagnosis(e.target.value)} />
        </div>
      )}

      <AdminAuthModal
        open={adminOpen}
        title={title}
        confirmText={confirmText}
        onClose={close}
        onConfirm={onConfirmAdmin}
      />
    </div>
  );
}