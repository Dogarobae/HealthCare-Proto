import { useEffect, useState } from "react";

export default function AdminAuthModal({
  open,
  title = "Autenticación admin",
  confirmText = "Continuar",
  onClose,
  onConfirm, // async ({ username, password })
}) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setPassword("");
      setErr("");
      setLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    setErr("");
    setLoading(true);
    try {
      await onConfirm({ username, password });
      onClose?.();
    } catch (e) {
      setErr(e?.message || "No autorizado");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={styles.backdrop} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btnOutline" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>

        {err && <div className="alert error" style={{ marginBottom: 10 }}>{err}</div>}

        <label>Usuario admin</label>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
        />

        <label>Contraseña</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div style={styles.footer}>
          <button className="btnOutline" onClick={onClose} type="button">
            Cancelar
          </button>

          <button
            className="btnPrimary"
            onClick={handleConfirm}
            type="button"
            disabled={loading || !password}
          >
            {loading ? "Validando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(520px, 100%)",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(0,0,0,.2)",
    padding: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
};